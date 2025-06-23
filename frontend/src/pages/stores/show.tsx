import React from "react";
import {
  Show,
  DateField,
  TextField,
} from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Space, Tag, Card, Row, Col, Statistic, Table } from "antd";
import {
  ShopOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { IStore } from "../../interfaces";

const { Title, Text } = Typography;

export const StoreShow: React.FC = () => {
  const { queryResult } = useShow<IStore>();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const formatTime = (time: string) => {
    if (!time) return "Closed";
    return time;
  };

  return (
    <Show isLoading={isLoading}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <ShopOutlined />
                <Title level={4}>Store Information</Title>
              </Space>

              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong>Store Name:</Text>
                <Title level={5}>{record?.name}</Title>

                <Text strong>Store Code:</Text>
                <Text copyable>{record?.code}</Text>

                <Text strong>Phone:</Text>
                <Text>{record?.phone || "N/A"}</Text>

                <Text strong>Status:</Text>
                <Tag color={record?.status === "active" ? "success" : "error"}>
                  {record?.status?.toUpperCase()}
                </Tag>

                <Text strong>Manager:</Text>
                <Text>{record?.manager_id || "N/A"}</Text>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <EnvironmentOutlined />
                <Title level={4}>Location</Title>
              </Space>

              <Space direction="vertical" style={{ width: "100%" }}>
                {record?.address && (
                  <>
                    <Text>{record.address.street}</Text>
                    <Text>
                      {record.address.city}, {record.address.state} {record.address.zip}
                    </Text>
                  </>
                )}

                {record?.service_area && (
                  <>
                    <Text strong style={{ marginTop: 16 }}>Service Area:</Text>
                    <Text>Radius: {record.service_area.radius || "N/A"} miles</Text>
                    {record.service_area.zip_codes && record.service_area.zip_codes.length > 0 && (
                      <Space wrap>
                        {record.service_area.zip_codes.map((zip: string) => (
                          <Tag key={zip}>{zip}</Tag>
                        ))}
                      </Space>
                    )}
                  </>
                )}
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <ClockCircleOutlined />
                <Title level={4}>Business Hours</Title>
              </Space>

              {record?.hours && (
                <Table
                  size="small"
                  pagination={false}
                  dataSource={[
                    { day: "Monday", open: record.hours.monday?.open, close: record.hours.monday?.close },
                    { day: "Tuesday", open: record.hours.tuesday?.open, close: record.hours.tuesday?.close },
                    { day: "Wednesday", open: record.hours.wednesday?.open, close: record.hours.wednesday?.close },
                    { day: "Thursday", open: record.hours.thursday?.open, close: record.hours.thursday?.close },
                    { day: "Friday", open: record.hours.friday?.open, close: record.hours.friday?.close },
                    { day: "Saturday", open: record.hours.saturday?.open, close: record.hours.saturday?.close },
                    { day: "Sunday", open: record.hours.sunday?.open, close: record.hours.sunday?.close },
                  ]}
                  columns={[
                    { title: "Day", dataIndex: "day", key: "day" },
                    { 
                      title: "Hours", 
                      key: "hours",
                      render: (_, record) => (
                        <Text>
                          {formatTime(record.open)} - {formatTime(record.close)}
                        </Text>
                      )
                    },
                  ]}
                />
              )}
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
                      title="Monthly Revenue"
                      value={record.performance.monthly_revenue || 0}
                      prefix="$"
                      precision={2}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Monthly Sales"
                      value={record.performance.monthly_sales || 0}
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
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Active Employees"
                      value={record.performance.active_employees || 0}
                      prefix={<TeamOutlined />}
                    />
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="YTD Revenue"
                      value={record.performance.ytd_revenue || 0}
                      prefix="$"
                      precision={2}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Customer Satisfaction"
                      value={record.performance.customer_satisfaction || 0}
                      suffix="%"
                      precision={1}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Average Sale"
                      value={record.performance.average_sale || 0}
                      prefix="$"
                      precision={2}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Trade-ins"
                      value={record.performance.total_tradeins || 0}
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
                    <Text strong>Store ID:</Text>
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
