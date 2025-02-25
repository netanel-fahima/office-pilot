import { useState, useEffect } from "react";
import { Layout, Card, Select, Switch } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@src/config/firebaseConfig";
import "./Dashboard.css";

const { Content } = Layout;
const { Option } = Select;

const Dashboard = () => {
  const [isActiveOnly, setIsActiveOnly] = useState(false);

  const [data, setData] = useState<any[]>([
    { month: "03/2024", clients: 1872 },
    { month: "04/2024", clients: 1889 },
    { month: "05/2024", clients: 1903 },
    { month: "06/2024", clients: 2227 },
    { month: "07/2024", clients: 2252 },
    { month: "08/2024", clients: 2273 },
    { month: "09/2024", clients: 2378 },
    { month: "10/2024", clients: 2398 },
    { month: "11/2024", clients: 2433 },
    { month: "12/2024", clients: 2448 },
    { month: "01/2025", clients: 2462 },
    { month: "02/2025", clients: 2465 },
  ]);

  return (
    <Content className="dashboard-container">
      {/* כרטיסי מידע מרכזיים */}
      <div className="cards-container">
        <Card className="info-card">
          <h3>תהליכים פתוחים</h3>
          <h2>1,348</h2>
        </Card>
        <Card className="info-card">
          <h3>לידים פתוחים</h3>
          <h2>143</h2>
        </Card>
        <Card className="info-card">
          <h3>לקוחות</h3>
          <h2>2,463</h2>
        </Card>
      </div>

      {/* גרף לקוחות */}
      <div className="chart-container">
        <div className="chart-header">
          <h3>לקוחות</h3>
          <div className="chart-controls">
            <Switch
              checked={isActiveOnly}
              onChange={setIsActiveOnly}
              checkedChildren="פעילים בלבד"
              unCheckedChildren="הכל"
            />
            <Select defaultValue="12">
              <Option value="6">חודשים אחרונים 6</Option>
              <Option value="12">חודשים אחרונים 12</Option>
            </Select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="clients" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Content>
  );
};

export default Dashboard;
