// יצירת קוד הזמנה אקראי
export const generateInviteCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// יצירת לינק הרשמה עם הקוד המוטמע
export const generateInviteLink = (code: string) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/signup?invite=${code}`;
};

// בדיקת תקינות קוד הזמנה
export const validateInviteCode = (code: string) => {
  return /^[A-Z0-9]{8}$/.test(code);
};
