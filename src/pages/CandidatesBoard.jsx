import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from "@/components/ui/use-toast";

const STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

export default function CandidatesBoard() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const items = await db.candidates.toArray();
    setCandidates(items);
  }

  const grouped = Object.fromEntries(STAGES.map((s) => [s, []]));
  for (const c of candidates) {
    (grouped[c.stage] ?? grouped['applied']).push(c);
  }

  function getStageStyles(stage) {
    const map = {
      applied: 'bg-blue-500/10 text-blue-500',
      screen: 'bg-purple-500/10 text-purple-500',
      tech: 'bg-orange-500/10 text-orange-500',
      offer: 'bg-green-500/10 text-green-500',
      hired: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
    };
    return map[stage] || 'bg-muted text-muted-foreground';
  }

  async function moveCandidate(id, toStage) {
    const c = await db.candidates.get(id);
    if (!c || c.stage === toStage) return;
    const prevStage = c.stage;
    await db.candidates.put({ ...c, stage: toStage, updatedAt: new Date().toISOString() });
    await db.timelineEvents.add({
      id: `evt-${crypto.randomUUID()}`,
      candidateId: c.id,
      createdAt: new Date().toISOString(),
      type: 'stage_change',
      from: prevStage,
      to: toStage,
      description: `Moved from ${prevStage} to ${toStage}`,
    });
    setCandidates((prev) => prev.map((x) => (x.id === id ? { ...x, stage: toStage } : x)));
    toast({
      title: 'Candidate Moved',
      description: `${c.name || 'Candidate'} moved from ${prevStage} to ${toStage}`,
    });
  }

  const handleDrop = (e, stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) moveCandidate(id, stage);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Candidate Board</h1>
        <p className="text-muted-foreground">Drag candidates between stages</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stage) => (
          <Card key={stage} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, stage)} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base capitalize">
                {stage}
                <Badge className={getStageStyles(stage)}>{grouped[stage]?.length ?? 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 min-h-[260px] max-h-[70vh] overflow-auto">
              {(grouped[stage] ?? []).map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
                  className="cursor-grab rounded border bg-card p-3 active:cursor-grabbing shadow-sm hover:shadow transition"
                >
                  <div className="font-medium truncate" title={c.name}>{c.name}</div>
                  <div className="text-xs text-muted-foreground break-words">
                    {c.email}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


