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
];
