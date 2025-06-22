import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from "@refinedev/antd";
import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { App as AntdApp, ConfigProvider } from "antd";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";

import "@refinedev/antd/dist/reset.css";

import { dataProvider } from "./providers/dataProvider";
import { authProvider } from "./providers/authProvider";
import { LoginPage } from "./pages/login";
import { Dashboard } from "./components/Dashboard";

import {
  TeamOutlined,
  DashboardOutlined,
  MoonOutlined,
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
                  list: "/",
                  meta: {
                    label: "Dashboard",
                    icon: <DashboardOutlined />,
                  },
                },
                {
                  name: "customers",
                  list: "/customers",
                  meta: {
                    label: "Customers",
                    icon: <TeamOutlined />,
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
                      Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  }
                >
                  <Route
                    index
                    element={<NavigateToResource resource="dashboard" />}
                  />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/customers" element={<div>Customers Page</div>} />
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
