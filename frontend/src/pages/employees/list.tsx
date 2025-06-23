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
import { Table, Space, Input, Select, Tag, Avatar } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { IEmployee } from "../../interfaces";

export const EmployeeList: React.FC = () => {
  const { tableProps, filters } = useTable<IEmployee>({
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
          dataIndex="employee_id"
          title="Employee ID"
          width={120}
          sorter
        />
        <Table.Column
          dataIndex={["first_name", "last_name"]}
          title="Name"
          render={(_, record: IEmployee) => (
            <Space>
              <Avatar src={record.avatar} icon={<UserOutlined />} />
              {record.first_name} {record.last_name}
            </Space>
          )}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input
                placeholder="Search Name"
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
          dataIndex="role"
          title="Role"
          render={(value: string) => {
            const color = 
              value === "manager" ? "purple" :
              value === "sales" ? "blue" :
              value === "admin" ? "red" :
              value === "call_center" ? "green" : "default";
            return <Tag color={color}>{value?.toUpperCase()}</Tag>;
          }}
          filters={[
            { text: "Admin", value: "admin" },
            { text: "Manager", value: "manager" },
            { text: "Sales", value: "sales" },
            { text: "Call Center", value: "call_center" },
          ]}
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
          dataIndex="status"
          title="Status"
          render={(value: string) => {
            const color = 
              value === "active" ? "success" :
              value === "on_leave" ? "warning" :
              value === "terminated" ? "error" : "default";
            return <Tag color={color}>{value?.toUpperCase()}</Tag>;
          }}
          filters={[
            { text: "Active", value: "active" },
            { text: "On Leave", value: "on_leave" },
            { text: "Terminated", value: "terminated" },
          ]}
        />
        <Table.Column
          dataIndex="shift"
          title="Shift"
          filters={[
            { text: "Morning", value: "morning" },
            { text: "Afternoon", value: "afternoon" },
            { text: "Evening", value: "evening" },
            { text: "Night", value: "night" },
          ]}
        />
        <Table.Column
          dataIndex="hired_at"
          title="Hired Date"
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
