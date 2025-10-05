"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export const user_service = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:3001";

export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface Movie {
  _id:string;
  title:string;
  duration:number;
  genre:string;
  language:string;
  releaseDate:string;
  shows:string[];
  image?: string;
}


interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchMovies: () => Promise<void>;
  movies: Movie[] | null;
  users: User[] | null;
  setMovies: React.Dispatch<React.SetStateAction<Movie[] | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      setLoading(true);
  
      // Determine role — from localStorage or context
      const role = localStorage.getItem("role"); // "user" or "admin"
  
      const endpoint =
        role === "admin"
          ? `${user_service}/api/v1/admin/self`
          : `${user_service}/api/v1/user/self`;
  
      const { data } = await axios.get(endpoint, {
        withCredentials: true,
      });
  
      setUser(data.user);
      setIsAuth(true);
    } catch (error: any) {
      console.log("Fetch user error:", error.response?.status);
      setIsAuth(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }
  

  async function logoutUser() {
    try {
      await axios.post(
        `${user_service}/api/v1/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      setIsAuth(false);
      toast.success("User Logged Out");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  }

  const [movies, setMovies] = useState<Movie[] | null>(null);
  const fetchMovies = useCallback(async () => {
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get(`${user_service}/api/v1/booking/movie`, {
        withCredentials: true
      });
      setMovies(data.movies);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const [users, setUsers] = useState<User[] | null>(null);

  async function fetchUsers() {
    const token = Cookies.get("token");

    try {
      const { data } = await axios.get(`${user_service}/api/v1/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser();
    fetchMovies();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        logoutUser,
        fetchMovies,
        fetchUsers,
        movies,
        users,
        setMovies,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useappdata must be used within AppProvider");
  }
  return context;
};
