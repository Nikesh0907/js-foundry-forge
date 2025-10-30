import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Mail, Phone, Users as UsersIcon, Layout } from 'lucide-react';

export default function Candidates() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('all');
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const rowHeight = 84; // approx card height
  const viewportHeight = 600;

  useEffect(() => {
    loadCandidates();
  }, [search, stage]);

  async function loadCandidates() {
    let results = await db.candidates.toArray();
    if (stage !== 'all') {
      results = results.filter(c => c.stage === stage);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(c =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }
    setCandidates(results);
  }

  const total = candidates.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 5);
  const endIndex = Math.min(total, Math.ceil((scrollTop + viewportHeight) / rowHeight) + 5);
  const visible = candidates.slice(startIndex, endIndex);
  const paddingTop = startIndex * rowHeight;
  const paddingBottom = Math.max(0, (total - endIndex) * rowHeight);

  const getStageColor = (stage) => {
    const colors = {
      applied: 'bg-blue-500/10 text-blue-500',
      screen: 'bg-purple-500/10 text-purple-500',
      tech: 'bg-orange-500/10 text-orange-500',
      offer: 'bg-green-500/10 text-green-500',
      hired: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
    };
    return colors[stage] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Candidates</h1>
        <p className="text-muted-foreground">
          View and manage all applicants
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screen">Screen</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button asChild variant="outline">
                <Link to="/candidates/board">
                  <Layout className="mr-2 h-4 w-4" /> Board
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No candidates found</p>
            </div>
          ) : (
            <div
              ref={containerRef}
              onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
              className="relative max-h-[70vh] overflow-auto"
              style={{ minHeight: `${Math.min(viewportHeight, total * rowHeight)}px` }}
            >
              <div style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }} className="grid gap-3">
              {visible.map((candidate) => (
                <Card 
                  key={candidate.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-semibold">{candidate.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {candidate.email}
                              </span>
                              {candidate.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {candidate.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStageColor(candidate.stage)}>
                        {candidate.stage}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
