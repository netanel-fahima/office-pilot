interface InsuranceClient {
  id: string; // מזהה ייחודי של הלקוח
  tenantId: string; // מזהה השוכר
  agencyId: string; // מזהה הסוכנות
  status: ClientStatus; // סטטוס הלקוח
  source: ClientSource; // מקור הלקוח
  managerId: string; // מזהה המנהל
  managers: string[]; // רשימת מנהלים
  createdDate: Date; // תאריך יצירה
  createdBy: string; // מזהה יוצר
  creatorName: string; // שם יוצר
  lastModifiedDate: Date; // תאריך שינוי אחרון
  lastModifiedBy: string; // מזהה המעדכן האחרון
  version: number; // מספר גרסה
  sensitive: boolean; // האם המידע רגיש?
  
  personalDetails: PersonalDetails; // פרטים אישיים
  contactDetails: ContactDetails; // פרטי התקשרות
  address: Address; // כתובת מלאה
  maritalStatus: MaritalStatus; // מצב משפחתי
  mailingStatus: MailingStatus; // סטטוס דיוור
  employment: Employment[]; // היסטוריית תעסוקה
  financialStats: FinancialStats; // נתונים פיננסיים
  insurancePolicies: InsurancePolicy[]; // פוליסות ביטוח
  claimHistory: ClaimRecord[]; // היסטוריית תביעות
  paymentDetails: PaymentDetails; // פרטי תשלום
  lastActivityDate: Date; // תאריך פעילות אחרונה
  customerServiceEnabled: boolean; // האם שירות לקוחות פעיל?
  tags: string[]; // תגיות
}

interface ClientStatus {
  id: string;
  name: string;
  isActive: boolean;
}

interface ClientSource {
  id: string;
  name: string;
}

interface PersonalDetails {
  firstName: string;
  lastName: string;
  fullName: string;
  fullNameReverse: string;
  maidenName?: string;
  gender: "male" | "female" | "other";
  birthDate: Date;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  age: string; // פורמט "P56Y7M28D"
  minor: boolean;
  idType: IdType;
  idNumber: string;
  idNumberLocked: boolean;
  idCardIssueDate: Date;
}

interface IdType {
  code: number;
  description: string;
  shortDescription: string;
  obsolete: boolean;
}

interface ContactDetails {
  phoneNumber: string;
  phoneNumberFormatted: string;
  phoneNumberUri: string;
  phoneNumberWhatsAppUri?: string;
  phoneVerified: boolean;
  email: string;
  emailBounce: boolean;
  emailComplaint: boolean;
}

interface Address {
  street: string;
  streetNumber: string;
  city: string;
  postalCode: number;
  fullAddress: string;
}

interface MaritalStatus {
  code: number;
  description: string;
  shortDescription: string;
  obsolete: boolean;
}

interface MailingStatus {
  code: number;
  description: string;
  shortDescription: string;
  order: number;
  obsolete: boolean;
}

interface Employment {
  employer: string;
  position: string;
  startDate: Date;
  endDate?: Date;
}

interface FinancialStats {
  totalSavings: number;
  pensionFund: number;
  compensationFund: number;
  providentFund: number;
  alternativeInvestments: number;
  loanExistence: boolean;
  obligationsExistence: boolean;
  monthlyDeposit: number;
  managementFees: number;
  averageNetReturnPercentStartYear: number;
  estimatedMonthlyPensionWithDeposits: number;
  estimatedMonthlyPensionWithoutDeposits: number;
}

interface InsurancePolicy {
  policyId: string;
  type: "health" | "life" | "auto" | "home" | "travel" | "business";
  provider: string;
  startDate: Date;
  endDate?: Date;
  premiumAmount: number;
  coverageAmount: number;
  status: "active" | "expired" | "pending" | "canceled";
}

interface ClaimRecord {
  claimId: string;
  policyId: string;
  dateFiled: Date;
  amountClaimed: number;
  status: "approved" | "rejected" | "pending";
  reason?: string;
}

interface PaymentDetails {
  paymentMethod: "credit_card" | "bank_transfer" | "paypal";
  cardNumber?: string;
  bankAccountNumber?: string;
  expirationDate?: string;
  billingAddress?: string;
}
