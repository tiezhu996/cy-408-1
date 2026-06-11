import { CompanyPool, Contact, GraphNode, Referral, Reminder } from './entities';

export interface IPCSchema {
  'contacts:list': () => Promise<Contact[]>;
  'contacts:save': (contact: Contact) => Promise<Contact>;
  'referrals:list': () => Promise<Referral[]>;
  'referrals:save': (referral: Referral) => Promise<Referral>;
  'referrals:pool': () => Promise<CompanyPool[]>;
  'graph:list': () => Promise<GraphNode[]>;
  'graph:save': (node: GraphNode) => Promise<GraphNode>;
  'reminders:list': () => Promise<Reminder[]>;
  'reminders:save': (reminder: Reminder) => Promise<Reminder>;
}
