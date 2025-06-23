import React from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
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

export const CustomLayoutSider: React.FC = () => {
  const { mutate: logout } = useLogout();
  const location = useLocation();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: "/customers",
      icon: <TeamOutlined />,
      label: <Link to="/customers">Customers</Link>,
    },
    {
      key: "/employees",
      icon: <UserOutlined />,
      label: <Link to="/employees">Employees</Link>,
    },
    {
      key: "/stores",
      icon: <ShopOutlined />,
      label: <Link to="/stores">Stores</Link>,
    },
    {
      key: "/products",
      icon: <ShoppingCartOutlined />,
      label: <Link to="/products">Products</Link>,
    },
    {
      key: "/sales",
      icon: <DollarOutlined />,
      label: <Link to="/sales">Sales</Link>,
    },
    {
      key: "/calls",
      icon: <PhoneOutlined />,
      label: <Link to="/calls">Calls</Link>,
    },
    {
      key: "/campaigns",
      icon: <CalendarOutlined />,
      label: <Link to="/campaigns">Campaigns</Link>,
    },
    {
      key: "/subscriptions",
      icon: <CreditCardOutlined />,
      label: <Link to="/subscriptions">Subscriptions</Link>,
    },
    {
      key: "/achievements",
      icon: <TrophyOutlined />,
      label: <Link to="/achievements">Achievements</Link>,
    },
    {
      key: "/evaluations",
      icon: <SyncOutlined />,
      label: <Link to="/evaluations">Trade & Sleep</Link>,
    },
    {
      key: "divider",
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => logout(),
    },
  ];

  // Get the selected key based on current path
  const selectedKey = "/" + location.pathname.split("/")[1];

  return (
    <Sider
      style={{
        overflow: "auto",
        height: "100vh",
        position: "sticky",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div style={{ 
        height: 64, 
        padding: 16, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <ThemedTitleV2 
          collapsed={false} 
          text="Sleep Ready" 
          icon={<MoonOutlined />}
        />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};
