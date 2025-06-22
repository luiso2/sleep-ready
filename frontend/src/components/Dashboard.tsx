import React from "react";
import { Layout as AntdLayout, Typography } from "antd";

const { Content } = AntdLayout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  return (
    <Content style={{ padding: "24px" }}>
      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "8px",
          minHeight: "400px",
        }}
      >
        <Title level={2}>Dashboard</Title>
        <p>Welcome to Sleep Ready! 🌙</p>
        <p>Your sleep management system is ready to go.</p>
      </div>
    </Content>
  );
};
