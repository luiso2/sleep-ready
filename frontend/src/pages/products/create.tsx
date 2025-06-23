import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { IProduct } from "../../interfaces";

export const ProductCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<IProduct>();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Product Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please enter product name",
            },
          ]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} placeholder="Enter product description" />
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[
            {
              required: true,
              message: "Please select a category",
            },
          ]}
        >
          <Select placeholder="Select category">
            <Select.Option value="mattresses">Mattresses</Select.Option>
            <Select.Option value="bases">Bases</Select.Option>
            <Select.Option value="pillows">Pillows</Select.Option>
            <Select.Option value="accessories">Accessories</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Brand" name="brand">
          <Input placeholder="Enter brand name" />
        </Form.Item>

        <Form.Item label="Model" name="model">
          <Input placeholder="Enter model name" />
        </Form.Item>

        <Form.Item label="SKU" name="sku">
          <Input placeholder="Enter SKU" />
        </Form.Item>

        <Form.Item
          label="Price"
          name="price"
          rules={[
            {
              required: true,
              message: "Please enter price",
            },
          ]}
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

        <Form.Item label="Cost" name="cost">
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
          label="Commission Rate (%)"
          name="commission_rate"
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
          label="Stock Quantity"
          name="stock_quantity"
          initialValue={0}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Minimum Stock"
          name="min_stock"
          initialValue={5}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Warranty (months)"
          name="warranty_months"
          initialValue={12}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          initialValue="active"
        >
          <Select>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Tags" name="tags">
          <Select
            mode="tags"
            placeholder="Add tags"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="Features">
          <Input.Group>
            <Form.Item
              name={["features", "size"]}
              noStyle
            >
              <Select placeholder="Size" style={{ width: "100%", marginBottom: 8 }}>
                <Select.Option value="twin">Twin</Select.Option>
                <Select.Option value="twin_xl">Twin XL</Select.Option>
                <Select.Option value="full">Full</Select.Option>
                <Select.Option value="queen">Queen</Select.Option>
                <Select.Option value="king">King</Select.Option>
                <Select.Option value="cal_king">California King</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name={["features", "firmness"]}
              noStyle
            >
              <Select placeholder="Firmness" style={{ width: "100%", marginBottom: 8 }}>
                <Select.Option value="soft">Soft</Select.Option>
                <Select.Option value="medium_soft">Medium Soft</Select.Option>
                <Select.Option value="medium">Medium</Select.Option>
                <Select.Option value="medium_firm">Medium Firm</Select.Option>
                <Select.Option value="firm">Firm</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name={["features", "material"]}
              noStyle
            >
              <Input placeholder="Material" style={{ marginBottom: 8 }} />
            </Form.Item>
            <Form.Item
              name={["features", "height"]}
              noStyle
            >
              <Input placeholder="Height (inches)" />
            </Form.Item>
          </Input.Group>
        </Form.Item>

        <Form.Item
          label="Product Images"
          name="images"
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList;
          }}
        >
          <Upload
            name="images"
            listType="picture-card"
            multiple
            beforeUpload={() => false}
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </Create>
  );
};
