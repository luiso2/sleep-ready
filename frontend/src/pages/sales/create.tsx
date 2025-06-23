import React, { useState } from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, DatePicker, Space, Button, Divider } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { ISale, ICustomer, IProduct, IEmployee, IStore } from "../../interfaces";

export const SaleCreate: React.FC = () => {
  const { formProps, saveButtonProps, form } = useForm<ISale>();
  const [saleType, setSaleType] = useState<string>("product");

  const { selectProps: customerSelectProps } = useSelect<ICustomer>({
    resource: "customers",
    optionLabel: (item) => `${item.first_name} ${item.last_name}`,
    optionValue: "id",
  });

  const { selectProps: productSelectProps } = useSelect<IProduct>({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
  });

  const { selectProps: employeeSelectProps } = useSelect<IEmployee>({
    resource: "employees",
    optionLabel: (item) => `${item.first_name} ${item.last_name}`,
    optionValue: "id",
  });

  const { selectProps: storeSelectProps } = useSelect<IStore>({
    resource: "stores",
    optionLabel: "name",
    optionValue: "id",
  });

  const calculateTotal = () => {
    const subtotal = form?.getFieldValue(["amount", "subtotal"]) || 0;
    const tax = form?.getFieldValue(["amount", "tax"]) || 0;
    const discount = form?.getFieldValue(["amount", "discount"]) || 0;
    const total = subtotal + tax - discount;
    form?.setFieldValue(["amount", "total"], total);
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onValuesChange={calculateTotal}>
        <Form.Item
          label="Sale Type"
          name="type"
          rules={[{ required: true, message: "Please select sale type" }]}
          initialValue="product"
        >
          <Select onChange={setSaleType}>
            <Select.Option value="product">Product Sale</Select.Option>
            <Select.Option value="subscription">Subscription</Select.Option>
            <Select.Option value="trade">Trade-in</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Sales Channel"
          name="channel"
          rules={[{ required: true, message: "Please select channel" }]}
          initialValue="store"
        >
          <Select>
            <Select.Option value="store">Store</Select.Option>
            <Select.Option value="phone">Phone</Select.Option>
            <Select.Option value="online">Online</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Customer"
          name="customer_id"
          rules={[{ required: true, message: "Please select customer" }]}
        >
          <Select
            showSearch
            placeholder="Select customer"
            {...customerSelectProps}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Sales Agent"
          name="user_id"
          rules={[{ required: true, message: "Please select sales agent" }]}
        >
          <Select
            showSearch
            placeholder="Select sales agent"
            {...employeeSelectProps}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Store"
          name="store_id"
          rules={[{ required: true, message: "Please select store" }]}
        >
          <Select
            showSearch
            placeholder="Select store"
            {...storeSelectProps}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {saleType === "subscription" && (
          <Form.Item
            label="Subscription Plan"
            name="subscription_id"
          >
            <Select placeholder="Select subscription plan">
              <Select.Option value="basic">Basic Plan - $19.99/month</Select.Option>
              <Select.Option value="premium">Premium Plan - $39.99/month</Select.Option>
              <Select.Option value="elite">Elite Plan - $99.99/month</Select.Option>
            </Select>
          </Form.Item>
        )}

        <Divider>Amount Details</Divider>

        <Form.Item
          label="Subtotal"
          name={["amount", "subtotal"]}
          rules={[{ required: true, message: "Please enter subtotal" }]}
        >
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

        <Form.Item
          label="Tax"
          name={["amount", "tax"]}
          initialValue={0}
        >
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

        <Form.Item
          label="Discount"
          name={["amount", "discount"]}
          initialValue={0}
        >
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

        <Form.Item
          label="Total"
          name={["amount", "total"]}
        >
          <InputNumber
            formatter={(value) =>
              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
            style={{ width: "100%" }}
            min={0}
            precision={2}
            disabled
          />
        </Form.Item>

        <Form.Item
          label="Payment Status"
          name="payment_status"
          initialValue="pending"
        >
          <Select>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="paid">Paid</Select.Option>
            <Select.Option value="failed">Failed</Select.Option>
          </Select>
        </Form.Item>

        {saleType === "product" && (
          <>
            <Divider>Contract Details</Divider>
            
            <Form.Item
              label="Contract Type"
              name={["contract", "type"]}
            >
              <Select placeholder="Select contract type">
                <Select.Option value="standard">Standard</Select.Option>
                <Select.Option value="lease">Lease to Own</Select.Option>
                <Select.Option value="financing">Financing</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Contract Terms"
              name={["contract", "terms"]}
            >
              <Input.TextArea rows={3} placeholder="Enter contract terms" />
            </Form.Item>

            <Form.Item
              label="Financing Rate (%)"
              name={["contract", "financing_rate"]}
            >
              <InputNumber
                min={0}
                max={100}
                formatter={(value) => `${value}%`}
                parser={(value) => value!.replace("%", "")}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </>
        )}

        <Divider>Commission Details</Divider>

        <Form.Item
          label="Commission Rate (%)"
          name={["commission", "rate"]}
          initialValue={5}
        >
          <InputNumber
            min={0}
            max={100}
            formatter={(value) => `${value}%`}
            parser={(value) => value!.replace("%", "")}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label="Commission Amount"
          name={["commission", "amount"]}
        >
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

        <Form.Item
          label="Call Reference"
          name="call_id"
        >
          <Input placeholder="Enter call ID if applicable" />
        </Form.Item>
      </Form>
    </Create>
  );
};
