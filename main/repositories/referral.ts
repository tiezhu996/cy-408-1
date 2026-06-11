import { Referral } from '../../shared/types/entities';
import { ReferralStatus } from '../../shared/types/enums';
import { getDatabase } from '../database';

const seed: Referral[] = [
  {
    id: 'referral-1',
    contactId: 'contact-1',
    targetCompany: '云启科技',
    targetPosition: '高级前端工程师',
    status: ReferralStatus.Interviewing,
    requestDate: '2026-06-03',
    feedback: [{ date: '2026-06-05', content: '简历已递交，等待二面安排' }]
  },
  {
    id: 'referral-2',
    contactId: 'contact-1',
    targetCompany: '字节跳动',
    targetPosition: '前端架构师',
    status: ReferralStatus.Submitted,
    requestDate: '2026-06-08',
    feedback: [{ date: '2026-06-09', content: 'HR已收简历，约下周初筛' }]
  },
  {
    id: 'referral-3',
    contactId: 'contact-2',
    targetCompany: '字节跳动',
    targetPosition: '后端专家',
    status: ReferralStatus.Passed,
    requestDate: '2026-05-20',
    feedback: [
      { date: '2026-05-22', content: '简历通过，安排技术面' },
      { date: '2026-06-02', content: '已通过三面，等待offer' }
    ]
  },
  {
    id: 'referral-4',
    contactId: 'contact-2',
    targetCompany: '云启科技',
    targetPosition: '技术总监',
    status: ReferralStatus.Requested,
    requestDate: '2026-06-10',
    feedback: []
  },
  {
    id: 'referral-5',
    contactId: 'contact-3',
    targetCompany: '星图资本',
    targetPosition: '投后技术顾问',
    status: ReferralStatus.Onboarded,
    requestDate: '2026-04-15',
    feedback: [{ date: '2026-05-01', content: '已入职一个月，反馈良好' }]
  }
];

export class ReferralRepository {
  list(): Referral[] {
    const db = getDatabase();
    const count = db.prepare('SELECT COUNT(*) AS total FROM referrals').get() as { total: number };
    if (count.total === 0) seed.forEach((item) => this.save(item));
    return db.prepare('SELECT * FROM referrals ORDER BY requestDate DESC').all().map(this.fromRow);
  }

  save(referral: Referral): Referral {
    getDatabase()
      .prepare(`INSERT OR REPLACE INTO referrals VALUES (@id,@contactId,@targetCompany,@targetPosition,@status,@requestDate,@resumePath,@feedback)`)
      .run({ ...referral, resumePath: referral.resumePath ?? '', feedback: JSON.stringify(referral.feedback) });
    return referral;
  }

  private fromRow(row: any): Referral {
    return { ...row, feedback: JSON.parse(row.feedback || '[]') };
  }
}
