"use client";

import { useAppData, user_service } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { Usable, useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Calendar, 
  Plus,
  Monitor,
  Film,
  Clock,
  Save,
  X,
  Building2
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Show {
  _id: string;
  movieId: string;
  screenId: string;
  theaterId: string;
  showTime: string;
  showDuration: number;
  availableSeats: number[][];
}

interface Movie {
  _id: string;
  title: string;
  duration: number;
  genre: string;
  language: string;
  releaseDate: string;
}

interface Theater {
  _id: string;
  theaterName: string;
  location: string;
}

interface ScreenManagementPageProps {
  params: {
    screenId: string;
  };
}


export default function ShowManagement({params}: ScreenManagementPageProps) {
  const { user, isAuth, loading } = useAppData();
  const router = useRouter();
  const { screenId } = params; 
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theater, setTheater] = useState<Theater | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    movieId: "",
    showTime: "",
    showDuration: ""
  });

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  useEffect(() => {
    if (isAuth) {
      fetchData();
    }
  }, [isAuth, screenId]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // Fetch movies
      const moviesResponse = await axios.get(`${user_service}/api/v1/booking/movie`, {
        withCredentials: true
      });
      setMovies(moviesResponse.data.movies || []);
  
      // Fetch shows for this screen
      const showsResponse = await axios.get(`${user_service}/api/v1/admin/screen/${screenId}/show`, {
        withCredentials: true
      });
      console.log(showsResponse.data.shows);
      setShows(showsResponse.data.shows || []);
  
      // Fetch theater info (based on first show if exists)
      if (showsResponse.data.shows.length > 0) {
        const theaterId = showsResponse.data.shows[0].theaterId;
        const theaterResponse = await axios.get(`${user_service}/api/v1/admin/theater`, {
          withCredentials: true
        });
        const foundTheater = theaterResponse.data.theaters.find((t: Theater) => t._id === theaterId);
        setTheater(foundTheater || null);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoadingData(false);
    }
  };
  


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.movieId || !formData.showTime || !formData.showDuration) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data } = await axios.post(
        `${user_service}/api/v1/admin/screen/${screenId}/show`,
        {
          movieId: formData.movieId,
          time: formData.showTime,
          duration: parseInt(formData.showDuration)
        },
        { withCredentials: true }
      );
      
      toast.success("Show added successfully!");
      setFormData({ movieId: "", showTime: "", showDuration: "" });
      setShowAddForm(false);
      fetchData();
    } catch (error: any) {
      console.error("Error adding show:", error);
      toast.error(error.response?.data?.message || "Failed to add show");
    }
  };

  const resetForm = () => {
    setFormData({ movieId: "", showTime: "", showDuration: "" });
    setShowAddForm(false);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
          <div className="text-white text-xl">Loading shows...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin/theaters")}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Show Management</h1>
                <p className="text-gray-400 text-sm">Schedule movie shows for this screen</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} className="text-white" />
              <span className="text-white text-sm">Add Show</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Show Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Add New Show</h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Movie
                    </label>
                    <select
                      name="movieId"
                      value={formData.movieId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                      required
                    >
                      <option value="">Choose a movie</option>
                      {movies.map((movie) => (
                        <option key={movie._id} value={movie._id}>
                          {movie.title} ({movie.genre}, {movie.language})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Show Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        name="showTime"
                        value={formData.showTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="showDuration"
                        value={formData.showDuration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                        placeholder="120"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Show Details:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Screen will have 100 available seats</li>
                      <li>• Show time cannot be before movie release date</li>
                      <li>• No overlapping shows allowed</li>
                    </ul>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                    >
                      <Save size={18} />
                      <span>Add Show</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Screen Info */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
              <Monitor size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Screen Management</h3>
              <p className="text-gray-400">Screen ID: {screenId ? screenId.slice(-8) : "Unknown"}</p>
              {theater && (
                <p className="text-gray-400 text-sm">{theater.theaterName} - {theater.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Shows List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Scheduled Shows</h3>
              <p className="text-gray-400">Manage shows for this screen</p>
            </div>
            <div className="text-orange-400 text-sm font-medium">
              {shows.length} Show{shows.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {shows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shows.map((show) => {
                const movie = movies.find(m => m._id === show.movieId);
                const { date, time } = formatDateTime(show.showTime);

                return (
                  <div
                    key={show._id}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-orange-500 transition-colors"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                        <Calendar size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-1">
                          {movie?.title || "Unknown Movie"}
                        </h4>
                        <p className="text-gray-400 text-sm">ID: {show._id ? show._id.slice(-8) : "Unknown"}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-300">
                        <Clock size={16} className="text-gray-400 mr-3" />
                        <span className="text-sm">{time}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300">
                        <Calendar size={16} className="text-gray-400 mr-3" />
                        <span className="text-sm">{date}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300">
                        <Film size={16} className="text-gray-400 mr-3" />
                        <span className="text-sm">{show.showDuration} minutes</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Building2 size={16} className="text-gray-400 mr-2" />
                          <span className="text-gray-400 text-sm">100 Seats</span>
                        </div>
                        <div className="text-orange-400 text-sm font-medium">
                          Scheduled
                        </div>
                      </div>
                      
                      <div className="text-gray-400 text-xs">
                        Movie: {movie?.genre} • {movie?.language}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-12">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar size={40} className="text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-300 mb-2">No Shows Scheduled</h4>
                <p className="text-gray-400 mb-6">Add shows to start scheduling movies</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Schedule First Show
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


