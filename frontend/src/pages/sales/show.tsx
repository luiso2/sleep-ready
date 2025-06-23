import React from "react";
import {
  Show,
  DateField,
  NumberField,
  TextField,
} from "@refinedev/antd";
import { useShow, useOne } from "@refinedev/core";
import { Typography, Space, Tag, Card, Row, Col, Statistic, Descriptions, Timeline } from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShopOutlined,
  PhoneOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { ISale, ICustomer, IEmployee, IStore } from "../../interfaces";

const { Title, Text } = Typography;

export const SaleShow: React.FC = () => {
  const { queryResult } = useShow<ISale>();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  // Fetch related data
  const { data: customerData } = useOne<ICustomer>({
    resource: "customers",
    id: record?.customer_id || "",
    queryOptions: {
      enabled: !!record?.customer_id,
    },
  });

  const { data: employeeData } = useOne<IEmployee>({
    resource: "employees", 
    id: record?.user_id || "",
    queryOptions: {
      enabled: !!record?.user_id,
    },
  });

  const { data: storeData } = useOne<IStore>({
    resource: "stores",
    id: record?.store_id || "",
    queryOptions: {
      enabled: !!record?.store_id,
    },
  });

  const getPaymentStatusIcon = (status?: string) => {
    switch (status) {
      case "paid":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "pending":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      case "failed":
        return <CloseCircleOutlined style={{ color: "#f5222d" }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  return (
    <Show isLoading={isLoading}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <ShoppingCartOutlined />
                <Title level={4}>Sale Information</Title>
              </Space>

              <Descriptions column={1}>
                <Descriptions.Item label="Sale ID">
                  <Text copyable>#{record?.id.slice(-8).toUpperCase()}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  <Tag
                    color={
                      record?.type === "product" ? "blue" :
                      record?.type === "subscription" ? "purple" : "green"
                    }
                  >
                    {record?.type?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Channel">
                  <Tag
                    color={
                      record?.channel === "store" ? "blue" :
                      record?.channel === "phone" ? "green" : "purple"
                    }
                  >
                    {record?.channel?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                  <Space>
                    {getPaymentStatusIcon(record?.payment_status)}
                    <Tag
                      color={
                        record?.payment_status === "paid" ? "success" :
                        record?.payment_status === "pending" ? "warning" : "error"
                      }
                    >
                      {record?.payment_status?.toUpperCase()}
                    </Tag>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Sale Date">
                  <DateField value={record?.created_at} />
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <DollarOutlined />
                <Title level={4}>Financial Details</Title>
              </Space>

              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Subtotal"
                    value={record?.amount?.subtotal || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tax"
                    value={record?.amount?.tax || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Statistic
                    title="Discount"
                    value={record?.amount?.discount || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Total"
                    value={record?.amount?.total || 0}
                    prefix="$"
                    precision={2}
                    valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
                  />
                </Col>
              </Row>

              {record?.commission && (
                <>
                  <Divider style={{ margin: "16px 0" }} />
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Commission Rate"
                        value={record.commission.rate || 0}
                        suffix="%"
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Commission"
                        value={record.commission.amount || 0}
                        prefix="$"
                        precision={2}
                      />
                    </Col>
                  </Row>
                </>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <UserOutlined />
                <Title level={4}>People & Location</Title>
              </Space>

              <Descriptions column={1}>
                <Descriptions.Item label="Customer">
                  {customerData?.data ? (
                    <Text>
                      {customerData.data.first_name} {customerData.data.last_name}
                    </Text>
                  ) : (
                    <Text>Loading...</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Sales Agent">
                  {employeeData?.data ? (
                    <Text>
                      {employeeData.data.first_name} {employeeData.data.last_name}
                    </Text>
                  ) : (
                    <Text>Loading...</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Store">
                  {storeData?.data ? (
                    <Text>{storeData.data.name}</Text>
                  ) : (
                    <Text>Loading...</Text>
                  )}
                </Descriptions.Item>
                {record?.call_id && (
                  <Descriptions.Item label="Call Reference">
                    <Text copyable>{record.call_id}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Space>
          </Card>
        </Col>

        {record?.contract && Object.keys(record.contract).length > 0 && (
          <Col span={24}>
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Space>
                  <FileTextOutlined />
                  <Title level={4}>Contract Details</Title>
                </Space>

                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Contract Type">
                    {record.contract.type || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Financing Rate">
                    {record.contract.financing_rate ? `${record.contract.financing_rate}%` : "N/A"}
                  </Descriptions.Item>
                  {record.contract.terms && (
                    <Descriptions.Item label="Terms" span={2}>
                      {record.contract.terms}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Space>
            </Card>
          </Col>
        )}

        {record?.subscription_id && (
          <Col span={24}>
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Title level={4}>Subscription Details</Title>
                <Text>Subscription ID: {record.subscription_id}</Text>
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
                    <Text strong>Sale ID:</Text>
                    <Text copyable>{record?.id}</Text>
                  </Space>
                </Col>
                <Col xs={24} md={12}>
                  <Space direction="vertical">
                    <Text strong>Last Updated:</Text>
                    <DateField value={record?.updated_at} />
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
