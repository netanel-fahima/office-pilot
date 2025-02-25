import { useState } from "react";
import { Form, Input, Button, Card, message, Select, Space } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@src/config/firebaseConfig";
import { generateInviteCode, generateInviteLink } from "@src/utils/userUtils";
import "./AdminUserManagement.css";

const { Option } = Select;

const AdminUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const inviteCode = generateInviteCode();
      const userId = `temp_${Date.now()}`; // זמני עד שהמשתמש נרשם

      // יצירת רשומת משתמש ב-Firestore
      await setDoc(doc(db, "userInvites", userId), {
        username: values.username,
        email: values.email,
        managerSentCode: inviteCode,
        role: values.role,
        createdDate: new Date(),
        isActive: false,
        claimed: false,
      });

      const inviteLink = generateInviteLink(inviteCode);

      message.success("המשתמש נוצר בהצלחה!");
      message.info(`קוד הזמנה: ${inviteCode}`);
      message.info(`לינק הרשמה: ${inviteLink}`);

      form.resetFields();
    } catch (error) {
      console.error("Error creating user:", error);
      message.error("שגיאה ביצירת המשתמש");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-user-container">
      <Card className="admin-user-card">
        <h1>יצירת משתמש חדש</h1>
        <Form
          form={form}
          name="createUser"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "נא להזין שם משתמש" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="שם משתמש" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "נא להזין אימייל" },
              { type: "email", message: "אימייל לא תקין" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="אימייל" />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[{ required: true, message: "נא לבחור תפקיד" }]}
          >
            <Select placeholder="בחר תפקיד">
              <Option value="secretary">מזכיר/ה</Option>
              <Option value="sales">איש מכירות</Option>
              <Option value="agent">סוכן</Option>
              <Option value="assistant">עוזר/ת</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                צור משתמש
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
