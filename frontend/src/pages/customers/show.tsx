import React from "react";
import {
  Show,
  DateField,
  EmailField,
  NumberField,
  TextField,
  BooleanField,
} from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Space, Tag, Card, Row, Col, Statistic } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { ICustomer } from "../../interfaces";

const { Title, Text } = Typography;

export const CustomerShow: React.FC = () => {
  const { queryResult } = useShow<ICustomer>();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <UserOutlined />
                <Title level={4}>Customer Information</Title>
              </Space>

              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong>Name:</Text>
                <Text>
                  {record?.first_name} {record?.last_name}
                </Text>

                <Text strong>Email:</Text>
                <EmailField value={record?.email} />

                <Text strong>Phone:</Text>
                <Text>{record?.phone || "N/A"}</Text>

                <Text strong>Customer ID:</Text>
                <Text copyable>{record?.id}</Text>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <DollarOutlined />
                <Title level={4}>Financial Information</Title>
              </Space>

              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Lifetime Value"
                    value={record?.lifetime_value || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Current Credit"
                    value={record?.current_credit || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Statistic
                    title="Total Trades"
                    value={record?.total_trades || 0}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Credit Earned"
                    value={record?.total_credit_earned || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <ShoppingCartOutlined />
                <Title level={4}>Membership Details</Title>
              </Space>

              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong>Tier:</Text>
                <Tag
                  color={
                    record?.tier === "elite"
                      ? "gold"
                      : record?.tier === "premium"
                      ? "blue"
                      : "green"
                  }
                >
                  {record?.tier?.toUpperCase()}
                </Tag>

                <Text strong>Membership Status:</Text>
                <Tag
                  color={record?.membership_status === "active" ? "success" : "default"}
                >
                  {record?.membership_status?.toUpperCase()}
                </Tag>

                <Text strong>Elite Member:</Text>
                <BooleanField value={record?.is_elite_member} />

                <Text strong>Source:</Text>
                <Text>{record?.source || "N/A"}</Text>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={4}>Additional Information</Title>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Space direction="vertical">
                    <Text strong>First Purchase:</Text>
                    {record?.first_purchase_date ? (
                      <DateField value={record.first_purchase_date} />
                    ) : (
                      <Text>N/A</Text>
                    )}

                    <Text strong>Last Purchase:</Text>
                    {record?.last_purchase_date ? (
                      <DateField value={record.last_purchase_date} />
                    ) : (
                      <Text>N/A</Text>
                    )}

                    <Text strong>Last Contact:</Text>
                    {record?.last_contact_date ? (
                      <DateField value={record.last_contact_date} />
                    ) : (
                      <Text>N/A</Text>
                    )}
                  </Space>
                </Col>

                <Col xs={24} md={12}>
                  <Space direction="vertical">
                    <Text strong>Do Not Call:</Text>
                    <BooleanField value={record?.do_not_call} />

                    <Text strong>Tags:</Text>
                    {record?.tags && record.tags.length > 0 ? (
                      <Space>
                        {record.tags.map((tag: string) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </Space>
                    ) : (
                      <Text>No tags</Text>
                    )}

                    <Text strong>Created At:</Text>
                    <DateField value={record?.created_at} />
                  </Space>
                </Col>
              </Row>

              {record?.address && (
                <>
                  <Text strong>Address:</Text>
                  <Text>
                    {record.address.street && `${record.address.street}, `}
                    {record.address.city && `${record.address.city}, `}
                    {record.address.state && `${record.address.state} `}
                    {record.address.zip && record.address.zip}
                  </Text>
                </>
              )}

              {record?.notes && (
                <>
                  <Text strong>Notes:</Text>
                  <Text>{record.notes}</Text>
                </>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
