import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function shouldShow(question, values) {
  if (!question.showIf) return true;
  return values[question.showIf.questionId] === question.showIf.equals;
}

function validate(assessment, values) {
  const errors = {};
  for (const section of assessment.sections) {
    for (const q of section.questions) {
      if (!shouldShow(q, values)) continue;
      const v = values[q.id];
      if (q.required && (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0))) {
        errors[q.id] = 'This field is required';
        continue;
      }
      if (q.type === 'number') {
        if (v !== '' && v !== undefined && v !== null) {
          const num = Number(v);
          if (Number.isNaN(num)) errors[q.id] = 'Must be a number';
          if (q.min !== undefined && num < q.min) errors[q.id] = `Minimum is ${q.min}`;
          if (q.max !== undefined && num > q.max) errors[q.id] = `Maximum is ${q.max}`;
        }
      }
      if ((q.type === 'short' || q.type === 'long') && q.maxLength && typeof v === 'string') {
        if (v.length > q.maxLength) errors[q.id] = `Max length is ${q.maxLength}`;
      }
    }
  }
  return errors;
}

export function RuntimeForm({ assessment, onSubmit }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(assessment, values);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {assessment.sections.map((s) => (
        <Card key={s.id}>
          <CardContent className="space-y-3 pt-4">
            {s.questions.map((q) => (
              shouldShow(q, values) && (
                <div key={q.id} className="space-y-1">
                  <label className="text-sm font-medium">
                    {q.title} {q.required && <span className="text-destructive">*</span>}
                  </label>
                  {q.type === 'short' && (
                    <Input value={values[q.id] ?? ''} onChange={(e) => setValues({ ...values, [q.id]: e.target.value })} />
                  )}
                  {q.type === 'long' && (
                    <Textarea value={values[q.id] ?? ''} onChange={(e) => setValues({ ...values, [q.id]: e.target.value })} />
                  )}
                  {q.type === 'number' && (
                    <Input
                      type="number"
                      value={values[q.id] ?? ''}
                      onChange={(e) => setValues({ ...values, [q.id]: e.target.value === '' ? '' : Number(e.target.value) })}
                    />
                  )}
                  {q.type === 'single' && (
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`rounded border px-3 py-1 text-sm ${values[q.id] === opt ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                          onClick={() => setValues({ ...values, [q.id]: opt })}
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
                              setValues({ ...values, [q.id]: next });
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
                  {errors[q.id] && <div className="text-xs text-destructive">{errors[q.id]}</div>}
                </div>
              )
            ))}
          </CardContent>
        </Card>
      ))}
      <Button type="submit" className="bg-gradient-to-r from-primary to-accent">Submit</Button>
    </form>
  );
}


