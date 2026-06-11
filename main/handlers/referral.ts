import { ipcMain } from 'electron';
import { CompanyPool, Contact, ContactReferral, Referral } from '../../shared/types/entities';
import { ContactRepository } from '../repositories/contact';
import { ReferralRepository } from '../repositories/referral';

export function registerReferralHandlers() {
  const repo = new ReferralRepository();
  const contactRepo = new ContactRepository();
  ipcMain.handle('referrals:list', () => repo.list());
  ipcMain.handle('referrals:save', (_event, referral) => repo.save(referral));
  ipcMain.handle('referrals:pool', () => getCompanyPool(contactRepo, repo));
}

function getCompanyPool(contactRepo: ContactRepository, referralRepo: ReferralRepository): CompanyPool[] {
  const contacts = contactRepo.list();
  const referrals = referralRepo.list();
  const contactMap = new Map<string, Contact>();
  contacts.forEach((c) => contactMap.set(c.id, c));

  const buildUnknownContact = (referral: Referral): Contact => ({
    id: referral.contactId,
    name: '未知联系人',
    company: referral.targetCompany,
    position: '',
    email: '',
    phone: '',
    wechat: '',
    relationType: 'other' as any,
    tags: [],
    notes: '',
    lastContactAt: ''
  });

  const companyMap = new Map<string, ContactReferral[]>();

  referrals.forEach((referral) => {
    const company = referral.targetCompany;
    if (!company) return;

    const contact = contactMap.get(referral.contactId) || buildUnknownContact(referral);

    if (!companyMap.has(company)) {
      companyMap.set(company, []);
    }
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
