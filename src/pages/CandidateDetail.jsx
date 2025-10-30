import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidate();
    loadTimeline();
    loadNotes();
  }, [id]);

  async function loadCandidate() {
    try {
      const candidateData = await db.candidates.get(id);
      if (!candidateData) {
        navigate('/candidates');
        return;
      }
      setCandidate(candidateData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load candidate:', error);
      navigate('/candidates');
    }
  }

  async function loadTimeline() {
    try {
      const events = await db.timelineEvents.where('candidateId').equals(id).toArray();
      events.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setTimeline(events);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
  }

  async function loadNotes() {
    try {
      const list = await db.notes.where('candidateId').equals(id).toArray();
      list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setNotes(list);
    } catch (e) {
      console.error('Failed to load notes', e);
    }
  }

  async function addNote() {
    const text = noteText.trim();
    if (!text) return;
    const note = {
      id: `note-${crypto.randomUUID()}`,
      candidateId: id,
      createdAt: new Date().toISOString(),
      text,
    };
    await db.notes.add(note);
    setNotes((prev) => [note, ...prev]);
    setNoteText('');
  }

  const getStageColor = (stage) => {
    const colors = {
      applied: 'bg-blue-500',
      screen: 'bg-yellow-500',
      tech: 'bg-purple-500',
      offer: 'bg-green-500',
      hired: 'bg-emerald-500',
      rejected: 'bg-red-500',
    };
    return colors[stage] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!candidate) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/candidates')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{candidate.name}</CardTitle>
                  <p className="text-muted-foreground mt-1">{candidate.email}</p>
                </div>
                <Badge className={`${getStageColor(candidate.stage)} text-white capitalize`}>
                  {candidate.stage}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{candidate.phone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{candidate.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Applied {new Date(candidate.appliedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No timeline events yet</div>
                ) : (
                  timeline.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-2 w-2 rounded-full ${getStageColor((event.to || event.type || '').toLowerCase())}`} />
                        {index < timeline.length - 1 && (
                          <div className="h-full w-0.5 bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold capitalize">{event.type?.replace('_', ' ') || 'event'}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description || ''}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Candidate ID</div>
                <div className="text-sm font-mono">{candidate.id}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Job Applied</div>
                <div className="text-sm">{candidate.jobTitle || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Stage</div>
                <Badge className={`${getStageColor(candidate.stage)} text-white capitalize mt-1`}>
                  {candidate.stage}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Applied Date</div>
                <div className="text-sm">
                  {new Date(candidate.appliedAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note. Use @name to mention."
                className="w-full rounded-md border bg-background p-2 text-sm"
                rows={3}
              />
              <Button size="sm" className="w-full" onClick={addNote}>Add Note</Button>
              <div className="space-y-3">
                {notes.map((n) => (
                  <div key={n.id} className="rounded-md border p-2 text-sm">
                    <div className="text-xs text-muted-foreground mb-1">{new Date(n.createdAt).toLocaleString()}</div>
                    <div>
                      {n.text.split(/(@\w+)/g).map((part, idx) => (
                        part.startsWith('@') ? (
                          <span key={idx} className="text-primary font-medium">{part}</span>
                        ) : (
                          <span key={idx}>{part}</span>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

