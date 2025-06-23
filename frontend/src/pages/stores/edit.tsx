import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, TimePicker } from "antd";
import { IStore } from "../../interfaces";
import dayjs from "dayjs";

export const StoreEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<IStore>();

  const storeData = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Store Code"
          name="code"
          rules={[
            {
              required: true,
              message: "Please enter store code",
            },
            {
              pattern: /^[A-Z0-9]+$/,
              message: "Store code must be uppercase letters and numbers only",
            },
          ]}
        >
          <Input placeholder="Enter store code (e.g., STORE001)" />
        </Form.Item>

        <Form.Item
          label="Store Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please enter store name",
            },
          ]}
        >
          <Input placeholder="Enter store name" />
        </Form.Item>

        <Form.Item label="Phone" name="phone">
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <Form.Item label="Manager" name="manager_id">
          <Select placeholder="Select store manager">
            <Select.Option value="EMP001">John Doe</Select.Option>
            <Select.Option value="EMP002">Jane Smith</Select.Option>
            <Select.Option value="EMP003">Mike Johnson</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
        >
          <Select>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Address">
          <Input.Group>
            <Form.Item
              name={["address", "street"]}
              noStyle
              rules={[{ required: true, message: "Street is required" }]}
            >
              <Input
                placeholder="Street Address"
                style={{ marginBottom: 8 }}
              />
            </Form.Item>
            <Form.Item
              name={["address", "city"]}
              noStyle
              rules={[{ required: true, message: "City is required" }]}
            >
              <Input placeholder="City" style={{ marginBottom: 8 }} />
            </Form.Item>
            <Form.Item
              name={["address", "state"]}
              noStyle
              rules={[{ required: true, message: "State is required" }]}
            >
              <Input placeholder="State" style={{ marginBottom: 8 }} />
            </Form.Item>
            <Form.Item
              name={["address", "zip"]}
              noStyle
              rules={[{ required: true, message: "ZIP code is required" }]}
            >
              <Input placeholder="ZIP Code" />
            </Form.Item>
          </Input.Group>
        </Form.Item>

        <Form.Item label="Business Hours">
          <Input.Group>
            <Form.Item
              name={["hours", "monday", "open"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Monday Open"
                style={{ width: "48%", marginRight: "4%" }}
              />
            </Form.Item>
            <Form.Item
              name={["hours", "monday", "close"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Monday Close"
                style={{ width: "48%", marginBottom: 8 }}
              />
            </Form.Item>

            <Form.Item
              name={["hours", "tuesday", "open"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Tuesday Open"
                style={{ width: "48%", marginRight: "4%" }}
              />
            </Form.Item>
            <Form.Item
              name={["hours", "tuesday", "close"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Tuesday Close"
                style={{ width: "48%", marginBottom: 8 }}
              />
            </Form.Item>

            <Form.Item
              name={["hours", "wednesday", "open"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Wednesday Open"
                style={{ width: "48%", marginRight: "4%" }}
              />
            </Form.Item>
            <Form.Item
              name={["hours", "wednesday", "close"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Wednesday Close"
                style={{ width: "48%", marginBottom: 8 }}
              />
            </Form.Item>

            <Form.Item
              name={["hours", "thursday", "open"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Thursday Open"
                style={{ width: "48%", marginRight: "4%" }}
              />
            </Form.Item>
            <Form.Item
              name={["hours", "thursday", "close"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Thursday Close"
                style={{ width: "48%", marginBottom: 8 }}
              />
            </Form.Item>

            <Form.Item
              name={["hours", "friday", "open"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Friday Open"
                style={{ width: "48%", marginRight: "4%" }}
              />
            </Form.Item>
            <Form.Item
              name={["hours", "friday", "close"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Friday Close"
                style={{ width: "48%", marginBottom: 8 }}
              />
            </Form.Item>

            <Form.Item
              name={["hours", "saturday", "open"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Saturday Open"
                style={{ width: "48%", marginRight: "4%" }}
              />
            </Form.Item>
            <Form.Item
              name={["hours", "saturday", "close"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Saturday Close"
                style={{ width: "48%", marginBottom: 8 }}
              />
            </Form.Item>

            <Form.Item
              name={["hours", "sunday", "open"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Sunday Open"
                style={{ width: "48%", marginRight: "4%" }}
              />
            </Form.Item>
            <Form.Item
              name={["hours", "sunday", "close"]}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Sunday Close"
                style={{ width: "48%" }}
              />
            </Form.Item>
          </Input.Group>
        </Form.Item>

        <Form.Item label="Service Area">
          <Input.Group>
            <Form.Item
              name={["service_area", "radius"]}
              noStyle
            >
              <Input
                type="number"
                placeholder="Service radius (miles)"
                style={{ marginBottom: 8 }}
              />
            </Form.Item>
            <Form.Item
              name={["service_area", "zip_codes"]}
              noStyle
            >
              <Select
                mode="tags"
                placeholder="Add ZIP codes served"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Input.Group>
        </Form.Item>
      </Form>
    </Edit>
  );
};
