interface Employer {
  id: string; // מזהה ייחודי של המעסיק
  tenantId: string; // מזהה השוכר
  agencyId: string; // מזהה הסוכנות
  name: string; // שם המעסיק
  registrationNumber?: string; // מספר רישום חברה (אם יש)
  taxId?: string; // מספר עוסק מורשה או ח.פ
  idType: IdType; // סוג מזהה (ח.פ, עוסק מורשה וכו')
  idNumber: string; // מספר מזהה (ח.פ / עוסק מורשה)
  industry: string; // תחום עיסוק
  phoneNumber?: string; // מספר טלפון
  email?: string; // כתובת אימייל
  website?: string; // אתר אינטרנט
  appMailAddress?: string; // כתובת מייל פנימית לשימוש באפליקציה

  address: Address; // כתובת העסק
  contactPerson?: ContactPerson; // איש קשר ראשי
  clients: InsuranceClient[]; // רשימת לקוחות המשויכים למעסיק

  createdDate: Date; // תאריך יצירה
  createdBy?: string; // מזהה היוצר
  lastModifiedDate: Date; // תאריך שינוי אחרון
  lastModifiedBy?: string; // מזהה המעדכן האחרון
  lastActivityDate: Date; // תאריך פעילות אחרונה
  version: number; // גרסת הנתונים

  status: EmployerStatus; // סטטוס המעסיק
  payrollProvider?: string; // ספק שירותי שכר
  pensionFundProvider?: string; // ספק קרן פנסיה
  insuranceProvider?: string; // חברת ביטוח לעובדים
  agreements: EmployerAgreement[]; // הסכמים מול חברות ביטוח / פנסיה

  tags: string[]; // תגיות הקשורות למעסיק
  customFields: Record<string, any>; // שדות מותאמים אישית
}

interface IdType {
  code: number;
  description: string;
  shortDescription: string;
  obsolete: boolean;
}

interface Address {
  street?: string;
  streetNumber?: string;
  city?: string;
  postalCode?: number;
  country?: string;
}

interface ContactPerson {
  name: string;
  phoneNumber: string;
  email: string;
  position?: string; // תפקיד (לדוגמה: מנהל משאבי אנוש)
}

interface EmployerStatus {
  id: string;
  name: string;
  isActive: boolean;
}

interface EmployerAgreement {
  agreementId: string;
  provider: string; // שם חברת הביטוח או קרן הפנסיה
  startDate: Date;
  endDate?: Date;
  coverageDetails: string; // פירוט הכיסוי הביטוחי
}
