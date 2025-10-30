import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ClipboardList, Save } from 'lucide-react';
import { db } from '@/lib/db';
import { AssessmentBuilder } from '@/components/assessments/Builder';
import { AssessmentPreview } from '@/components/assessments/Preview';
import { RuntimeForm } from '@/components/assessments/RuntimeForm';
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Assessments() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [builder, setBuilder] = useState(null);
  const [previewValues, setPreviewValues] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleResetConfirm = async () => {
    setPreviewValues({});
    if (builder) {
      const now = new Date().toISOString();
      const cleared = { ...builder, title: 'Untitled Assessment', description: '', sections: [], updatedAt: now };
      await db.assessments.put(cleared);
      setBuilder(cleared);
      setAssessments((prev) => {
        const others = prev.filter((x) => x.id !== cleared.id);
        return [...others, cleared];
      });
    }
    setConfirmResetOpen(false);
  };

  useEffect(() => {
    async function load() {
      const [j, a] = await Promise.all([db.jobs.toArray(), db.assessments.toArray()]);
      setJobs(j);
      setAssessments(a);
      if (j.length && !selectedJobId) setSelectedJobId(j[0].id);
    }
    load();
  }, []);

  // Close builder and clear preview when switching job
  useEffect(() => {
    setActiveId(null);
    setBuilder(null);
    setPreviewValues({});
  }, [selectedJobId]);

  const startNew = () => {
    const now = new Date().toISOString();
    const draft = {
      id: `assessment-${crypto.randomUUID()}`,
      jobId: selectedJobId || (jobs[0]?.id ?? ''),
      title: 'New Assessment',
      description: '',
      sections: [],
      createdAt: now,
      updatedAt: now,
    };
    setBuilder(draft);
    setActiveId(draft.id);
    toast({
      title: 'Assessment Draft Created',
      description: 'A new assessment draft was started.'
    });
  };

  const saveAssessment = async () => {
    if (!builder) return;
    await db.assessments.put(builder);
    const a = await db.assessments.where('jobId').equals(builder.jobId).toArray();
    setAssessments((prev) => {
      const others = prev.filter((x) => x.id !== builder.id);
      return [...others, builder];
    });
    toast({
      title: 'Assessment Saved',
      description: 'Assessment was successfully saved.'
    });
  };

  const deleteAssessment = async (assessmentId) => {
    await db.assessments.delete(assessmentId);
    setAssessments((prev) => prev.filter((a) => a.id !== assessmentId));
    if (activeId === assessmentId) {
      setActiveId(null);
      setBuilder(null);
      setPreviewValues({});
    }
    toast({ title: 'Assessment Deleted', description: 'The assessment was removed.' });
  };

  const submitRuntime = async (values) => {
    if (!builder) return;
    const now = new Date().toISOString();
    const resp = {
      id: `resp-${crypto.randomUUID()}`,
      assessmentId: builder.id,
      candidateId: 'candidate-demo',
      values,
      createdAt: now,
    };
    await db.assessmentResponses.add(resp);
    toast({ title: 'Submission Received', description: 'Your assessment response was saved.' });
  };

  const filtered = assessments.filter((a) => (selectedJobId ? a.jobId === selectedJobId : true));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Assessments</h1>
          <p className="text-muted-foreground">Build and preview assessments per job</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className="w-56 bg-background">
              <SelectValue placeholder="Select job" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-gradient-to-r from-primary to-accent" onClick={startNew}>
            <Plus className="mr-2 h-4 w-4" /> Create Assessment
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <div className="text-sm text-muted-foreground">No assessments for this job</div>
              </CardContent>
            </Card>
          ) : (
            filtered
              .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
              .map((a) => (
                <Card key={a.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{a.title}</div>
                        <div className="text-xs text-muted-foreground">Updated {new Date(a.updatedAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setActiveId(a.id); setBuilder(a); }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive" onClick={() => { setToDeleteId(a.id); setConfirmOpen(true); }}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        <div className="lg:col-span-1">
          {builder ? (
            <AssessmentBuilder assessment={builder} onChange={setBuilder} />
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">Select or create an assessment to edit</CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Preview</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setConfirmResetOpen(true)}>Reset</Button>
              <Button onClick={saveAssessment} disabled={!builder}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </div>
          </div>
          <AssessmentPreview assessment={builder ?? { title: '', description: '', sections: [] }} values={previewValues} onChange={setPreviewValues} />
          {builder && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Runtime (example submit)</div>
              <RuntimeForm assessment={builder} onSubmit={submitRuntime} />
            </div>
          )}
        </div>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete assessment?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>This will permanently remove the assessment. This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              className="bg-destructive text-destructive-foreground"
              onClick={async () => {
                if (toDeleteId) {
                  await deleteAssessment(toDeleteId);
                  setToDeleteId(null);
                }
                setConfirmOpen(false);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset assessment?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>This will clear the current draft (title, description, all sections and questions). This cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmResetOpen(false)}>Cancel</Button>
            <Button onClick={handleResetConfirm}>Confirm Reset</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
