import React from "react";
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
  FilterDropdown,
  DateField,
} from "@refinedev/antd";
import { Table, Space, Input, Select, Tag, Image } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { IProduct } from "../../interfaces";

export const ProductList: React.FC = () => {
  const { tableProps, filters } = useTable<IProduct>({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="images"
          title="Image"
          width={80}
          render={(images: string[]) => (
            <Image
              width={60}
              height={60}
              src={images?.[0] || "/placeholder.png"}
              fallback="/placeholder.png"
              style={{ objectFit: "cover" }}
            />
          )}
        />
        <Table.Column
          dataIndex="sku"
          title="SKU"
          width={120}
          sorter
        />
        <Table.Column
          dataIndex="name"
          title="Product Name"
          sorter
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search Product Name"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="category"
          title="Category"
          filters={[
            { text: "Mattresses", value: "mattresses" },
            { text: "Bases", value: "bases" },
            { text: "Pillows", value: "pillows" },
            { text: "Accessories", value: "accessories" },
          ]}
        />
        <Table.Column
          dataIndex="brand"
          title="Brand"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search Brand"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="price"
          title="Price"
          render={(value: number) => `$${value?.toFixed(2) || "0.00"}`}
          sorter
        />
        <Table.Column
          dataIndex="stock_quantity"
          title="Stock"
          render={(value: number, record: IProduct) => {
            const isLowStock = value <= (record.min_stock || 5);
            return (
              <Tag color={isLowStock ? "error" : "success"}>
                {value || 0}
              </Tag>
            );
          }}
          sorter
        />
        <Table.Column
          dataIndex="commission_rate"
          title="Commission"
          render={(value: number) => `${value || 0}%`}
        />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value: string) => {
            const color = value === "active" ? "success" : "error";
            return <Tag color={color}>{value?.toUpperCase()}</Tag>;
          }}
          filters={[
            { text: "Active", value: "active" },
            { text: "Inactive", value: "inactive" },
          ]}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
