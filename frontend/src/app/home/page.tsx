"use client";

import { useAppData } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { 
  Film, 
  User, 
  Calendar, 
  Clock, 
  Globe, 
  Star,
  LogOut,
  Settings,
  Ticket,
  TrendingUp,
  Shield
} from "lucide-react";

export default function HomePage() {
  const { movies, fetchMovies, loading, user, logoutUser } = useAppData();
  const router = useRouter();

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);


  const handleMovieClick = (movieId: string) => {
    router.push(`/movie/${movieId}`);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-white text-xl">Loading your dashboard...</div>
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
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Film size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Quick Movie BS</h1>
                <p className="text-gray-400 text-sm">Your Movie Booking Experience</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/profile")}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <Settings size={18} className="text-gray-300" />
                <span className="text-gray-300 text-sm">Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {getGreeting()}, {user?.username || "User"}! 👋
                </h2>
                <p className="text-blue-100 text-lg">
                  Discover amazing movies and book your tickets instantly
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User size={40} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <Film size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Available Movies</p>
                <p className="text-2xl font-bold text-white">{movies?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => router.push("/bookings")}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                  <Ticket size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Your Bookings</p>
                  <p className="text-2xl font-bold text-white">View All</p>
                </div>
              </div>
              <div className="text-green-400 text-sm font-medium">
                View →
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Shows</p>
                <p className="text-2xl font-bold text-white">
                  {movies?.reduce((total, movie) => total + movie.shows.length, 0) || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Movies Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Now Showing</h3>
              <p className="text-gray-400">Book tickets for your favorite movies</p>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <Star size={20} />
              <span className="text-sm font-medium">Featured</span>
            </div>
          </div>
          
          {movies && movies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <div
                  key={movie._id}
                  onClick={() => handleMovieClick(movie._id)}
                  className="bg-gray-800 border border-gray-700 rounded-xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer overflow-hidden group"
                >
                  <div className="h-64 relative overflow-hidden">
                    {movie.image ? (
                      <>
                        <img
                          src={movie.image}
                          alt={movie.title}
                          //className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                         className="w-[100%] h-[100%] object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
                        />
                      </>
                    ) : (
                      <div className="h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div className="text-white text-center relative z-10">
                          <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">🎬</div>
                          <div className="text-sm opacity-90 font-medium">Movie Poster</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-2 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">{movie.genre}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {movie.title}
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <Clock size={16} className="text-gray-400 mr-3" />
                        <span className="text-sm">{movie.duration} minutes</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300">
                        <Calendar size={16} className="text-gray-400 mr-3" />
                        <span className="text-sm">
                          {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-300">
                        <Globe size={16} className="text-gray-400 mr-3" />
                        <span className="text-sm">{movie.language}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-400 text-sm font-medium">
                          {movie.shows.length} Shows Available
                        </span>
                        <div className="text-gray-400 text-sm">
                          Book Now →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-12">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Film size={40} className="text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-300 mb-2">No Movies Available</h4>
                <p className="text-gray-400">Check back later for new releases</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
