import React from "react";
import {
  Show,
  DateField,
  NumberField,
  TextField,
} from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Space, Tag, Card, Row, Col, Statistic, Image, Descriptions } from "antd";
import {
  ShoppingOutlined,
  DollarOutlined,
  TagsOutlined,
  SafetyOutlined,
  StockOutlined,
} from "@ant-design/icons";
import { IProduct } from "../../interfaces";

const { Title, Text } = Typography;

export const ProductShow: React.FC = () => {
  const { queryResult } = useShow<IProduct>();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const calculateProfit = () => {
    if (!record?.price || !record?.cost) return 0;
    return record.price - record.cost;
  };

  const calculateMargin = () => {
    if (!record?.price || !record?.cost) return 0;
    return ((record.price - record.cost) / record.price) * 100;
  };

  return (
    <Show isLoading={isLoading}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" align="center" style={{ width: "100%" }}>
              {record?.images && record.images.length > 0 ? (
                <Image.PreviewGroup>
                  <Space wrap>
                    {record.images.map((img, index) => (
                      <Image
                        key={index}
                        width={index === 0 ? 200 : 100}
                        height={index === 0 ? 200 : 100}
                        src={img}
                        fallback="/placeholder.png"
                        style={{ objectFit: "cover" }}
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              ) : (
                <Image
                  width={200}
                  height={200}
                  src="/placeholder.png"
                  style={{ objectFit: "cover" }}
                />
              )}
              
              <Title level={4}>{record?.name}</Title>
              <Tag color={record?.status === "active" ? "success" : "error"}>
                {record?.status?.toUpperCase()}
              </Tag>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <ShoppingOutlined />
                <Title level={4}>Product Details</Title>
              </Space>

              <Descriptions column={1}>
                <Descriptions.Item label="SKU">
                  <Text copyable>{record?.sku || "N/A"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Category">
                  <Tag>{record?.category}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Brand">
                  {record?.brand || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Model">
                  {record?.model || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Warranty">
                  {record?.warranty_months} months
                </Descriptions.Item>
              </Descriptions>

              {record?.tags && record.tags.length > 0 && (
                <>
                  <Text strong>Tags:</Text>
                  <Space wrap>
                    {record.tags.map((tag: string) => (
                      <Tag key={tag} icon={<TagsOutlined />}>{tag}</Tag>
                    ))}
                  </Space>
                </>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <DollarOutlined />
                <Title level={4}>Pricing & Stock</Title>
              </Space>

              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Price"
                    value={record?.price || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Cost"
                    value={record?.cost || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Statistic
                    title="Profit"
                    value={calculateProfit()}
                    prefix="$"
                    precision={2}
                    valueStyle={{ color: calculateProfit() > 0 ? "#3f8600" : "#cf1322" }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Margin"
                    value={calculateMargin()}
                    suffix="%"
                    precision={1}
                    valueStyle={{ color: calculateMargin() > 20 ? "#3f8600" : "#cf1322" }}
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Statistic
                    title="Stock"
                    value={record?.stock_quantity || 0}
                    prefix={<StockOutlined />}
                    valueStyle={{ 
                      color: (record?.stock_quantity || 0) <= (record?.min_stock || 5) ? "#cf1322" : "#3f8600" 
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Commission"
                    value={record?.commission_rate || 0}
                    suffix="%"
                  />
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>

        {record?.description && (
          <Col span={24}>
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Title level={4}>Description</Title>
                <Text>{record.description}</Text>
              </Space>
            </Card>
          </Col>
        )}

        {record?.features && (
          <Col span={24}>
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Title level={4}>Features & Specifications</Title>
                
                <Row gutter={[16, 16]}>
                  {record.features.size && (
                    <Col xs={12} sm={6}>
                      <Text strong>Size:</Text>
                      <br />
                      <Text>{record.features.size}</Text>
                    </Col>
                  )}
                  {record.features.firmness && (
                    <Col xs={12} sm={6}>
                      <Text strong>Firmness:</Text>
                      <br />
                      <Text>{record.features.firmness}</Text>
                    </Col>
                  )}
                  {record.features.material && (
                    <Col xs={12} sm={6}>
                      <Text strong>Material:</Text>
                      <br />
                      <Text>{record.features.material}</Text>
                    </Col>
                  )}
                  {record.features.height && (
                    <Col xs={12} sm={6}>
                      <Text strong>Height:</Text>
                      <br />
                      <Text>{record.features.height} inches</Text>
                    </Col>
                  )}
                </Row>

                {record.specifications && Object.keys(record.specifications).length > 0 && (
                  <>
                    <Text strong style={{ marginTop: 16, display: "block" }}>
                      Additional Specifications:
                    </Text>
                    <Descriptions column={2} bordered size="small">
                      {Object.entries(record.specifications).map(([key, value]) => (
                        <Descriptions.Item key={key} label={key}>
                          {String(value)}
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  </>
                )}
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
                    <Text strong>Product ID:</Text>
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
