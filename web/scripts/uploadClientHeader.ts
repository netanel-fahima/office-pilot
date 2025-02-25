import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import { db } from "../src/config/firebaseConfig";

async function uploadHeaderData() {
  try {
    const headerItems = [
      { key: "products", label: "products", order: 1, path: "/products" },
      { key: "processes", label: "processes", order: 2, path: "/processes" },
      { key: "activities", label: "activities", order: 3, path: "/activities" },
      { key: "documents", label: "documents", order: 4, path: "/documents" },
      { key: "meetings", label: "meetings", order: 5, path: "/meetings" },
      {
        key: "meeting_summaries",
        label: "meeting_summaries",
        order: 6,
        path: "/meeting-summaries",
      },
      { key: "reports", label: "reports", order: 7, path: "/reports" },
      { key: "leads", label: "leads", order: 8, path: "/leads" },
      { key: "events", label: "events", order: 9, path: "/events" },
    ];

    for (const item of headerItems) {
      await setDoc(doc(collection(db, "clientHeader"), item.key), item);
      console.log(`Uploaded: ${item.label}`);
    }

    console.log("✅ All header items uploaded successfully!");
  } catch (error) {
    console.error("❌ Error uploading header data:", error);
  }
}

// הרצת הפונקציה
uploadHeaderData();
