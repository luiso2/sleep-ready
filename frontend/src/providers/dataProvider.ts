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
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
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
      params.limit = pagination.pageSize;
    }

    if (filters) {
      filters.forEach((filter) => {
        if (filter.operator === "eq") {
          params[filter.field] = filter.value;
        } else if (filter.operator === "contains") {
          params.search = filter.value;
        }
      });
    }

    if (sorters) {
      const sorter = sorters[0];
      if (sorter) {
        params.sort = sorter.field;
        params.order = sorter.order;
      }
    }

    const { data } = await axiosInstance.get(url, { params });

    return {
      data: data.data || [],
      total: data.pagination?.total || data.data?.length || 0,
    };
  },

  // Get single resource
  getOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.get(`/${resource}/${id}`);
    return {
      data: data.data,
    };
  },

  // Create new resource
  create: async ({ resource, variables }) => {
    const { data } = await axiosInstance.post(`/${resource}`, variables);
    return {
      data: data.data,
    };
  },

  // Update existing resource
  update: async ({ resource, id, variables }) => {
    const { data } = await axiosInstance.put(`/${resource}/${id}`, variables);
    return {
      data: data.data,
    };
  },

  // Delete resource
  deleteOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.delete(`/${resource}/${id}`);
    return {
      data: data.data,
    };
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

    const { data } = await axiosInstance(config);
    return Promise.resolve({ data });
  },
};
