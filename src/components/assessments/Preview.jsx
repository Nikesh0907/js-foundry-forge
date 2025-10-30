import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function shouldShow(question, currentValues) {
  if (!question.showIf) return true;
  const parentVal = currentValues[question.showIf.questionId];
  const target = question.showIf.equals;
  if (Array.isArray(parentVal)) {
    if (target == null || target === '') return parentVal.length > 0;
    return parentVal.includes(target);
  }
  return parentVal === target;
}

export function AssessmentPreview({ assessment, values, onChange }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-b pb-3">
            <div className="text-xl font-semibold">{assessment.title || 'Untitled assessment'}</div>
            {assessment.description && (
              <div className="text-sm text-muted-foreground mt-1">{assessment.description}</div>
            )}
          </div>

          {assessment.sections.map((s, sIdx) => (
            <div key={s.id} className="space-y-3">
              <div className="pt-2">
                <div className="font-semibold text-base">Section {sIdx + 1}: {s.title || 'Untitled section'}</div>
                {s.description && (
                  <div className="text-sm text-muted-foreground">{s.description}</div>
                )}
              </div>
              <div className="grid gap-4">
                {s.questions.map((q, qIdx) => (
                  shouldShow(q, values) && (
                    <div key={q.id} className="space-y-2 border rounded-md p-3">
                      <label className="text-sm font-medium flex items-start">
                        <span className="mr-2 text-muted-foreground">{qIdx + 1}.</span>
                        <span>
                          {q.title} {q.required && <span className="text-destructive">*</span>}
                        </span>
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
                        <div className="space-y-2">
                          {q.options.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={q.id}
                                value={opt}
                                checked={values[q.id] === opt}
                                onChange={() => onChange({ ...values, [q.id]: opt })}
                                className="accent-primary"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'multi' && (
                        <div className="space-y-2">
                          {q.options.map((opt) => {
                            const arr = Array.isArray(values[q.id]) ? values[q.id] : [];
                            const selected = arr.includes(opt);
                            return (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name={`${q.id}-${opt}`}
                                  value={opt}
                                  checked={selected}
                                  onChange={() => {
                                    const next = selected ? arr.filter((v) => v !== opt) : [...arr, opt];
                                    onChange({ ...values, [q.id]: next });
                                  }}
                                  className="accent-primary"
                                />
                                <span>{opt}</span>
                              </label>
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


