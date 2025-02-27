import { addDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../src/config/firebaseConfig";

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
  {
    name: "contacts",
    title: "contacts",
    icon: "ContactsOutlined",
    path: "/contacts",
    order: 9,
  },
  {
    name: "admin",
    title: "admin",
    icon: "ToolOutlined",
    path: "/admin",
    order: 10,
    children: [
      {
        name: "users",
        title: "users_management",
        icon: "UserSwitchOutlined",
        path: "/admin/users",
        order: 1,
      },
      {
        name: "columns",
        title: "columns_management",
        icon: "TableOutlined",
        path: "/admin/columns",
        order: 2,
      },
    ],
  },
];

const uploadMenus = async () => {
  try {
    // מחיקת כל התפריטים הקיימים
    const snapshot = await getDocs(collection(db, "menus"));
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log("🗑️ כל התפריטים הקיימים נמחקו");

    // הוספת התפריטים החדשים
    for (const menu of menus) {
      await addDoc(collection(db, "menus"), menu);
      console.log(`✅ נוסף: ${menu.title}`);
    }
    console.log("🎉 כל התפריטים החדשים הועלו בהצלחה!");
  } catch (error) {
    console.error("❌ שגיאה בהעלאה:", error);
  }
};

uploadMenus();
