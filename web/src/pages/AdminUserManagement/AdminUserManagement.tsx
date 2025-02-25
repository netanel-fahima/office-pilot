import { useState, useEffect } from "react";
import {
  Table,
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
  Space,
  Switch,
  Modal,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  DeleteOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { db } from "@src/config/firebaseConfig";
import { generateInviteCode, generateInviteLink } from "@src/utils/userUtils";
import type { SystemUser } from "@src/types/user";
import "./AdminUserManagement.css";

const { Option } = Select;
const { confirm } = Modal;

const AdminUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [form] = Form.useForm();
  const auth = getAuth();
  const { t } = useTranslation();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        key: doc.id,
      })) as SystemUser[];
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error(t("admin.users.messages.error_loading"));
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const inviteCode = generateInviteCode();
      const userId = `temp_${Date.now()}`;

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

      message.success(t("admin.users.messages.create_success"));
      message.info(`${t("admin.users.fields.invite_code")}: ${inviteCode}`);
      message.info(`${t("admin.users.fields.invite_link")}: ${inviteLink}`);

      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      message.error(t("admin.users.messages.error_creating"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (user: SystemUser) => {
    confirm({
      title: t("admin.users.confirmations.delete_title"),
      content: t("admin.users.confirmations.delete_content"),
      okText: t("admin.users.buttons.confirm_yes"),
      okType: "danger",
      cancelText: t("admin.users.buttons.confirm_no"),
      onOk: async () => {
        try {
          await deleteDoc(doc(db, "users", user.id));
          message.success(t("admin.users.messages.delete_success"));
          fetchUsers();
        } catch (error) {
          console.error("Error deleting user:", error);
          message.error(t("admin.users.messages.error_deleting"));
        }
      },
    });
  };

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      message.success(t("admin.users.messages.reset_password_success"));
    } catch (error) {
      console.error("Error sending reset password:", error);
      message.error(t("admin.users.messages.error_reset_password"));
    }
  };

  const handleToggleActive = async (user: SystemUser) => {
    try {
      await updateDoc(doc(db, "users", user.id), {
        isActive: !user.isActive,
      });
      message.success(t("admin.users.messages.toggle_active_success"));
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user active status:", error);
      message.error(t("admin.users.messages.error_toggle_active"));
    }
  };

  const columns = [
    {
      title: t("admin.users.fields.username"),
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: t("admin.users.fields.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("admin.users.fields.role"),
      dataIndex: ["role", "name"],
      key: "role",
    },
    {
      title: t("admin.users.fields.status"),
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record: SystemUser) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren={t("admin.users.status.active")}
          unCheckedChildren={t("admin.users.status.inactive")}
        />
      ),
    },
    {
      title: t("admin.users.fields.actions"),
      key: "actions",
      render: (_: any, record: SystemUser) => (
        <Space>
          <Button
            type="text"
            icon={<KeyOutlined />}
            onClick={() => handleResetPassword(record.email)}
            title={t("admin.users.buttons.reset_password")}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title={t("admin.users.buttons.delete")}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-user-container">
      <Card className="admin-user-card">
        <h1>{t("admin.users.create_user")}</h1>
        <Form
          form={form}
          name="createUser"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: t("admin.users.validation.required_username"),
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("admin.users.placeholders.username")}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: t("admin.users.validation.required_email"),
              },
              {
                type: "email",
                message: t("admin.users.validation.invalid_email"),
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t("admin.users.placeholders.email")}
            />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[
              {
                required: true,
                message: t("admin.users.validation.required_role"),
              },
            ]}
          >
            <Select placeholder={t("admin.users.placeholders.role")}>
              <Option value="secretary">
                {t("admin.users.roles.secretary")}
              </Option>
              <Option value="sales">{t("admin.users.roles.sales")}</Option>
              <Option value="agent">{t("admin.users.roles.agent")}</Option>
              <Option value="assistant">
                {t("admin.users.roles.assistant")}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t("admin.users.buttons.create")}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card className="admin-user-list-card">
        <h2>{t("admin.users.user_list")}</h2>
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default AdminUserManagement;
