import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, DatePicker, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { IEmployee } from "../../interfaces";
import dayjs from "dayjs";

export const EmployeeEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<IEmployee>();

  const employeeData = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form 
        {...formProps} 
        layout="vertical"
        initialValues={{
          ...employeeData,
          hired_at: employeeData?.hired_at ? dayjs(employeeData.hired_at) : undefined,
        }}
      >
        <Form.Item
          label="Employee ID"
          name="employee_id"
          rules={[
            {
              required: true,
              message: "Please enter employee ID",
            },
          ]}
        >
          <Input placeholder="Enter employee ID (e.g., EMP001)" />
        </Form.Item>

        <Form.Item
          label="First Name"
          name="first_name"
          rules={[
            {
              required: true,
              message: "Please enter first name",
            },
          ]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="last_name"
          rules={[
            {
              required: true,
              message: "Please enter last name",
            },
          ]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Please enter a valid email",
            },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          label="New Password (leave empty to keep current)"
          name="password"
          rules={[
            {
              min: 6,
              message: "Password must be at least 6 characters",
            },
          ]}
        >
          <Input.Password placeholder="Enter new password (optional)" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[
            {
              required: true,
              message: "Please select a role",
            },
          ]}
        >
          <Select placeholder="Select role">
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="manager">Manager</Select.Option>
            <Select.Option value="sales">Sales</Select.Option>
            <Select.Option value="call_center">Call Center</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Store" name="store_id">
          <Select placeholder="Select store">
            <Select.Option value="STORE001">Main Store</Select.Option>
            <Select.Option value="STORE002">Downtown Store</Select.Option>
            <Select.Option value="STORE003">Mall Store</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Phone Extension" name="phone_extension">
          <Input placeholder="Enter phone extension (e.g., 101)" />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
        >
          <Select>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="on_leave">On Leave</Select.Option>
            <Select.Option value="terminated">Terminated</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Shift" name="shift">
          <Select placeholder="Select shift">
            <Select.Option value="morning">Morning</Select.Option>
            <Select.Option value="afternoon">Afternoon</Select.Option>
            <Select.Option value="evening">Evening</Select.Option>
            <Select.Option value="night">Night</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Hired Date" name="hired_at">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Avatar"
          name="avatar"
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList;
          }}
        >
          <Upload
            name="avatar"
            listType="picture"
            maxCount={1}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Upload Avatar</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Edit>
  );
};
