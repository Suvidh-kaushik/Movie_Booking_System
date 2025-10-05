"use client";

import { useAppData, user_service } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { 
  Film, 
  Building2, 
  Monitor, 
  Calendar,
  Users,
  Ticket,
  Settings,
  LogOut,
  Plus,
  BarChart3,
  Shield
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface AdminStats {
  totalMovies: number;
  totalTheaters: number;
  totalScreens: number;
  totalShows: number;
}

export default function AdminDashboard() {
  const { user, isAuth, loading, logoutUser } = useAppData();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalMovies: 0,
    totalTheaters: 0,
    totalScreens: 0,
    totalShows: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isAuth && !loading) {
      console.log("Auth:", isAuth, "Loading:", loading, "User:", user);
      router.push("/login");
    }
  }, [isAuth, router, loading]);

useEffect(() => {
  if (isAuth) {
    fetchStats();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuth]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      // Fetch movies
      const moviesResponse = await axios.get(`${user_service}/api/v1/booking/movie`, {
        withCredentials: true
      });
      
      // Fetch theaters
      const theatersResponse = await axios.get(`${user_service}/api/v1/admin/theater`, {
        withCredentials: true
      });

      const totalMovies = moviesResponse.data.movies?.length || 0;
      const totalTheaters = theatersResponse.data.theaters?.length || 0;
      
      // Calculate screens and shows
      let totalScreens = 0;
      let totalShows = 0;
      
      for (const theater of theatersResponse.data.theaters || []) {
        const screensResponse = await axios.get(
          `${user_service}/api/v1/admin/theater/${theater._id}/screen`,
          { withCredentials: true }
        );
        totalScreens += screensResponse.data.screens?.length || 0;
        
        for (const screen of screensResponse.data.screens || []) {
          totalShows += screen.shows?.length || 0;
        }
      }

      setStats({
        totalMovies,
        totalTheaters,
        totalScreens,
        totalShows
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch dashboard statistics");
    } finally {
      setLoadingStats(false);
    }
  }, [user_service]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  const adminMenuItems = [
    {
      title: "Movies",
      description: "Manage movies and their details",
      icon: Film,
      color: "blue",
      href: "/admin/movies",
      action: "Add Movie"
    },
    {
      title: "Theaters",
      description: "Manage theater locations",
      icon: Building2,
      color: "green",
      href: "/admin/theaters",
      action: "Add Theater"
    },
    {
      title: "Screens",
      description: "Manage theater screens",
      icon: Monitor,
      color: "purple",
      href: "/admin/screens",
      action: "Add Screen"
    },
    {
      title: "Shows",
      description: "Schedule movie shows",
      icon: Calendar,
      color: "orange",
      href: "/admin/shows",
      action: "Add Show"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-600 hover:bg-blue-700 border-blue-500",
      green: "bg-green-600 hover:bg-green-700 border-green-500",
      purple: "bg-purple-600 hover:bg-purple-700 border-purple-500",
      orange: "bg-orange-600 hover:bg-orange-700 border-orange-500"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-white text-xl">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">Manage your movie booking system</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white text-sm font-medium">{user?.username}</p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} className="text-white" />
                <span className="text-white text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.username}! 👋
                </h2>
                <p className="text-red-100 text-lg">
                  Manage your movie booking system efficiently
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <BarChart3 size={40} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <Film size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Movies</p>
                <p className="text-2xl font-bold text-white">{stats.totalMovies}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Theaters</p>
                <p className="text-2xl font-bold text-white">{stats.totalTheaters}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                <Monitor size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Screens</p>
                <p className="text-2xl font-bold text-white">{stats.totalScreens}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Shows</p>
                <p className="text-2xl font-bold text-white">{stats.totalShows}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  onClick={() => router.push(item.href)}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${getColorClasses(item.color)} rounded-lg flex items-center justify-center`}>
                      <IconComponent size={24} className="text-white" />
                    </div>
                    <Plus size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  
                  <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 text-sm font-medium">
                      {item.action}
                    </span>
                    <div className="text-gray-400 text-sm">
                      Manage →
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/admin/movies")}
              className="flex items-center space-x-3 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Film size={20} className="text-white" />
              <span className="text-white font-medium">Add New Movie</span>
            </button>
            
            <button
              onClick={() => router.push("/admin/theaters")}
              className="flex items-center space-x-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Building2 size={20} className="text-white" />
              <span className="text-white font-medium">Add New Theater</span>
            </button>
            
            <button
              onClick={() => router.push("/admin/shows")}
              className="flex items-center space-x-3 p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
            >
              <Calendar size={20} className="text-white" />
              <span className="text-white font-medium">Schedule Show</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
