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
import { Table, Space, Input, Select, Tag } from "antd";
import { SearchOutlined, DollarOutlined } from "@ant-design/icons";
import { ISale } from "../../interfaces";

export const SaleList: React.FC = () => {
  const { tableProps, filters } = useTable<ISale>({
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
          dataIndex="id"
          title="Sale ID"
          width={120}
          render={(value) => <span>#{value.slice(-8).toUpperCase()}</span>}
        />
        <Table.Column
          dataIndex="customer_id"
          title="Customer"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search Customer"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="type"
          title="Type"
          render={(value: string) => {
            const color = 
              value === "product" ? "blue" :
              value === "subscription" ? "purple" :
              value === "trade" ? "green" : "default";
            return <Tag color={color}>{value?.toUpperCase()}</Tag>;
          }}
          filters={[
            { text: "Product", value: "product" },
            { text: "Subscription", value: "subscription" },
            { text: "Trade", value: "trade" },
          ]}
        />
        <Table.Column
          dataIndex="channel"
          title="Channel"
          render={(value: string) => {
            const color = 
              value === "store" ? "blue" :
              value === "phone" ? "green" :
              value === "online" ? "purple" : "default";
            return <Tag color={color}>{value?.toUpperCase()}</Tag>;
          }}
          filters={[
            { text: "Store", value: "store" },
            { text: "Phone", value: "phone" },
            { text: "Online", value: "online" },
          ]}
        />
        <Table.Column
          dataIndex={["amount", "total"]}
          title="Total Amount"
          render={(value: number) => (
            <Space>
              <DollarOutlined />
              <span style={{ fontWeight: 600 }}>
                ${value?.toFixed(2) || "0.00"}
              </span>
            </Space>
          )}
          sorter
        />
        <Table.Column
          dataIndex="payment_status"
          title="Payment Status"
          render={(value: string) => {
            const color = 
              value === "paid" ? "success" :
              value === "pending" ? "warning" :
              value === "failed" ? "error" : "default";
            return <Tag color={color}>{value?.toUpperCase()}</Tag>;
          }}
          filters={[
            { text: "Paid", value: "paid" },
            { text: "Pending", value: "pending" },
            { text: "Failed", value: "failed" },
          ]}
        />
        <Table.Column
          dataIndex="user_id"
          title="Sales Agent"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search Agent"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="store_id"
          title="Store"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search Store"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="created_at"
          title="Sale Date"
          render={(value) => <DateField value={value} />}
          sorter
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
