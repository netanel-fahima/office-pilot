import { DynamicTable } from "@office-pilot/dynamic-table";
import { MessageSquare, Save } from "lucide-react";

const ContactsPage = () => {
  return (
    <DynamicTable
      tableName="contacts"
      title="אנשי קשר"
      pagination={{
        enabled: true,
        pageSize: 20,
      }}
      columnSettings={{
        enabled: true,
        buttonText: "",
      }}
      actions={{
        add: true,
        edit: true,
        delete: true,
        save: true,
        addButtonText: "הוסף איש קשר",
        icons: {
          save: <Save className="w-4 h-4" />,
        },
      }}
    />
  );
};

export default ContactsPage;
