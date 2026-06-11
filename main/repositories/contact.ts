import { Contact } from '../../shared/types/entities';
import { RelationType } from '../../shared/types/enums';
import { getDatabase } from '../database';

const seed: Contact[] = [
  {
    id: 'contact-1',
    name: '林然',
    company: '云启科技',
    position: '前端负责人',
    email: 'linran@example.com',
    phone: '13800000001',
    wechat: 'linran_ref',
    relationType: RelationType.ExColleague,
    tags: ['React', 'SaaS'],
    notes: '前同事，熟悉招聘流程',
    lastContactAt: '2026-06-01'
  },
  {
    id: 'contact-2',
    name: '张子轩',
    company: '蓝鹰互动',
    position: '高级后端工程师',
    email: 'zixuan@example.com',
    phone: '13800000002',
    wechat: 'zixuan_dev',
    relationType: RelationType.Friend,
    tags: ['Node.js', '分布式'],
    notes: '老朋友，跳过多家大厂',
    lastContactAt: '2026-05-28'
  },
  {
    id: 'contact-3',
    name: '王思远',
    company: '星图资本',
    position: '技术合伙人',
    email: 'siyuan@example.com',
    phone: '13800000003',
    wechat: 'siyuan_tech',
    relationType: RelationType.Colleague,
    tags: ['架构', '团队管理'],
    notes: '现同事，技术面把关人',
    lastContactAt: '2026-06-10'
  }
];

export class ContactRepository {
  list(): Contact[] {
    const db = getDatabase();
    const count = db.prepare('SELECT COUNT(*) AS total FROM contacts').get() as { total: number };
    if (count.total === 0) seed.forEach((item) => this.save(item));
    return db.prepare('SELECT * FROM contacts ORDER BY lastContactAt DESC').all().map(this.fromRow);
  }

  save(contact: Contact): Contact {
    getDatabase()
      .prepare(`INSERT OR REPLACE INTO contacts VALUES (@id,@name,@company,@position,@email,@phone,@wechat,@relationType,@tags,@avatar,@notes,@lastContactAt)`)
      .run({ ...contact, tags: JSON.stringify(contact.tags), avatar: contact.avatar ?? '' });
    return contact;
  }

  private fromRow(row: any): Contact {
    return { ...row, tags: JSON.parse(row.tags || '[]') };
  }
}
