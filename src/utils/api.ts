
import { toast } from "sonner";

// Base API URL - defaults to current domain
const API_BASE_URL = `${window.location.origin}/api`;

/**
 * Custom API client for making authenticated requests to the backend
 */
interface ApiOptions {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  suppressToast?: boolean;
}

/**
 * Custom API error class that includes status code
 */
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Makes an authenticated API request to the backend
 * Automatically includes credentials for cookies
 */
export async function apiRequest<T>({
  endpoint,
  method = "GET",
  body = undefined,
  headers = {},
  suppressToast = false,
}: ApiOptions): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  try {
    // Create fetch options with credentials to include cookies
    const options: RequestInit = {
      method,
      credentials: "include", // This is crucial for sending cookies
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    // Add body for non-GET requests
    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    // Make the request
    const response = await fetch(url, options);
    
    // Handle non-2xx responses
    if (!response.ok) {
      // Try to parse error response
      let errorData;
      try {
        // Check if the content type is JSON
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          // Handle HTML or other non-JSON responses
          errorData = { message: "Unexpected server response format" };
        }
      } catch (e) {
        errorData = { message: "An unknown error occurred" };
      }
      
      // Handle auth errors specially - but don't handle redirects here, let the component decide
      if (response.status === 401) {
        if (!suppressToast) {
          toast.error("Session expired. Please log in again.");
        }
        throw new ApiError("Authentication failed", response.status);
      }
      
      // Handle 404 with "Invalid tenant or subdomain" message - but let component handle redirect
      if (response.status === 404 && errorData.error === "Invalid tenant or subdomain") {
        if (!suppressToast) {
          toast.error("Invalid tenant or subdomain.");
        }
        throw new ApiError("Invalid tenant or subdomain", response.status);
      }
      
      // Handle 503 Service Unavailable errors - but let component handle redirect
      if (response.status === 503) {
        if (!suppressToast) {
          toast.error("Service unavailable. Please try again later.");
        }
        throw new ApiError("Service unavailable", response.status);
      }
      
      throw new ApiError(errorData.message || errorData.error || "Request failed", response.status);
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data as T;
    } else {
      // Handle non-JSON responses
      console.error("Received non-JSON response:", await response.text().catch(() => "Unable to read response text"));
      throw new ApiError("Unexpected server response format", response.status);
    }
  } catch (error) {
    console.error("API request failed:", error);
    
    // Show a toast unless suppressed
    if (!suppressToast && !(error instanceof ApiError)) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    }
    
    // Re-throw to allow handling by the caller
    throw error;
  }
}

/**
 * Logout the current user
 */
export async function logout() {
  try {
    // Send logout request to current subdomain API
    await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    
    // Send logout request to main domain API
    await fetch(`https://mausamcrm.site/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    
    toast.success("Logged out successfully");
    
    // Redirect to login page after successful logout
    window.location.href = "https://mausamcrm.site/login";
  } catch (error) {
    console.error("Logout failed:", error);
    toast.error("Failed to log out. Please try again.");
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>, suppressToast?: boolean) => 
    apiRequest<T>({ endpoint, method: "GET", headers, suppressToast }),
  
  post: <T>(endpoint: string, body: any, headers?: Record<string, string>, suppressToast?: boolean) => 
    apiRequest<T>({ endpoint, method: "POST", body, headers, suppressToast }),
  
  put: <T>(endpoint: string, body: any, headers?: Record<string, string>, suppressToast?: boolean) => 
    apiRequest<T>({ endpoint, method: "PUT", body, headers, suppressToast }),
  
  delete: <T>(endpoint: string, headers?: Record<string, string>, suppressToast?: boolean) => 
    apiRequest<T>({ endpoint, method: "DELETE", headers, suppressToast }),
};
