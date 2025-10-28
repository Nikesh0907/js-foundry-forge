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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidate();
    loadTimeline();
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
      // Simulate timeline data from candidate history
      const timelineData = [
        {
          id: 1,
          action: 'Applied',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          description: 'Candidate submitted application for this role'
        },
        {
          id: 2,
          action: 'Screened',
          date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          description: 'Application reviewed and passed initial screening'
        },
        {
          id: 3,
          action: 'Technical Interview',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          description: 'Completed technical assessment with score: 85%'
        }
      ];
      setTimeline(timelineData);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
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
                {timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-2 w-2 rounded-full ${getStageColor(event.action.toLowerCase())}`} />
                      {index < timeline.length - 1 && (
                        <div className="h-full w-0.5 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold capitalize">{event.action}</h4>
                        <span className="text-xs text-muted-foreground">
                          {event.date.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
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
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                Move to Next Stage
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Schedule Interview
              </Button>
              <Button variant="destructive" className="w-full" size="sm">
                Reject Candidate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

