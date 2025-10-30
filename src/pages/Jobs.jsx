import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Archive, Briefcase } from 'lucide-react';
import JobForm from '@/components/jobs/JobForm';

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagsFilter, setTagsFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);

  useEffect(() => {
    loadJobs();
  }, [search, statusFilter, tagsFilter, page]);

  async function loadJobs() {
    let results = await db.jobs.toArray();
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(job =>
        job.title.toLowerCase().includes(q) ||
        job.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (tagsFilter) {
      const tokens = tagsFilter.toLowerCase().split(',').map(t => t.trim()).filter(Boolean);
      if (tokens.length) {
        results = results.filter(job => tokens.every(t => job.tags.map(x => x.toLowerCase()).includes(t)));
      }
    }
    if (statusFilter !== 'all') {
      results = results.filter(job => job.status === statusFilter);
    }
    results.sort((a, b) => a.order - b.order);
    setJobs(results);
  }

  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
  const pageJobs = useMemo(() => jobs.slice((page - 1) * pageSize, page * pageSize), [jobs, page]);

  function openCreate() { setEditing(null); setModalOpen(true); }
  function openEdit(job) { setEditing(job); setModalOpen(true); }

  async function toggleArchive(job) {
    const updated = { ...job, status: job.status === 'active' ? 'archived' : 'active', updatedAt: new Date().toISOString() };
    await db.jobs.put(updated);
    setJobs(prev => prev.map(j => j.id === job.id ? updated : j));
  }

  function onDragStart(e, id) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragOver(e, overId) {
    e.preventDefault();
    if (!draggingId || draggingId === overId) return;
    const next = [...jobs].sort((a, b) => a.order - b.order);
    const from = next.findIndex(j => j.id === draggingId);
    const to = next.findIndex(j => j.id === overId);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    next.forEach((j, i) => j.order = i);
    setJobs(next);
    setPendingOrder(next.map(j => ({ id: j.id, order: j.order })));
  }
  async function onDrop() {
    if (!pendingOrder) return;
    const snapshot = await db.jobs.toArray();
    try {
      await db.transaction('rw', db.jobs, async () => {
        for (const { id, order } of pendingOrder) {
          const j = snapshot.find(x => x.id === id);
          if (j) await db.jobs.put({ ...j, order, updatedAt: new Date().toISOString() });
        }
      });
    } catch (e) {
      const original = snapshot.sort((a, b) => a.order - b.order);
      setJobs(original);
    } finally {
      setDraggingId(null);
      setPendingOrder(null);
    }
  }

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Job Openings</h1>
          <p className="text-muted-foreground">
            Manage your active and archived positions
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-accent" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search title or tags..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
            </div>
            <div className="sm:col-span-1">
              <select className="w-full rounded-md border bg-background p-2 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="sm:col-span-1">
              <Input placeholder="Filter tags: react, remote" value={tagsFilter} onChange={(e) => { setTagsFilter(e.target.value); setPage(1); }} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {pageJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No jobs found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            pageJobs.map((job) => (
              <Card key={job.id} draggable onDragStart={(e) => onDragStart(e, job.id)} onDragOver={(e) => onDragOver(e, job.id)} onDrop={onDrop} className="border hover:shadow transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div onClick={() => navigate(`/jobs/${job.id}`)} className="cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {job.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      <Button size="sm" variant="outline" onClick={() => openEdit(job)}>Edit</Button>
                      <Button size="sm" variant={job.status === 'archived' ? 'default' : 'outline'} onClick={() => toggleArchive(job)}>
                        <Archive className="h-4 w-4 mr-1" /> {job.status === 'archived' ? 'Unarchive' : 'Archive'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <JobForm open={modalOpen} onOpenChange={setModalOpen} initialJob={editing} onSaved={() => loadJobs()} />
    </div>
  );
}
