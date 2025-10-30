import { useMemo } from 'react';
import { useState } from 'react';
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
  const [draggingQuestionId, setDraggingQuestionId] = useState(null);
  const [draggingSectionId, setDraggingSectionId] = useState(null);

  const onQuestionDragStart = (e, sectionId, questionId) => {
    setDraggingQuestionId(questionId);
    setDraggingSectionId(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', questionId);
  };

  const onQuestionDragOver = (e, sectionId, overQuestionId) => {
    e.preventDefault();
    if (!draggingQuestionId || draggingSectionId !== sectionId || draggingQuestionId === overQuestionId) return;
    const next = { ...assessment };
    const secIdx = next.sections.findIndex((s) => s.id === sectionId);
    if (secIdx === -1) return;
    const questions = [...next.sections[secIdx].questions];
    const from = questions.findIndex((q) => q.id === draggingQuestionId);
    const to = questions.findIndex((q) => q.id === overQuestionId);
    if (from === -1 || to === -1) return;
    const [moved] = questions.splice(from, 1);
    questions.splice(to, 0, moved);
    next.sections[secIdx] = { ...next.sections[secIdx], questions };
    next.updatedAt = new Date().toISOString();
    onChange(next);
  };

  const onQuestionDrop = () => {
    setDraggingQuestionId(null);
    setDraggingSectionId(null);
  };

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
                <div
                  key={q.id}
                  className="rounded-lg border p-3"
                  draggable
                  onDragStart={(e) => onQuestionDragStart(e, section.id, q.id)}
                  onDragOver={(e) => onQuestionDragOver(e, section.id, q.id)}
                  onDrop={onQuestionDrop}
                >
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
                          <label className="text-sm font-medium">Options</label>
                          <div className="space-y-2">
                            {q.options.map((option, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                {q.type === 'single' ? (
                                  <input type="radio" disabled className="accent-primary" />
                                ) : (
                                  <input type="checkbox" disabled className="accent-primary" />
                                )}
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const next = [...q.options];
                                    next[idx] = e.target.value;
                                    updateQuestion(section.id, q.id, { options: next });
                                  }}
                                  className="flex-1"
                                  placeholder={`Option ${idx + 1}`}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const next = q.options.filter((_, i) => i !== idx);
                                    updateQuestion(section.id, q.id, { options: next.length ? next : [''] });
                                  }}
                                  aria-label="Remove option"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuestion(section.id, q.id, { options: [...q.options, ""] })}
                            >
                              <Plus className="mr-2 h-4 w-4" /> Add option
                            </Button>
                          </div>
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
                          {/* Parent question selector (single-choice only) */}
                          {(() => {
                            const allQuestions = assessment.sections.flatMap((sec) =>
                              sec.questions.map((qq) => ({ ...qq, sectionId: sec.id }))
                            );
                            const eligibleParents = allQuestions.filter((pq) => pq.id !== q.id && (pq.type === 'single' || pq.type === 'multi'));
                            const selectedParent = eligibleParents.find((pq) => pq.id === q.showIf?.questionId) || null;
                            return (
                              <div className="grid gap-2 sm:grid-cols-2">
                                <div>
                                  <Select
                                    value={q.showIf?.questionId || ''}
                                    onValueChange={(val) => {
                                      const nextParent = eligibleParents.find((pq) => pq.id === val) || null;
                                      updateQuestion(section.id, q.id, {
                                        showIf: nextParent ? { questionId: nextParent.id, equals: '' } : null,
                                      });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={eligibleParents.length ? 'Select parent question' : 'No eligible parent'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {eligibleParents.map((pq) => (
                                        <SelectItem key={pq.id} value={pq.id}>
                                          {pq.title.slice(0, 60)}{pq.title.length > 60 ? '…' : ''}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Select
                                    value={q.showIf?.equals || ''}
                                    onValueChange={(val) => {
                                      if (!selectedParent) return;
                                      updateQuestion(section.id, q.id, {
                                        showIf: { questionId: selectedParent.id, equals: val },
                                      });
                                    }}
                                    disabled={!selectedParent}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={selectedParent ? 'Select answer' : 'Choose parent first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(selectedParent?.options || []).map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            );
                          })()}
                          <div className="text-xs text-muted-foreground">Show this question only when the parent equals the selected answer.</div>
                          {q.showIf && (
                            <div className="pt-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuestion(section.id, q.id, { showIf: null })}
                              >
                                Clear condition
                              </Button>
                            </div>
                          )}
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


