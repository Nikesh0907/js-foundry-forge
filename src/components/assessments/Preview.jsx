import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function shouldShow(question, currentValues) {
  if (!question.showIf) return true;
  return currentValues[question.showIf.questionId] === question.showIf.equals;
}

export function AssessmentPreview({ assessment, values, onChange }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-xl font-semibold">{assessment.title || 'Untitled assessment'}</div>
            {assessment.description && (
              <div className="text-sm text-muted-foreground">{assessment.description}</div>
            )}
          </div>

          {assessment.sections.map((s) => (
            <div key={s.id} className="space-y-3">
              <div>
                <div className="font-medium">{s.title}</div>
                {s.description && (
                  <div className="text-sm text-muted-foreground">{s.description}</div>
                )}
              </div>
              <div className="grid gap-3">
                {s.questions.map((q) => (
                  shouldShow(q, values) && (
                    <div key={q.id} className="space-y-1">
                      <label className="text-sm font-medium">
                        {q.title} {q.required && <span className="text-destructive">*</span>}
                      </label>
                      {q.type === 'short' && (
                        <Input
                          value={values[q.id] ?? ''}
                          onChange={(e) => onChange({ ...values, [q.id]: e.target.value })}
                        />
                      )}
                      {q.type === 'long' && (
                        <Textarea
                          value={values[q.id] ?? ''}
                          onChange={(e) => onChange({ ...values, [q.id]: e.target.value })}
                        />
                      )}
                      {q.type === 'number' && (
                        <Input
                          type="number"
                          value={values[q.id] ?? ''}
                          onChange={(e) => onChange({ ...values, [q.id]: e.target.value === '' ? '' : Number(e.target.value) })}
                        />
                      )}
                      {q.type === 'single' && (
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              className={`rounded border px-3 py-1 text-sm ${values[q.id] === opt ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                              onClick={() => onChange({ ...values, [q.id]: opt })}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                      {q.type === 'multi' && (
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt) => {
                            const arr = Array.isArray(values[q.id]) ? values[q.id] : [];
                            const selected = arr.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                className={`rounded border px-3 py-1 text-sm ${selected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                onClick={() => {
                                  const next = selected ? arr.filter((v) => v !== opt) : [...arr, opt];
                                  onChange({ ...values, [q.id]: next });
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {q.type === 'file' && (
                        <div className="text-sm text-muted-foreground">File upload stub (not stored)</div>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


