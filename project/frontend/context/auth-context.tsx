"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

export interface User {
  id: string
  name: string
  password?: string
  passwordPlaintext?: string
  role: "superadmin" | "admin" | "peminjam" | "teknisi"
  createdAt: string
}

export interface Item {
  id: string
  name: string
  description: string
  category: string
  quantity: number
  location: string
  latitude: number
  longitude: number
  status: "aktif" | "tidak_aktif"
  createdBy: string
  createdAt: string
  updatedAt: string
  maintenanceRecords?: any[]
  assetId?: string
  machineName?: string
  brand?: string
  model?: string
  serialNumber?: string
  assetTag?: string
  statusMesin?: string
  tingkatPrioritas?: string
  kondisiFisik?: string
  jamOperasional?: string
  loanRecords?: any[]
  floor?: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  items: Item[]
  addItem: (item: any) => void
  updateItem: (id: string, item: any) => void
  deleteItem: (id: string) => void
  users: User[]
  addUser: (user: Omit<User, "id" | "createdAt">) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  addMaintenanceRecord: (itemId: string, formData: FormData) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Use the same hostname as the frontend, but on port 5000
  // This allows access from other devices on the network (e.g. mobile)
  const API_URL = typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' ? "http://localhost:5000" : "https://api.engilog.site")
    : "http://localhost:5000";

  // Initialize data
  useEffect(() => {
    const init = async () => {
      // Check for saved user in localStorage (for persistence across refreshes)
      const savedUser = localStorage.getItem("currentUser")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }

      try {
        await fetchItems();
        // Only fetch users if needed, or fetch all for now
        // await fetchUsers(); 
      } catch (error) {
        console.error("Failed to initialize data:", error);
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  // Fetch users when user role changes to admin/superadmin
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchUsers();
    }
  }, [user]);

  // Setup Axios Interceptor to add User ID to requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(config => {
      if (user?.id) {
        config.headers['x-user-id'] = user.id;
      }
      return config;
    });
    return () => {
      axios.interceptors.request.eject(interceptor);
    }
  }, [user]);


  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/items`);
      console.log("Items fetched:", res.data); // Debug log
      if (Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        console.error("API returned non-array for items:", res.data);
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]); // Fallback to empty array
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  // Session Timeout Logic (10 minutes)
  const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes in ms

  const updateActivity = () => {
    if (user) {
      localStorage.setItem("auth_last_active", Date.now().toString());
    }
  };

  const checkSessionTimeout = () => {
    const lastActive = localStorage.getItem("auth_last_active");
    if (lastActive) {
      const now = Date.now();
      if (now - parseInt(lastActive) > TIMEOUT_DURATION) {
        console.log("Session timed out due to inactivity");
        logout();
      }
    }
  };

  // Setup activity listeners
  useEffect(() => {
    if (!user) return;

    // Set initial activity timestamp if missing
    if (!localStorage.getItem("auth_last_active")) {
      updateActivity();
    }

    // Check timeout immediately on mount (for re-entry)
    checkSessionTimeout();

    const events = ["mousemove", "click", "keypress", "scroll", "touchstart"];

    // Throttle updates to avoid excessive localStorage writes
    let throttleTimer: NodeJS.Timeout;
    const handleActivity = () => {
      if (!throttleTimer) {
        updateActivity();
        throttleTimer = setTimeout(() => {
          throttleTimer = undefined!;
        }, 5000); // Update at most every 5 seconds
      }
    };

    events.forEach(event => window.addEventListener(event, handleActivity));

    // Check for timeout every 1 minute
    const interval = setInterval(checkSessionTimeout, 60000);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearInterval(interval);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [user]);

  const login = async (username: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      const userData = res.data;
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("auth_last_active", Date.now().toString()); // Initialize activity

      // Refresh data
      await fetchItems();
      if (userData.role === 'admin' || userData.role === 'superadmin') {
        await fetchUsers();
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
    localStorage.removeItem("auth_last_active") // Clear activity
    setItems([])
    setUsers([])
    // Redirect to login is handled by protected route wrapper or effect
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  const addItem = async (itemData: any) => {
    try {
      const config = itemData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      await axios.post(`${API_URL}/items`, itemData, config);
      await fetchItems(); // Refresh list
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  }

  const updateItem = async (id: string, itemData: any) => {
    try {
      const config = itemData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      await axios.put(`${API_URL}/items/${id}`, itemData, config);
      await fetchItems(); // Refresh list
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/items/${id}`);
      await fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  }

  const addUser = async (userData: Omit<User, "id" | "createdAt">) => {
    try {
      await axios.post(`${API_URL}/users`, userData);
      await fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  }

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      await axios.put(`${API_URL}/users/${id}`, userData);
      await fetchUsers();
      // Update current user if it's the same person
      if (user?.id === id) {
        // fetch updated user data or merge
        setUser(prev => prev ? { ...prev, ...userData } : null);
        localStorage.setItem("currentUser", JSON.stringify({ ...user, ...userData }));
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/users/${id}`);
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  const addMaintenanceRecord = async (itemId: string, formData: FormData) => {
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      await axios.post(`${API_URL}/items/${itemId}/maintenance`, formData, config);
      await fetchItems(); // Refresh items to show new record
    } catch (error) {
      console.error("Error adding maintenance record:", error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        items,
        addItem,
        updateItem,
        deleteItem,
        users,
        addUser,
        updateUser,
        deleteUser,
        addMaintenanceRecord,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
