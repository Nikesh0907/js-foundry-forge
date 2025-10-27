import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';

export default function Assessments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Assessments</h1>
          <p className="text-muted-foreground">
            Create and manage job-specific evaluation forms
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-accent">
          <Plus className="mr-2 h-4 w-4" />
          Create Assessment
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assessments yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            Create custom assessment forms with multiple question types to evaluate candidates effectively
          </p>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
