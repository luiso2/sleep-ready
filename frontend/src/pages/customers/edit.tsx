import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, DatePicker } from "antd";
import { ICustomer } from "../../interfaces";

export const CustomerEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<ICustomer>();

  const customerData = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
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
              type: "email",
              message: "Please enter a valid email",
            },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            {
              pattern: /^[\d\s\-\+\(\)]+$/,
              message: "Please enter a valid phone number",
            },
          ]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <Form.Item label="Tier" name="tier">
          <Select>
            <Select.Option value="regular">Regular</Select.Option>
            <Select.Option value="premium">Premium</Select.Option>
            <Select.Option value="elite">Elite</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Membership Status" name="membership_status">
          <Select>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Source" name="source">
          <Select placeholder="Select customer source">
            <Select.Option value="walk-in">Walk-in</Select.Option>
            <Select.Option value="phone">Phone</Select.Option>
            <Select.Option value="online">Online</Select.Option>
            <Select.Option value="referral">Referral</Select.Option>
            <Select.Option value="campaign">Campaign</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Tags" name="tags">
          <Select
            mode="tags"
            placeholder="Add tags"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={4} placeholder="Enter any notes" />
        </Form.Item>

        <Form.Item
          label="Do Not Call"
          name="do_not_call"
          valuePropName="checked"
        >
          <Select>
            <Select.Option value={false}>No</Select.Option>
            <Select.Option value={true}>Yes</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Current Credit" name="current_credit">
          <InputNumber
            formatter={(value) =>
              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
            style={{ width: "100%" }}
            min={0}
            precision={2}
          />
        </Form.Item>

        <Form.Item label="Address">
          <Input.Group>
            <Form.Item
              name={["address", "street"]}
              noStyle
              rules={[{ required: false }]}
            >
              <Input
                placeholder="Street Address"
                style={{ marginBottom: 8 }}
              />
            </Form.Item>
            <Form.Item
              name={["address", "city"]}
              noStyle
              rules={[{ required: false }]}
            >
              <Input placeholder="City" style={{ marginBottom: 8 }} />
            </Form.Item>
            <Form.Item
              name={["address", "state"]}
              noStyle
              rules={[{ required: false }]}
            >
              <Input placeholder="State" style={{ marginBottom: 8 }} />
            </Form.Item>
            <Form.Item
              name={["address", "zip"]}
              noStyle
              rules={[{ required: false }]}
            >
              <Input placeholder="ZIP Code" />
            </Form.Item>
          </Input.Group>
        </Form.Item>
      </Form>
    </Edit>
  );
};
