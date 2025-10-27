import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    recentCandidates: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const [totalJobs, jobs, totalCandidates, candidates] = await Promise.all([
        db.jobs.count(),
        db.jobs.toArray(),
        db.candidates.count(),
        db.candidates.toArray(),
      ]);

      const activeJobs = jobs.filter(j => j.status === 'active').length;
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const recentCandidates = candidates.filter(c => c.createdAt > weekAgo).length;

      setStats({
        totalJobs,
        activeJobs,
        totalCandidates,
        recentCandidates,
      });
    }
    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      description: `${stats.activeJobs} active`,
      icon: Briefcase,
      link: '/jobs',
      gradient: 'from-primary to-accent',
    },
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      description: `${stats.recentCandidates} this week`,
      icon: Users,
      link: '/candidates',
      gradient: 'from-accent to-primary',
    },
    {
      title: 'Active Positions',
      value: stats.activeJobs,
      description: 'Currently hiring',
      icon: TrendingUp,
      link: '/jobs?status=active',
      gradient: 'from-success to-info',
    },
    {
      title: 'Recent Applications',
      value: stats.recentCandidates,
      description: 'Last 7 days',
      icon: Clock,
      link: '/candidates',
      gradient: 'from-warning to-destructive',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome to TalentFlow</h1>
        <p className="text-muted-foreground text-lg">
          Manage your hiring pipeline with ease
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground mb-3">
                {stat.description}
              </p>
              <Button variant="ghost" size="sm" asChild className="w-full group/btn">
                <Link to={stat.link}>
                  View Details
                  <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Create New Job Posting
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/candidates">
                <Users className="mr-2 h-4 w-4" />
                View All Candidates
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/assessments">
                <Clock className="mr-2 h-4 w-4" />
                Manage Assessments
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Create job postings</p>
                <p className="text-sm text-muted-foreground">Add positions you're hiring for</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Review candidates</p>
                <p className="text-sm text-muted-foreground">Track applicants through stages</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Build assessments</p>
                <p className="text-sm text-muted-foreground">Create custom evaluation forms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
