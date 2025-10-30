import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, ClipboardList, Zap, Shield, TrendingUp, ArrowRight } from 'lucide-react';

export default function GetStarted() {
  const features = [
    {
      icon: Briefcase,
      title: 'Job Management',
      description: 'Create, edit, and manage job postings with ease',
    },
    {
      icon: Users,
      title: 'Candidate Tracking',
      description: 'Track candidates through every stage of the hiring process',
    },
    {
      icon: ClipboardList,
      title: 'Assessments',
      description: 'Build and manage assessments for candidate evaluation',
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Get insights into your hiring process and candidate pipeline',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TalentFlow
              </h1>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/login">Login</Link>
          </Button>
        </header>

        {/* Hero Section */}
        <main className="flex flex-1 flex-col items-center justify-center gap-8 py-12 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span>Streamline Your Hiring Process</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Find the Best
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {' '}Talent{' '}
              </span>
              for Your Team
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              A comprehensive HR platform to manage jobs, track candidates, and streamline
              your hiring workflow all in one place.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent">
              <Link to="/login">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Login as HR</Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-2">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-left">{feature.title}</CardTitle>
                    <CardDescription className="text-left">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 TalentFlow. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

