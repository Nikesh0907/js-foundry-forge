import Dexie from 'dexie';

export class TalentFlowDB extends Dexie {
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
