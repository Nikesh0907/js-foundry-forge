import { db } from './index';

const JOB_TITLES = [
  'Senior Frontend Engineer',
  'Backend Developer',
  'Full Stack Engineer',
  'DevOps Engineer',
  'Product Manager',
  'UX Designer',
  'Data Scientist',
  'Mobile Developer',
  'QA Engineer',
  'Technical Writer',
  'Solutions Architect',
  'Security Engineer',
  'Machine Learning Engineer',
  'Engineering Manager',
  'Site Reliability Engineer',
];

const TAGS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 
  'Remote', 'Full-time', 'Senior', 'Mid-level', 'Junior',
  'Design', 'Backend', 'Frontend', 'DevOps', 'AI/ML'
];

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Drew', 'Quinn',
  'Avery', 'Parker', 'Skylar', 'Cameron', 'Reese', 'Dakota', 'Sage', 'River'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'
];

const STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export async function seedDatabase() {
  // Check if already seeded
  const existingJobs = await db.jobs.count();
  if (existingJobs > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database...');

  // Seed Jobs
  const jobs = [];
  for (let i = 0; i < 25; i++) {
    const title = JOB_TITLES[i % JOB_TITLES.length] + (i >= JOB_TITLES.length ? ` ${Math.floor(i / JOB_TITLES.length) + 1}` : '');
    const job = {
      id: `job-${i + 1}`,
      title,
      slug: generateSlug(title) + (i >= JOB_TITLES.length ? `-${Math.floor(i / JOB_TITLES.length) + 1}` : ''),
      status: Math.random() > 0.3 ? 'active' : 'archived',
      tags: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => 
        TAGS[Math.floor(Math.random() * TAGS.length)]
      ).filter((v, i, a) => a.indexOf(v) === i),
      order: i,
      description: `We are looking for a talented ${title} to join our growing team.`,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    jobs.push(job);
  }
  await db.jobs.bulkAdd(jobs);

  // Seed Candidates
  const candidates = [];
  for (let i = 0; i < 1000; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const candidate = {
      id: `candidate-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      stage: STAGES[Math.floor(Math.random() * STAGES.length)],
      jobId: jobs[Math.floor(Math.random() * jobs.length)].id,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    candidates.push(candidate);
  }
  await db.candidates.bulkAdd(candidates);

  console.log('Database seeded successfully!');
  console.log(`Created ${jobs.length} jobs and ${candidates.length} candidates`);
}
