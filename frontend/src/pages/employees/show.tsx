import React from "react";
import {
  Show,
  DateField,
  EmailField,
  TextField,
} from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Space, Tag, Card, Row, Col, Avatar, Statistic } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { IEmployee } from "../../interfaces";

const { Title, Text } = Typography;

export const EmployeeShow: React.FC = () => {
  const { queryResult } = useShow<IEmployee>();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" align="center" style={{ width: "100%" }}>
              <Avatar 
                size={100} 
                src={record?.avatar} 
                icon={<UserOutlined />} 
              />
              <Title level={3}>
                {record?.first_name} {record?.last_name}
              </Title>
              <Tag
                color={
                  record?.role === "admin" ? "red" :
                  record?.role === "manager" ? "purple" :
                  record?.role === "sales" ? "blue" : "green"
                }
              >
                {record?.role?.toUpperCase()}
              </Tag>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <MailOutlined />
                <Title level={4}>Contact Information</Title>
              </Space>

              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong>Employee ID:</Text>
                <Text copyable>{record?.employee_id}</Text>

                <Text strong>Email:</Text>
                <EmailField value={record?.email} />

                <Text strong>Phone Extension:</Text>
                <Text>{record?.phone_extension || "N/A"}</Text>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <TeamOutlined />
                <Title level={4}>Work Information</Title>
              </Space>

              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong>Status:</Text>
                <Tag
                  color={
                    record?.status === "active" ? "success" :
                    record?.status === "on_leave" ? "warning" : "error"
                  }
                >
                  {record?.status?.toUpperCase()}
                </Tag>

                <Text strong>Store:</Text>
                <Text>{record?.store_id || "N/A"}</Text>

                <Text strong>Shift:</Text>
                <Text>{record?.shift?.charAt(0).toUpperCase() + record?.shift?.slice(1) || "N/A"}</Text>

                <Text strong>Hired Date:</Text>
                {record?.hired_at ? (
                  <DateField value={record.hired_at} />
                ) : (
                  <Text>N/A</Text>
                )}
              </Space>
            </Space>
          </Card>
        </Col>

        {record?.performance && (
          <Col span={24}>
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Space>
                  <DollarOutlined />
                  <Title level={4}>Performance Metrics</Title>
                </Space>

                <Row gutter={16}>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Total Sales"
                      value={record.performance.total_sales || 0}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Sales Amount"
                      value={record.performance.sales_amount || 0}
                      prefix="$"
                      precision={2}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Total Calls"
                      value={record.performance.total_calls || 0}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Conversion Rate"
                      value={record.performance.conversion_rate || 0}
                      suffix="%"
                      precision={1}
                    />
                  </Col>
                </Row>
              </Space>
            </Card>
          </Col>
        )}

        {record?.commissions && (
          <Col span={24}>
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Title level={4}>Commission Information</Title>
                
                <Row gutter={16}>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Total Earned"
                      value={record.commissions.total_earned || 0}
                      prefix="$"
                      precision={2}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="This Month"
                      value={record.commissions.this_month || 0}
                      prefix="$"
                      precision={2}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Pending"
                      value={record.commissions.pending || 0}
                      prefix="$"
                      precision={2}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Average Rate"
                      value={record.commissions.average_rate || 0}
                      suffix="%"
                      precision={1}
                    />
                  </Col>
                </Row>
              </Space>
            </Card>
          </Col>
        )}

        <Col span={24}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={4}>System Information</Title>
              
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Space direction="vertical">
                    <Text strong>Internal ID:</Text>
                    <Text copyable>{record?.id}</Text>
                  </Space>
                </Col>
                <Col xs={24} md={12}>
                  <Space direction="vertical">
                    <Text strong>Created At:</Text>
                    <DateField value={record?.created_at} />
                  </Space>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
