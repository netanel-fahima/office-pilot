interface SystemUser {
  id: string; // מזהה ייחודי של המשתמש
  tenantId: string; // מזהה השוכר (Tenant)
  agencyId: string; // מזהה הסוכנות
  firstName: string; // שם פרטי
  lastName: string; // שם משפחה
  fullName: string; // שם מלא
  email: string; // אימייל
  phoneNumber?: string; // מספר טלפון
  role: UserRole; // תפקיד במערכת
  permissions: UserPermissions[]; // הרשאות למשתמש
  accessList: UserAccess[]; // **רשימת גישות לממשקים* *

  createdDate: Date; // תאריך יצירה
  createdBy?: string; // מזהה היוצר
  lastModifiedDate: Date; // תאריך שינוי אחרון
  lastModifiedBy?: string; // מזהה העדכון האחרון
  lastLoginDate?: Date; // **תאריך כניסה אחרון למערכת**
  isActive: boolean; // האם המשתמש פעיל?
}

interface UserRole {
  id: string;
  name: "admin" | "secretary" | "sales" | "agent" | "assistant" | "other"; // סוג התפקיד
  description?: string; // תיאור התפקיד
}

interface UserPermissions {
  module: string; // שם המודול שהמשתמש מורשה אליו (לקוחות, פוליסות, תביעות וכו')
  canView: boolean; // האם יכול לצפות בנתונים?
  canEdit: boolean; // האם יכול לערוך נתונים?
  canDelete: boolean; // האם יכול למחוק נתונים?
  canManage?: boolean; // האם יכול לנהל משתמשים אחרים?
}

interface UserAccess {
  id: string; // מזהה הגישה
  userId: string; // מזהה המשתמש המשויך
  groupId: string; // קבוצה של גישה (לדוגמה: "customer-products")
  discriminator: string; // סוג ממשק (לדוגמה: "bituah_dira", "bituah_rehev")
  primary: boolean; // האם זו הגישה הראשית של המשתמש?
  shared: boolean; // האם התצוגה משותפת?
  name: string; // שם הגישה (לדוגמה: "תצוגה חדשה")
  orderValue: number; // סדר הצגת הגישה
  autoSave: boolean; // האם נשמר אוטומטית?
  defaultView: boolean; // האם זו ברירת המחדל?
  defaultViewUpdatedAt?: Date; // עדכון אחרון של ברירת המחדל
  createdDate: Date; // תאריך יצירה
  createdBy: string; // מזהה היוצר
  creatorName: string; // שם היוצר
  version: number; // גרסת הנתונים
}
