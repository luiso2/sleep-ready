import React from "react";
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
  FilterDropdown,
  useSelect,
  DateField,
} from "@refinedev/antd";
import { Table, Space, Input, Select, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ICustomer } from "../../interfaces";

export const CustomerList: React.FC = () => {
  const { tableProps, filters } = useTable<ICustomer>({
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
          title="ID"
          width={120}
          sorter
        />
        <Table.Column
          dataIndex="first_name"
          title="First Name"
          sorter
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search First Name"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="last_name"
          title="Last Name"
          sorter
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search Last Name"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="email"
          title="Email"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search Email"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="phone"
          title="Phone"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search Phone"
                prefix={<SearchOutlined />}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="tier"
          title="Tier"
          render={(value: string) => {
            const color = 
              value === "elite" ? "gold" :
              value === "premium" ? "blue" :
              value === "regular" ? "green" : "default";
            return <Tag color={color}>{value?.toUpperCase()}</Tag>;
          }}
          filters={[
            { text: "Elite", value: "elite" },
            { text: "Premium", value: "premium" },
            { text: "Regular", value: "regular" },
          ]}
        />
        <Table.Column
          dataIndex="membership_status"
          title="Membership"
          render={(value: string) => {
            const color = value === "active" ? "success" : "default";
            return <Tag color={color}>{value?.toUpperCase()}</Tag>;
          }}
          filters={[
            { text: "Active", value: "active" },
            { text: "Inactive", value: "inactive" },
          ]}
        />
        <Table.Column
          dataIndex="lifetime_value"
          title="Lifetime Value"
          render={(value: number) => `$${value?.toFixed(2) || "0.00"}`}
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
