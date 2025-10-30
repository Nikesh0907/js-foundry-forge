import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'single', label: 'Single choice' },
  { value: 'multi', label: 'Multi choice' },
  { value: 'short', label: 'Short text' },
  { value: 'long', label: 'Long text' },
  { value: 'number', label: 'Number (range)' },
  { value: 'file', label: 'File upload (stub)' },
];

export function AssessmentBuilder({ assessment, onChange }) {
  const addSection = () => {
    const next = {
      ...assessment,
      sections: [
        ...assessment.sections,
        { id: crypto.randomUUID(), title: 'New Section', description: '', questions: [] },
      ],
      updatedAt: new Date().toISOString(),
    };
    onChange(next);
  };

  const removeSection = (id) => {
    const next = {
      ...assessment,
      sections: assessment.sections.filter((s) => s.id !== id),
      updatedAt: new Date().toISOString(),
    };
    onChange(next);
  };

  const updateSection = (id, patch) => {
    const next = {
      ...assessment,
      sections: assessment.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      updatedAt: new Date().toISOString(),
    };
    onChange(next);
  };

  const addQuestion = (sectionId) => {
    const q = {
      id: crypto.randomUUID(),
      type: 'short',
      title: 'New question',
      required: false,
      options: ['Option 1', 'Option 2'],
      min: undefined,
      max: undefined,
      maxLength: 200,
      showIf: null, // {questionId, equals}
    };
    const next = {
      ...assessment,
      sections: assessment.sections.map((s) =>
        s.id === sectionId ? { ...s, questions: [...s.questions, q] } : s
      ),
      updatedAt: new Date().toISOString(),
    };
    onChange(next);
  };

  const removeQuestion = (sectionId, questionId) => {
    const next = {
      ...assessment,
      sections: assessment.sections.map((s) =>
        s.id === sectionId ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) } : s
      ),
      updatedAt: new Date().toISOString(),
    };
    onChange(next);
  };

  const updateQuestion = (sectionId, questionId, patch) => {
    const next = {
      ...assessment,
      sections: assessment.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)),
            }
          : s
      ),
      updatedAt: new Date().toISOString(),
    };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assessment Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={assessment.title}
              onChange={(e) => onChange({ ...assessment, title: e.target.value, updatedAt: new Date().toISOString() })}
              placeholder="Assessment title"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={assessment.description}
              onChange={(e) => onChange({ ...assessment, description: e.target.value, updatedAt: new Date().toISOString() })}
              placeholder="Short description"
            />
          </div>
        </CardContent>
      </Card>

      {assessment.sections.map((section) => (
        <Card key={section.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Section</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={section.description}
                  onChange={(e) => updateSection(section.id, { description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              {section.questions.map((q) => (
                <div key={q.id} className="rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 space-y-2">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Question</label>
                          <Input
                            value={q.title}
                            onChange={(e) => updateQuestion(section.id, q.id, { title: e.target.value })}
                            placeholder="Enter question"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Type</label>
                          <Select value={q.type} onValueChange={(v) => updateQuestion(section.id, q.id, { type: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {QUESTION_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {(q.type === 'single' || q.type === 'multi') && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Options (comma separated)</label>
                          <Input
                            value={q.options.join(', ')}
                            onChange={(e) =>
                              updateQuestion(section.id, q.id, {
                                options: e.target.value
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                          />
                        </div>
                      )}

                      {q.type === 'number' && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Min</label>
                            <Input
                              type="number"
                              value={q.min ?? ''}
                              onChange={(e) => updateQuestion(section.id, q.id, { min: e.target.value === '' ? undefined : Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Max</label>
                            <Input
                              type="number"
                              value={q.max ?? ''}
                              onChange={(e) => updateQuestion(section.id, q.id, { max: e.target.value === '' ? undefined : Number(e.target.value) })}
                            />
                          </div>
                        </div>
                      )}

                      {(q.type === 'short' || q.type === 'long') && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Max length</label>
                          <Input
                            type="number"
                            value={q.maxLength ?? ''}
                            onChange={(e) => updateQuestion(section.id, q.id, { maxLength: e.target.value === '' ? undefined : Number(e.target.value) })}
                          />
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Required</label>
                          <Select
                            value={q.required ? 'yes' : 'no'}
                            onValueChange={(v) => updateQuestion(section.id, q.id, { required: v === 'yes' })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-sm font-medium">Conditional (Show if)</label>
                          <Input
                            placeholder="questionId=answer"
                            value={q.showIf ? `${q.showIf.questionId}=${q.showIf.equals}` : ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (!v) return updateQuestion(section.id, q.id, { showIf: null });
                              const [qid, ans] = v.split('=');
                              updateQuestion(section.id, q.id, { showIf: { questionId: qid?.trim(), equals: (ans ?? '').trim() } });
                            }}
                          />
                          <div className="text-xs text-muted-foreground">Example: q1=Yes</div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(section.id, q.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => addQuestion(section.id)}>
                <Plus className="mr-2 h-4 w-4" /> Add question
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addSection}>
        <Plus className="mr-2 h-4 w-4" /> Add section
      </Button>
    </div>
  );
}


