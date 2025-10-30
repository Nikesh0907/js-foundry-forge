import { http, delay, HttpResponse } from 'msw';
import { db } from '../db';

const API_DELAY = 300;
const ERROR_RATE = 0.05;

export const handlers = [
  // Jobs endpoints
  http.get('/api/jobs', async () => {
    await delay(API_DELAY);
    if (Math.random() < ERROR_RATE) {
      return new HttpResponse(null, { status: 500 });
    }
    const jobs = await db.jobs.toArray();
    return HttpResponse.json(jobs);
  }),

  http.get('/api/jobs/:id', async ({ params }) => {
    await delay(API_DELAY);
    const job = await db.jobs.get(params.id);
    if (!job) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(job);
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay(API_DELAY);
    const body = await request.json();
    const now = new Date().toISOString();
    const id = body.id || `job-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
    const order = typeof body.order === 'number' ? body.order : (await db.jobs.count());
    const job = {
      id,
      title: body.title,
      slug: body.slug,
      status: body.status || 'active',
      tags: Array.isArray(body.tags) ? body.tags : [],
      order,
      description: body.description || '',
      createdAt: now,
      updatedAt: now,
    };
    await db.jobs.add(job);
    return HttpResponse.json(job, { status: 201 });
  }),

  http.put('/api/jobs/:id', async ({ params, request }) => {
    await delay(API_DELAY);
    const existing = await db.jobs.get(params.id);
    if (!existing) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = await request.json();
    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await db.jobs.put(updated);
    return HttpResponse.json(updated);
  }),

  http.delete('/api/jobs/:id', async ({ params }) => {
    await delay(API_DELAY);
    const existing = await db.jobs.get(params.id);
    if (!existing) {
      return new HttpResponse(null, { status: 404 });
    }
    await db.jobs.delete(params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('/api/jobs/:id/archive', async ({ params }) => {
    await delay(API_DELAY);
    const existing = await db.jobs.get(params.id);
    if (!existing) {
      return new HttpResponse(null, { status: 404 });
    }
    const updated = { ...existing, status: existing.status === 'active' ? 'archived' : 'active', updatedAt: new Date().toISOString() };
    await db.jobs.put(updated);
    return HttpResponse.json(updated);
  }),

  http.patch('/api/jobs/reorder', async ({ request }) => {
    await delay(API_DELAY);
    const body = await request.json();
    const orders = Array.isArray(body) ? body : body?.orders;
    if (!Array.isArray(orders)) {
      return new HttpResponse(null, { status: 400 });
    }
    // orders: [{ id, order }]
    await db.transaction('rw', db.jobs, async () => {
      for (const item of orders) {
        const job = await db.jobs.get(item.id);
        if (job) {
          await db.jobs.put({ ...job, order: item.order, updatedAt: new Date().toISOString() });
        }
      }
    });
    const jobs = await db.jobs.toArray();
    return HttpResponse.json(jobs);
  }),

  // Candidates endpoints
  http.get('/api/candidates', async () => {
    await delay(API_DELAY);
    if (Math.random() < ERROR_RATE) {
      return new HttpResponse(null, { status: 500 });
    }
    const candidates = await db.candidates.toArray();
    return HttpResponse.json(candidates);
  }),

  http.get('/api/candidates/:id', async ({ params }) => {
    await delay(API_DELAY);
    const candidate = await db.candidates.get(params.id);
    if (!candidate) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(candidate);
  }),
  
  http.patch('/api/candidates/:id/stage', async ({ params, request }) => {
    await delay(API_DELAY);
    const existing = await db.candidates.get(params.id);
    if (!existing) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = await request.json();
    if (!body?.stage) {
      return new HttpResponse(null, { status: 400 });
    }
    const updated = { ...existing, stage: body.stage, updatedAt: new Date().toISOString() };
    await db.candidates.put(updated);
    return HttpResponse.json(updated);
  }),
];
