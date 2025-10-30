import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function shouldShow(question, values) {
  if (!question.showIf) return true;
  const parentVal = values[question.showIf.questionId];
  const target = question.showIf.equals;
  if (Array.isArray(parentVal)) {
    if (target == null || target === '') return parentVal.length > 0;
    return parentVal.includes(target);
  }
  return parentVal === target;
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
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={values[q.id] === opt}
                            onChange={() => setValues({ ...values, [q.id]: opt })}
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
                                setValues({ ...values, [q.id]: next });
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


