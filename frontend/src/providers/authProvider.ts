import { AuthProvider } from "@refinedev/core";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add token to requests
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

export const authProvider: AuthProvider = {
  // Login method
  login: async ({ email, password, remember }) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      if (data.success) {
        const { token, user } = data.data;
        
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        // Check if there's a redirect URL stored
        const redirectTo = localStorage.getItem("redirectTo");
        if (redirectTo) {
          localStorage.removeItem("redirectTo");
          return {
            success: true,
            redirectTo: redirectTo,
          };
        }
        
        return {
          success: true,
          redirectTo: "/",
        };
      } else {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: data.message || "Login failed",
          },
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error.response?.data?.message || "Login failed",
        },
      };
    }
  },

  // Logout method
  logout: async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        await axiosInstance.post("/auth/logout", {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error);
    }

    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("redirectTo");
    
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  // Check auth status
  check: async () => {
    const token = localStorage.getItem("auth_token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      return {
        authenticated: false,
        error: {
          message: "Authentication required",
          name: "Unauthorized",
        },
        logout: true,
        redirectTo: "/login",
      };
    }

    try {
      // Verify token with backend
      const { data } = await axiosInstance.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        // Update user info in localStorage
        localStorage.setItem("user", JSON.stringify(data.data));
        
        return {
          authenticated: true,
        };
      } else {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        
        return {
          authenticated: false,
          error: {
            message: "Token verification failed",
            name: "Unauthorized",
          },
          logout: true,
          redirectTo: "/login",
        };
      }
    } catch (error: any) {
      // Only clear tokens if it's a 401 error
      if (error.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        
        return {
          authenticated: false,
          error: {
            message: "Session expired",
            name: "Unauthorized",
          },
          logout: true,
          redirectTo: "/login",
        };
      }
      
      // For other errors, keep the user logged in
      console.error("Auth check error:", error);
      return {
        authenticated: true,
      };
    }
  },

  // Get error
  onError: async (error) => {
    console.error("Auth error:", error);
    
    // Only logout on 401 errors
    if (error?.statusCode === 401 || error?.response?.status === 401) {
      return {
        logout: true,
        redirectTo: "/login",
        error: {
          message: "Session expired, please login again",
          name: "Unauthorized",
        },
      };
    }

    return { logout: false };
  },

  // Get permissions
  getPermissions: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return userData.role;
    }
    return null;
  },

  // Get identity
  getIdentity: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`,
        avatar: userData.avatar,
        email: userData.email,
        role: userData.role,
      };
    }
    return null;
  },
};
