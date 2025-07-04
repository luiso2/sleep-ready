import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  ErrorComponent,
  ThemedLayoutV2,
  useNotificationProvider,
} from "@refinedev/antd";
import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { App as AntdApp, ConfigProvider } from "antd";
import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router-dom";

import "@refinedev/antd/dist/reset.css";

import { dataProvider } from "./providers/dataProvider";
import { authProvider } from "./providers/authProvider";
import { LoginPage } from "./pages/login";
import { Dashboard } from "./components/Dashboard";
import { CustomLayoutSider } from "./components/layout/Sider";

// Customer pages
import { 
  CustomerList, 
  CustomerCreate, 
  CustomerEdit, 
  CustomerShow 
} from "./pages/customers";

// Employee pages
import { 
  EmployeeList, 
  EmployeeCreate, 
  EmployeeEdit, 
  EmployeeShow 
} from "./pages/employees";

// Store pages
import { 
  StoreList, 
  StoreCreate, 
  StoreEdit, 
  StoreShow 
} from "./pages/stores";

// Product pages
import { 
  ProductList, 
  ProductCreate, 
  ProductEdit, 
  ProductShow 
} from "./pages/products";

// Sale pages
import { 
  SaleList, 
  SaleCreate, 
  SaleEdit, 
  SaleShow 
} from "./pages/sales";

import {
  TeamOutlined,
  DashboardOutlined,
  MoonOutlined,
  UserOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  PhoneOutlined,
  CalendarOutlined,
  TrophyOutlined,
  CreditCardOutlined,
  SyncOutlined,
} from "@ant-design/icons";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#667eea",
              borderRadius: 8,
            },
          }}
        >
          <AntdApp>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              routerProvider={routerBindings}
              notificationProvider={useNotificationProvider}
              resources={[
                {
                  name: "dashboard",
                  list: "/dashboard",
                  meta: {
                    label: "Dashboard",
                    icon: <DashboardOutlined />,
                  },
                },
                {
                  name: "customers",
                  list: "/customers",
                  create: "/customers/create",
                  edit: "/customers/edit/:id",
                  show: "/customers/show/:id",
                  meta: {
                    canDelete: true,
                    label: "Customers",
                    icon: <TeamOutlined />,
                  },
                },
                {
                  name: "employees",
                  list: "/employees",
                  create: "/employees/create",
                  edit: "/employees/edit/:id",
                  show: "/employees/show/:id",
                  meta: {
                    canDelete: true,
                    label: "Employees",
                    icon: <UserOutlined />,
                  },
                },
                {
                  name: "stores",
                  list: "/stores",
                  create: "/stores/create",
                  edit: "/stores/edit/:id",
                  show: "/stores/show/:id",
                  meta: {
                    canDelete: true,
                    label: "Stores",
                    icon: <ShopOutlined />,
                  },
                },
                {
                  name: "products",
                  list: "/products",
                  create: "/products/create",
                  edit: "/products/edit/:id",
                  show: "/products/show/:id",
                  meta: {
                    canDelete: true,
                    label: "Products",
                    icon: <ShoppingCartOutlined />,
                  },
                },
                {
                  name: "sales",
                  list: "/sales",
                  create: "/sales/create",
                  edit: "/sales/edit/:id",
                  show: "/sales/show/:id",
                  meta: {
                    canDelete: true,
                    label: "Sales",
                    icon: <DollarOutlined />,
                  },
                },
                {
                  name: "calls",
                  list: "/calls",
                  create: "/calls/create",
                  edit: "/calls/edit/:id",
                  show: "/calls/show/:id",
                  meta: {
                    canDelete: true,
                    label: "Calls",
                    icon: <PhoneOutlined />,
                  },
                },
                {
                  name: "campaigns",
                  list: "/campaigns",
                  create: "/campaigns/create",
                  edit: "/campaigns/edit/:id",
                  show: "/campaigns/show/:id",
                  meta: {
                    canDelete: true,
                    label: "Campaigns",
                    icon: <CalendarOutlined />,
                  },
                },
                {
                  name: "subscriptions",
                  list: "/subscriptions",
                  create: "/subscriptions/create",
                  edit: "/subscriptions/edit/:id",
                  show: "/subscriptions/show/:id",
                  meta: {
                    canDelete: true,
                    label: "Subscriptions",
                    icon: <CreditCardOutlined />,
                  },
                },
                {
                  name: "achievements",
                  list: "/achievements",
                  create: "/achievements/create",
                  edit: "/achievements/edit/:id",
                  show: "/achievements/show/:id",
                  meta: {
                    canDelete: true,
                    label: "Achievements",
                    icon: <TrophyOutlined />,
                  },
                },
                {
                  name: "evaluations",
                  list: "/evaluations",
                  create: "/evaluations/create",
                  edit: "/evaluations/edit/:id",
                  show: "/evaluations/show/:id",
                  meta: {
                    canDelete: true,
                    label: "Trade & Sleep",
                    icon: <SyncOutlined />,
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "sleep-ready-project",
                title: {
                  text: "Sleep Ready",
                  icon: <MoonOutlined />,
                },
              }}
            >
              <Routes>
                <Route
                  element={
                    <ThemedLayoutV2
                      Sider={CustomLayoutSider}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Customer Routes */}
                  <Route path="/customers">
                    <Route index element={<CustomerList />} />
                    <Route path="create" element={<CustomerCreate />} />
                    <Route path="edit/:id" element={<CustomerEdit />} />
                    <Route path="show/:id" element={<CustomerShow />} />
                  </Route>

                  {/* Employee Routes */}
                  <Route path="/employees">
                    <Route index element={<EmployeeList />} />
                    <Route path="create" element={<EmployeeCreate />} />
                    <Route path="edit/:id" element={<EmployeeEdit />} />
                    <Route path="show/:id" element={<EmployeeShow />} />
                  </Route>

                  {/* Store Routes */}
                  <Route path="/stores">
                    <Route index element={<StoreList />} />
                    <Route path="create" element={<StoreCreate />} />
                    <Route path="edit/:id" element={<StoreEdit />} />
                    <Route path="show/:id" element={<StoreShow />} />
                  </Route>

                  {/* Product Routes */}
                  <Route path="/products">
                    <Route index element={<ProductList />} />
                    <Route path="create" element={<ProductCreate />} />
                    <Route path="edit/:id" element={<ProductEdit />} />
                    <Route path="show/:id" element={<ProductShow />} />
                  </Route>

                  {/* Sale Routes */}
                  <Route path="/sales">
                    <Route index element={<SaleList />} />
                    <Route path="create" element={<SaleCreate />} />
                    <Route path="edit/:id" element={<SaleEdit />} />
                    <Route path="show/:id" element={<SaleShow />} />
                  </Route>

                  {/* Placeholder routes for other modules */}
                  <Route path="/calls" element={<div style={{ padding: 24 }}>Calls module coming soon...</div>} />
                  <Route path="/campaigns" element={<div style={{ padding: 24 }}>Campaigns module coming soon...</div>} />
                  <Route path="/subscriptions" element={<div style={{ padding: 24 }}>Subscriptions module coming soon...</div>} />
                  <Route path="/achievements" element={<div style={{ padding: 24 }}>Achievements module coming soon...</div>} />
                  <Route path="/evaluations" element={<div style={{ padding: 24 }}>Trade & Sleep module coming soon...</div>} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<ErrorComponent />} />
              </Routes>

              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </ConfigProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
};

export default App;
