import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/db';

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function JobForm({ open, onOpenChange, initialJob, onSaved }) {
  const isEdit = Boolean(initialJob?.id);
  const [title, setTitle] = useState(initialJob?.title || '');
  const [slug, setSlug] = useState(initialJob?.slug || '');
  const [status, setStatus] = useState(initialJob?.status || 'active');
  const [tags, setTags] = useState((initialJob?.tags || []).join(', '));
  const [description, setDescription] = useState(initialJob?.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(initialJob?.title || '');
      setSlug(initialJob?.slug || '');
      setStatus(initialJob?.status || 'active');
      setTags((initialJob?.tags || []).join(', '));
      setDescription(initialJob?.description || '');
      setError('');
    }
  }, [open, initialJob]);

  useEffect(() => {
    if (!isEdit) setSlug(slugify(title));
  }, [title, isEdit]);

  const parsedTags = useMemo(() => tags.split(',').map(t => t.trim()).filter(Boolean), [tags]);

  async function handleSave() {
    setError('');
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    const s = slug || slugify(title);
    if (!s) {
      setError('Slug is required');
      return;
    }
    setSaving(true);
    try {
      // Unique slug validation
      const existing = await db.jobs.where('slug').equals(s).toArray();
      const conflict = existing.find(j => j.id !== initialJob?.id);
      if (conflict) {
        setError('Slug must be unique');
        return;
      }

      const now = new Date().toISOString();
      if (isEdit) {
        const job = await db.jobs.get(initialJob.id);
        const updated = { ...job, title, slug: s, status, tags: parsedTags, description, updatedAt: now };
        await db.jobs.put(updated);
        onSaved?.(updated);
      } else {
        const count = await db.jobs.count();
        const created = {
          id: `job-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`,
          title,
          slug: s,
          status,
          tags: parsedTags,
          order: count,
          description,
          createdAt: now,
          updatedAt: now,
        };
        await db.jobs.add(created);
        onSaved?.(created);
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Job' : 'Create Job'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Senior Frontend Engineer" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="senior-frontend-engineer" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <select className="w-full rounded-md border bg-background p-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="React, TypeScript, Remote" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {error && <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground" onClick={handleSave} disabled={saving}>              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


