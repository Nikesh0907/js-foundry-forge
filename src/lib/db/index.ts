import Dexie, { Table } from 'dexie';
import { Job, Candidate, Assessment, AssessmentResponse, TimelineEvent, Note } from '@/types';

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment>;
  assessmentResponses!: Table<AssessmentResponse>;
  timelineEvents!: Table<TimelineEvent>;
  notes!: Table<Note>;

  constructor() {
    super('TalentFlowDB');
    
    this.version(1).stores({
      jobs: 'id, slug, status, order',
      candidates: 'id, email, stage, jobId',
      assessments: 'id, jobId',
      assessmentResponses: 'id, assessmentId, candidateId',
      timelineEvents: 'id, candidateId, createdAt',
      notes: 'id, candidateId, createdAt',
    });
  }
}

export const db = new TalentFlowDB();
