/**
 * Core application types for VICO
 */

export interface UserSession {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  source: 'clerk' | 'legacy';
}

export interface WizardData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  orgName: string;
  orgWebsite: string;
  orgSize: string;
  hqCountry: string;
  companyDescription: string;
  productsServices: string;
  industry?: string;
  competitors: Array<{
    name: string;
    industry?: string;
    similarity?: number;
    selected?: boolean;
  }>;
  [key: string]: any;
}
