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

export default function Assessments() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [builder, setBuilder] = useState(null);
  const [previewValues, setPreviewValues] = useState({});

  useEffect(() => {
    async function load() {
      const [j, a] = await Promise.all([db.jobs.toArray(), db.assessments.toArray()]);
      setJobs(j);
      setAssessments(a);
      if (j.length && !selectedJobId) setSelectedJobId(j[0].id);
    }
    load();
  }, []);

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
  };

  const saveAssessment = async () => {
    if (!builder) return;
    await db.assessments.put(builder);
    const a = await db.assessments.where('jobId').equals(builder.jobId).toArray();
    setAssessments((prev) => {
      const others = prev.filter((x) => x.id !== builder.id);
      return [...others, builder];
    });
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
            <SelectTrigger className="w-56">
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
                <Card key={a.id} className={a.id === activeId ? 'ring-2 ring-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{a.title}</div>
                        <div className="text-xs text-muted-foreground">Updated {new Date(a.updatedAt).toLocaleString()}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => { setActiveId(a.id); setBuilder(a); }}>
                        Edit
                      </Button>
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
              <Button variant="outline" onClick={() => setPreviewValues({})}>Reset</Button>
              <Button onClick={saveAssessment}>
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
    </div>
  );
}
