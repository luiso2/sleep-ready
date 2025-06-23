const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Product {
  static async findAll(filters = {}, page = 1, pageSize = 20, sort = 'created_at', order = 'DESC') {
    const offset = (page - 1) * pageSize;
    let whereClause = 'WHERE 1=1';
    const values = [];
    let valueIndex = 1;

    // Apply filters
    if (filters.category) {
      whereClause += ` AND category = $${valueIndex}`;
      values.push(filters.category);
      valueIndex++;
    }

    if (filters.status) {
      whereClause += ` AND status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }

    if (filters.brand) {
      whereClause += ` AND LOWER(brand) LIKE $${valueIndex}`;
      values.push(`%${filters.brand.toLowerCase()}%`);
      valueIndex++;
    }

    if (filters.minPrice) {
      whereClause += ` AND price >= $${valueIndex}`;
      values.push(filters.minPrice);
      valueIndex++;
    }

    if (filters.maxPrice) {
      whereClause += ` AND price <= $${valueIndex}`;
      values.push(filters.maxPrice);
      valueIndex++;
    }

    try {
      // Get total count
      const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;
      const countResult = await db.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Get products
      const query = `
        SELECT * FROM products
        ${whereClause}
        ORDER BY ${sort} ${order}
        LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
      `;
      values.push(pageSize, offset);

      const result = await db.query(query, values);

      return {
        data: result.rows,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      console.error('Error in Product.findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = 'SELECT * FROM products WHERE id = $1';
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Product.findById:', error);
      throw error;
    }
  }

  static async findBySku(sku) {
    try {
      const query = 'SELECT * FROM products WHERE sku = $1';
      const result = await db.query(query, [sku]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Product.findBySku:', error);
      throw error;
    }
  }

  static async create(productData) {
    const id = productData.id || uuidv4();
    const {
      name,
      description,
      category,
      brand,
      model,
      sku,
      price,
      cost,
      commission_rate = 5.00,
      stock_quantity = 0,
      min_stock = 5,
      features,
      specifications,
      images = [],
      tags = [],
      status = 'active',
      warranty_months = 12
    } = productData;

    try {
      const query = `
        INSERT INTO products (
          id, name, description, category, brand, model, sku, price, cost,
          commission_rate, stock_quantity, min_stock, features, specifications,
          images, tags, status, warranty_months
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *
      `;

      const values = [
        id, name, description, category, brand, model, sku, price, cost,
        commission_rate, stock_quantity, min_stock, features, specifications,
        images, tags, status, warranty_months
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Product.create:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let valueIndex = 1;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && updateData[key] !== undefined) {
        fields.push(`${key} = $${valueIndex}`);
        values.push(updateData[key]);
        valueIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    try {
      const query = `
        UPDATE products
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${valueIndex}
        RETURNING *
      `;

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Product.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Product.delete:', error);
      throw error;
    }
  }

  static async searchProducts(searchTerm) {
    try {
      const query = `
        SELECT * FROM products
        WHERE 
          LOWER(name) LIKE $1 OR
          LOWER(description) LIKE $1 OR
          LOWER(sku) LIKE $1 OR
          LOWER(brand) LIKE $1 OR
          LOWER(model) LIKE $1
        ORDER BY name ASC
        LIMIT 50
      `;
      
      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      const result = await db.query(query, [searchPattern]);
      
      return result.rows;
    } catch (error) {
      console.error('Error in Product.searchProducts:', error);
      throw error;
    }
  }

  static async getLowStock() {
    try {
      const query = `
        SELECT * FROM products
        WHERE stock_quantity <= min_stock AND status = 'active'
        ORDER BY stock_quantity ASC
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in Product.getLowStock:', error);
      throw error;
    }
  }

  static async getCategories() {
    try {
      const query = `
        SELECT DISTINCT category, COUNT(*) as count
        FROM products
        WHERE status = 'active'
        GROUP BY category
        ORDER BY category ASC
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in Product.getCategories:', error);
      throw error;
    }
  }

  static async updateStock(id, quantity, operation = 'set') {
    try {
      let query;
      
      switch (operation) {
        case 'add':
          query = `
            UPDATE products
            SET stock_quantity = stock_quantity + $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
          `;
          break;
        case 'subtract':
          query = `
            UPDATE products
            SET stock_quantity = GREATEST(0, stock_quantity - $1), updated_at = NOW()
            WHERE id = $2
            RETURNING *
          `;
          break;
        case 'set':
        default:
          query = `
            UPDATE products
            SET stock_quantity = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
          `;
          break;
      }
      
      const result = await db.query(query, [quantity, id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Product.updateStock:', error);
      throw error;
    }
  }
}

module.exports = Product;
