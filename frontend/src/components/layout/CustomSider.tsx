import React from "react";
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  SyncOutlined,
  MoonOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { ThemedTitleV2 } from "@refinedev/antd";
import { useLogout } from "@refinedev/core";

const { Sider } = Layout;

export const CustomSider: React.FC = () => {
  const { mutate: logout } = useLogout();

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: "customers",
      icon: <TeamOutlined />,
      label: <Link to="/customers">Customers</Link>,
    },
    {
      key: "employees",
      icon: <UserOutlined />,
      label: <Link to="/employees">Employees</Link>,
    },
    {
      key: "stores",
      icon: <ShopOutlined />,
      label: <Link to="/stores">Stores</Link>,
    },
    {
      key: "products",
      icon: <ShoppingCartOutlined />,
      label: <Link to="/products">Products</Link>,
    },
    {
      key: "sales",
      icon: <DollarOutlined />,
      label: <Link to="/sales">Sales</Link>,
    },
    {
      key: "calls",
      icon: <PhoneOutlined />,
      label: <Link to="/calls">Calls</Link>,
    },
    {
      key: "campaigns",
      icon: <CalendarOutlined />,
      label: <Link to="/campaigns">Campaigns</Link>,
    },
    {
      key: "subscriptions",
      icon: <CreditCardOutlined />,
      label: <Link to="/subscriptions">Subscriptions</Link>,
    },
    {
      key: "achievements",
      icon: <TrophyOutlined />,
      label: <Link to="/achievements">Achievements</Link>,
    },
    {
      key: "evaluations",
      icon: <SyncOutlined />,
      label: <Link to="/evaluations">Trade & Sleep</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => logout(),
    },
  ];

  return (
    <Sider
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div style={{ height: 64, padding: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ThemedTitleV2 
          collapsed={false} 
          text="Sleep Ready" 
          icon={<MoonOutlined />}
        />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["dashboard"]}
        items={menuItems}
      />
    </Sider>
  );
};
