import { CompanyPool, Contact, Referral } from '../../../shared/types/entities';

export async function invokeIPC<T>(channel: string, payload?: unknown): Promise<T> {
  if (window.referralAPI) {
    return window.referralAPI.invoke<T>(channel, payload);
  }
  return mockInvoke(channel, payload) as T;
}

function buildMockCompanyPool(contacts: Contact[], referrals: Referral[]): CompanyPool[] {
  const contactMap = new Map<string, Contact>();
  contacts.forEach((c) => contactMap.set(c.id, c));

  const companyMap = new Map<string, Array<{ contact: Contact; referral: Referral }>>();

  referrals.forEach((referral) => {
    const company = referral.targetCompany;
    if (!company) return;
    const contact = contactMap.get(referral.contactId) || ({
      id: referral.contactId,
      name: '未知联系人',
      company,
      position: '',
      email: '',
      phone: '',
      wechat: '',
      relationType: 'other',
      tags: [],
      notes: '',
      lastContactAt: ''
    } as Contact);
    if (!companyMap.has(company)) companyMap.set(company, []);
    companyMap.get(company)!.push({ contact, referral });
  });

  const pools: CompanyPool[] = [];
  companyMap.forEach((contactReferrals, companyName) => {
    const uniqueContactIds = new Set(contactReferrals.map((cr) => cr.contact.id));
    pools.push({
      companyName,
      contactReferrals,
      referralCount: contactReferrals.length,
      contactCount: uniqueContactIds.size
    });
  });

  return pools.sort((a, b) => b.referralCount - a.referralCount || b.contactCount - a.contactCount);
}

async function mockInvoke(channel: string, payload?: unknown) {
  if (channel === 'referrals:pool') {
    const contacts = JSON.parse(localStorage.getItem('mock:contacts:list') || '[]');
    const referrals = JSON.parse(localStorage.getItem('mock:referrals:list') || '[]');
    return buildMockCompanyPool(contacts, referrals);
  }
  const storeKey = `mock:${channel}`;
  if (channel.endsWith(':save')) {
    const listChannel = channel.replace(':save', ':list');
    const current = JSON.parse(localStorage.getItem(`mock:${listChannel}`) || '[]');
    const next = current.filter((item: any) => item.id !== (payload as any).id).concat(payload);
    localStorage.setItem(`mock:${listChannel}`, JSON.stringify(next));
    return payload;
  }
  const existing = localStorage.getItem(storeKey);
  if (existing) return JSON.parse(existing);
  return [];
}
