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

  // Seed a few Assessments for the first couple of jobs
  const now = new Date().toISOString();
  const sampleAssessments = [];
  const targetJobs = jobs.slice(0, 3); // first 3 jobs

  for (const job of targetJobs) {
    const a1 = {
      id: `assessment-${job.id}-1`,
      jobId: job.id,
      title: `${job.title} - Screening Quiz`,
      description: `Initial screening for ${job.title}.`,
      sections: [
        {
          id: `sec-${job.id}-1`,
          title: 'Basics',
          description: 'General information',
          questions: [
            { id: `q-${job.id}-1`, type: 'single', title: 'Are you eligible to work?', required: true, options: ['Yes', 'No'], maxLength: 100, min: undefined, max: undefined, showIf: null },
            { id: `q-${job.id}-2`, type: 'short', title: 'Current Location', required: true, options: [], maxLength: 100, min: undefined, max: undefined, showIf: null },
            { id: `q-${job.id}-3`, type: 'number', title: 'Years of Experience', required: true, options: [], min: 0, max: 40, maxLength: undefined, showIf: null },
            { id: `q-${job.id}-4`, type: 'multi', title: 'Primary Skills', required: true, options: ['React', 'Node.js', 'Python', 'AWS', 'SQL'], maxLength: undefined, min: undefined, max: undefined, showIf: null },
            { id: `q-${job.id}-5`, type: 'long', title: 'Why are you a good fit?', required: false, options: [], maxLength: 600, min: undefined, max: undefined, showIf: null },
            // Simple Yes/No gating example
            { id: `q-${job.id}-yn1`, type: 'single', title: 'Have you used databases before?', required: true, options: ['Yes', 'No'], maxLength: undefined, min: undefined, max: undefined, showIf: null },
            { id: `q-${job.id}-yn2`, type: 'short', title: 'Which database did you use most recently?', required: false, options: [], maxLength: 120, min: undefined, max: undefined, showIf: { questionId: `q-${job.id}-yn1`, equals: 'Yes' } },
          ],
        },
        {
          id: `sec-${job.id}-2`,
          title: 'Additional',
          description: '',
          questions: [
            { id: `q-${job.id}-6`, type: 'single', title: 'Open to Relocation?', required: true, options: ['Yes', 'No'], maxLength: undefined, min: undefined, max: undefined, showIf: null },
            { id: `q-${job.id}-7`, type: 'short', title: 'Notice Period (weeks)', required: true, options: [], maxLength: 10, min: undefined, max: undefined, showIf: null },
            { id: `q-${job.id}-8`, type: 'file', title: 'Portfolio (stub)', required: false, options: [], maxLength: undefined, min: undefined, max: undefined, showIf: null },
            { id: `q-${job.id}-9`, type: 'single', title: 'Have you used TypeScript?', required: false, options: ['Yes', 'No'], maxLength: undefined, min: undefined, max: undefined, showIf: null },
            { id: `q-${job.id}-10`, type: 'short', title: 'If Yes, years with TS', required: false, options: [], maxLength: 5, min: undefined, max: undefined, showIf: { questionId: `q-${job.id}-9`, equals: 'Yes' } },
          ],
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const a2 = {
      id: `assessment-${job.id}-2`,
      jobId: job.id,
      title: `${job.title} - Technical`,
      description: 'Deeper technical questions.',
      sections: [
        {
          id: `sec-${job.id}-3`,
          title: 'Technical Section',
          description: '',
          questions: [
            { id: `q-${job.id}-11`, type: 'multi', title: 'Select databases you used', required: false, options: ['Postgres', 'MySQL', 'MongoDB', 'SQLite'], maxLength: undefined, min: undefined, max: undefined, showIf: null },
            { id: `q-${job.id}-12`, type: 'number', title: 'Rate your React skills (1-10)', required: true, options: [], min: 1, max: 10, maxLength: undefined, showIf: null },
            { id: `q-${job.id}-13`, type: 'long', title: 'Describe a technical challenge you solved', required: true, options: [], maxLength: 800, min: undefined, max: undefined, showIf: null },
          ],
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    sampleAssessments.push(a1, a2);
  }

  if (sampleAssessments.length) {
    await db.assessments.bulkAdd(sampleAssessments);
  }

  console.log('Database seeded successfully!');
  console.log(`Created ${jobs.length} jobs, ${candidates.length} candidates, and ${sampleAssessments.length} assessments`);
}
