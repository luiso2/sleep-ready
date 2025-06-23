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
import { Table, Space, Input, Tag } from "antd";
import { SearchOutlined, ShopOutlined } from "@ant-design/icons";
import { IStore } from "../../interfaces";

export const StoreList: React.FC = () => {
  const { tableProps, filters } = useTable<IStore>({
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
          dataIndex="code"
          title="Store Code"
          width={120}
          sorter
        />
        <Table.Column
          dataIndex="name"
          title="Store Name"
          sorter
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search Store Name"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex={["address", "city"]}
          title="City"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search City"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex={["address", "state"]}
          title="State"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search State"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="phone"
          title="Phone"
        />
        <Table.Column
          dataIndex="manager_id"
          title="Manager"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search Manager"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
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
          dataIndex={["performance", "monthly_revenue"]}
          title="Monthly Revenue"
          render={(value: number) => value ? `$${value.toFixed(2)}` : "N/A"}
          sorter
        />
        <Table.Column
          dataIndex="created_at"
          title="Created At"
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
