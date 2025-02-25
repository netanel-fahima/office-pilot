import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../src/config/firebaseConfig";

// רשימת התפריטים להעלאה
const menus = [
  {
    name: "events",
    title: "events",
    icon: "AppstoreOutlined",
    path: "/events",
    order: 1,
  },
  {
    name: "leads",
    title: "leads",
    icon: "UserOutlined",
    path: "/children",
    order: 2,
  },
  {
    name: "reports",
    title: "reports",
    icon: "FileTextOutlined",
    path: "/reports",
    order: 3,
  },
  {
    name: "meetings",
    title: "meetings",
    icon: "TeamOutlined",
    path: "/meetings",
    order: 4,
  },
  {
    name: "summaries",
    title: "summaries",
    icon: "EditOutlined",
    path: "/summaries",
    order: 5,
  },
  {
    name: "documents",
    title: "documents",
    icon: "FolderOpenOutlined",
    path: "/documents",
    order: 6,
  },
  {
    name: "activities",
    title: "activities",
    icon: "CalendarOutlined",
    path: "/activities",
    order: 7,
  },
  {
    name: "processes",
    title: "processes",
    icon: "SettingOutlined",
    path: "/processes",
    order: 8,
  },
];

// פונקציה להעלאת התפריטים ל-Firestore
const uploadMenus = async () => {
  try {
    for (const menu of menus) {
      await addDoc(collection(db, "menus"), menu);
      console.log(`✅ נוסף: ${menu.title}`);
    }
    console.log("🎉 כל התפריטים הועלו בהצלחה!");
  } catch (error) {
    console.error("❌ שגיאה בהעלאה:", error);
  }
};

// הרצת הפונקציה
uploadMenus();
