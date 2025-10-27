import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { Job } from '@/types';

const API_BASE = '/api';

// Simulate network delay and occasional errors
async function simulateNetwork() {
  await delay(Math.random() * 1000 + 200); // 200-1200ms delay
  
  // 5-10% error rate on write operations
  if (Math.random() < 0.075) {
    throw new Error('Network error');
  }
}

export const handlers = [
  // Jobs endpoints
  http.get(`${API_BASE}/jobs`, async ({ request }) => {
    await simulateNetwork();
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    let jobs = await db.jobs.toArray();
    
    // Filter
    if (search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }
    
    // Sort by order
    jobs.sort((a, b) => a.order - b.order);
    
    // Paginate
    const total = jobs.length;
    const start = (page - 1) * pageSize;
    const paginatedJobs = jobs.slice(start, start + pageSize);
    
    return HttpResponse.json({
      data: paginatedJobs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  }),

  http.post(`${API_BASE}/jobs`, async ({ request }) => {
    await simulateNetwork();
    
    const body = await request.json() as Partial<Job>;
    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: body.title || '',
      slug: body.slug || '',
      status: body.status || 'active',
      tags: body.tags || [],
      order: body.order || 0,
      description: body.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.jobs.add(newJob);
    return HttpResponse.json(newJob, { status: 201 });
  }),

  http.patch(`${API_BASE}/jobs/:id`, async ({ params, request }) => {
    await simulateNetwork();
    
    const { id } = params;
    const updates = await request.json() as Partial<Job>;
    
    await db.jobs.update(id as string, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    
    const job = await db.jobs.get(id as string);
    return HttpResponse.json(job);
  }),

  http.patch(`${API_BASE}/jobs/:id/reorder`, async ({ params, request }) => {
    await simulateNetwork();
    
    const { id } = params;
    const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number };
    
    // Get all jobs and reorder
    const jobs = await db.jobs.orderBy('order').toArray();
    const job = jobs.find(j => j.id === id);
    
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Remove job from current position
    jobs.splice(fromOrder, 1);
    // Insert at new position
    jobs.splice(toOrder, 0, job);
    
    // Update order for all affected jobs
    const updates = jobs.map((j, index) => ({
      key: j.id,
      changes: { order: index, updatedAt: new Date().toISOString() },
    }));
    
    await db.jobs.bulkUpdate(updates);
    
    return HttpResponse.json({ success: true });
  }),

  // Candidates endpoints
  http.get(`${API_BASE}/candidates`, async ({ request }) => {
    await simulateNetwork();
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');
    
    let candidates = await db.candidates.toArray();
    
    // Filter
    if (search) {
      candidates = candidates.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (stage) {
      candidates = candidates.filter(c => c.stage === stage);
    }
    
    // Paginate
    const total = candidates.length;
    const start = (page - 1) * pageSize;
    const paginatedCandidates = candidates.slice(start, start + pageSize);
    
    return HttpResponse.json({
      data: paginatedCandidates,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  }),

  http.patch(`${API_BASE}/candidates/:id`, async ({ params, request }) => {
    await simulateNetwork();
    
    const { id } = params;
    const updates = await request.json() as Partial<any>;
    
    await db.candidates.update(id as string, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    
    const candidate = await db.candidates.get(id as string);
    return HttpResponse.json(candidate);
  }),

  http.get(`${API_BASE}/candidates/:id/timeline`, async ({ params }) => {
    await simulateNetwork();
    
    const { id } = params;
    const events = await db.timelineEvents
      .where('candidateId')
      .equals(id as string)
      .reverse()
      .sortBy('createdAt');
    
    return HttpResponse.json(events);
  }),
];
