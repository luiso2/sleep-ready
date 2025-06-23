import { DataProvider } from "@refinedev/core";
import axios, { AxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't directly navigate, let authProvider handle it
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        // Store the current location to redirect back after login
        localStorage.setItem('redirectTo', currentPath);
      }
    }
    return Promise.reject(error);
  }
);

export const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,

  // Get list of resources with pagination
  getList: async ({ resource, pagination, filters, sorters }) => {
    const url = `/${resource}`;
    
    const params: any = {};
    
    if (pagination) {
      params.page = pagination.current;
      params.pageSize = pagination.pageSize;
    }

    if (filters) {
      filters.forEach((filter) => {
        if (filter.field === "q" || filter.field === "search") {
          params.q = filter.value;
        } else if (filter.operator === "eq") {
          params[filter.field] = filter.value;
        } else if (filter.operator === "contains") {
          params[`${filter.field}_like`] = filter.value;
        } else if (filter.operator === "between") {
          if (Array.isArray(filter.value)) {
            params[`${filter.field}_gte`] = filter.value[0];
            params[`${filter.field}_lte`] = filter.value[1];
          }
        } else if (filter.operator === "gte") {
          params[`${filter.field}_gte`] = filter.value;
        } else if (filter.operator === "lte") {
          params[`${filter.field}_lte`] = filter.value;
        }
      });
    }

    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      params.sort = sorter.field;
      params.order = sorter.order;
    }

    try {
      const { data } = await axiosInstance.get(url, { params });

      // Handle different response formats
      let responseData = [];
      let total = 0;

      if (data.success && data.data) {
        responseData = data.data;
        total = data.total || data.data.length;
      } else if (data.success && data.items) {
        responseData = data.items;
        total = data.total || data.items.length;
      } else if (Array.isArray(data)) {
        responseData = data;
        total = data.length;
      }

      return {
        data: responseData,
        total: total,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw {
          message: "Authentication required",
          statusCode: 401,
        };
      }
      throw error;
    }
  },

  // Get single resource
  getOne: async ({ resource, id }) => {
    try {
      const { data } = await axiosInstance.get(`/${resource}/${id}`);
      
      // Handle different response formats
      let responseData = data;
      
      if (data.success && data.data) {
        responseData = data.data;
      }

      return {
        data: responseData,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw {
          message: "Authentication required",
          statusCode: 401,
        };
      }
      throw error;
    }
  },

  // Create new resource
  create: async ({ resource, variables }) => {
    try {
      const { data } = await axiosInstance.post(`/${resource}`, variables);
      
      // Handle different response formats
      let responseData = data;
      
      if (data.success && data.data) {
        responseData = data.data;
      }

      return {
        data: responseData,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw {
          message: "Authentication required",
          statusCode: 401,
        };
      }
      throw error;
    }
  },

  // Update existing resource
  update: async ({ resource, id, variables }) => {
    try {
      const { data } = await axiosInstance.put(`/${resource}/${id}`, variables);
      
      // Handle different response formats
      let responseData = data;
      
      if (data.success && data.data) {
        responseData = data.data;
      }

      return {
        data: responseData,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw {
          message: "Authentication required",
          statusCode: 401,
        };
      }
      throw error;
    }
  },

  // Delete resource
  deleteOne: async ({ resource, id }) => {
    try {
      const { data } = await axiosInstance.delete(`/${resource}/${id}`);
      
      // Handle different response formats
      let responseData = data;
      
      if (data.success && data.data) {
        responseData = data.data;
      }

      return {
        data: responseData,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw {
          message: "Authentication required",
          statusCode: 401,
        };
      }
      throw error;
    }
  },

  // Get many resources by IDs
  getMany: async ({ resource, ids }) => {
    try {
      const promises = ids.map((id) =>
        axiosInstance.get(`/${resource}/${id}`)
      );
      
      const responses = await Promise.all(promises);
      
      return {
        data: responses.map((response) => {
          if (response.data.success && response.data.data) {
            return response.data.data;
          }
          return response.data;
        }),
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw {
          message: "Authentication required",
          statusCode: 401,
        };
      }
      throw error;
    }
  },

  // Custom method for API calls
  custom: async ({ url, method, payload, query, headers }) => {
    let requestUrl = url;

    if (query) {
      const queryString = new URLSearchParams(query).toString();
      requestUrl = `${url}?${queryString}`;
    }

    const config: AxiosRequestConfig = {
      url: requestUrl,
      method: method as any,
      data: payload,
      headers,
    };

    try {
      const { data } = await axiosInstance(config);
      return Promise.resolve({ data });
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw {
          message: "Authentication required",
          statusCode: 401,
        };
      }
      throw error;
    }
  },
};
