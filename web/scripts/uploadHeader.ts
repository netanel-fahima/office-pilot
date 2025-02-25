import { collection, setDoc, doc } from "firebase/firestore";
import { db } from "../src/config/firebaseConfig"; // שימוש בחיבור הקיים ל-DB

// רשימת הפקדים להעלאה
const headerItems = [
  { id: "appName", type: "text", label: "מערכת ניהול", order: 1 },
  {
    id: "search",
    type: "input",
    subtype: "search",
    placeholder: "חיפוש...",
    order: 2,
  },
  { id: "notifications", type: "icon", icon: "BellOutlined", order: 3 },
  { id: "download", type: "icon", icon: "DownloadOutlined", order: 4 },
  {
    id: "profile",
    type: "button",
    subtype: "primary",
    label: "פרופיל",
    order: 5,
  },
  {
    id: "logout",
    type: "button",
    subtype: "default",
    label: "התנתקות",
    order: 6,
  },
];

// פונקציה להעלאת הפקדים ל-Firestore
const uploadHeaderItems = async () => {
  try {
    for (const item of headerItems) {
      const itemRef = doc(collection(db, "header"), item.id);
      await setDoc(itemRef, item);
      console.log(`✅ נוסף: ${item.label || item.id}`);
    }
    console.log("🎉 כל הפקדים של ה-Header הועלו בהצלחה!");
  } catch (error) {
    console.error("❌ שגיאה בהעלאה:", error);
  }
};

// הרצת הפונקציה
uploadHeaderItems();
