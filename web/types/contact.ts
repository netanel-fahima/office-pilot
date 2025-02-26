export interface Contact {
  tenantId: string;
  agencyId: string;
  createdDate: string;
  lastModifiedDate: string;
  version: number;
  id: string;
  employerId: string;
  employerName: string;
  firstName: string;
  fullName: string;
  phoneNumber2: string;
  emails: string[];
  customFields: any[];
  editable: boolean;
  deletable: boolean;
}
