import React from "react";
import { useLogin } from "@refinedev/core";
import { Card, Form, Input, Button, Typography, Row, Col, message, Space, Divider } from "antd";
import { UserOutlined, LockOutlined, MoonOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const { mutate: login, isLoading } = useLogin();
  const [form] = Form.useForm();

  const onFinish = (values: { email: string; password: string }) => {
    login(values, {
      onError: (error) => {
        message.error(error.message || "Login failed");
      },
    });
  };

  const demoCredentials = [
    { email: "admin@sleepready.com", password: "admin123", role: "Administrator" },
    { email: "manager@sleepready.com", password: "password", role: "Manager" },
    { email: "agent@sleepready.com", password: "password", role: "Agent" },
    { email: "supervisor@sleepready.com", password: "password", role: "Supervisor" },
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    form.setFieldsValue({ email, password });
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Col xs={24} sm={20} md={12} lg={8} xl={6}>
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            border: "none",
          }}
          bodyStyle={{ padding: "40px" }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Header */}
            <div style={{ textAlign: "center" }}>
              <MoonOutlined 
                style={{ 
                  fontSize: "48px", 
                  color: "#667eea",
                  marginBottom: "16px" 
                }} 
              />
              <Title level={2} style={{ margin: 0, color: "#1a1a1a" }}>
                Sleep Ready
              </Title>
              <Text type="secondary">
                Welcome back! Please sign in to your account
              </Text>
            </div>

            {/* Login Form */}
            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              autoComplete="off"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Please input your email!",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Enter your email"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Enter your password"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: "16px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  block
                  style={{
                    height: "48px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            {/* Demo Credentials */}
            <div>
              <Divider>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Demo Credentials
                </Text>
              </Divider>
              
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                {demoCredentials.map((cred, index) => (
                  <Button
                    key={index}
                    type="text"
                    size="small"
                    block
                    onClick={() => fillDemoCredentials(cred.email, cred.password)}
                    style={{
                      textAlign: "left",
                      height: "auto",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "#f8f9fa",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div>
                      <Text strong style={{ fontSize: "12px" }}>
                        {cred.role}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "11px" }}>
                        {cred.email}
                      </Text>
                    </div>
                  </Button>
                ))}
              </Space>

              <Text 
                type="secondary" 
                style={{ 
                  fontSize: "11px", 
                  display: "block", 
                  textAlign: "center", 
                  marginTop: "12px" 
                }}
              >
                Click any credential above to auto-fill the form
              </Text>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};
