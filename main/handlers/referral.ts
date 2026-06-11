import { ipcMain } from 'electron';
import { CompanyPool, ContactReferral } from '../../shared/types/entities';
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

  const companyMap = new Map<string, ContactReferral[]>();

  contacts.forEach((contact) => {
    const company = contact.company;
    if (!company) return;

    const contactReferral = referrals.find((r) => r.contactId === contact.id) || null;

    if (!companyMap.has(company)) {
      companyMap.set(company, []);
    }
    companyMap.get(company)!.push({
      contact,
      referral: contactReferral
    });
  });

  referrals.forEach((referral) => {
    const existingContact = contacts.find((c) => c.id === referral.contactId);
    if (!existingContact) {
      const company = referral.targetCompany;
      if (!company) return;

      if (!companyMap.has(company)) {
        companyMap.set(company, []);
      }
      const hasEntry = companyMap.get(company)!.some((cr) => cr.referral?.id === referral.id);
      if (!hasEntry) {
        companyMap.get(company)!.push({
          contact: {
            id: referral.contactId,
            name: '未知联系人',
            company,
            position: '',
            email: '',
            phone: '',
            wechat: '',
            relationType: 'other' as any,
            tags: [],
            notes: '',
            lastContactAt: ''
          },
          referral
        });
      }
    }
  });

  const pools: CompanyPool[] = [];
  companyMap.forEach((contactReferrals, companyName) => {
    const referralCount = contactReferrals.filter((cr) => cr.referral !== null).length;
    pools.push({
      companyName,
      contactReferrals,
      referralCount,
      contactCount: contactReferrals.length
    });
  });

  return pools.sort((a, b) => b.referralCount - a.referralCount || b.contactCount - a.contactCount);
}
