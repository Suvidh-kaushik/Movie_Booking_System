"use client";

import { useAppData, user_service } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Film, 
  Plus,
  Calendar,
  Clock,
  Globe,
  Tag,
  Save,
  X
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Movie {
  _id: string;
  title: string;
  duration: number;
  genre: string;
  language: string;
  releaseDate: string;
  shows: string[];
  image?: string;
}

export default function MovieManagement() {
  const { user, isAuth, loading } = useAppData();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    genre: "",
    language: "",
    releaseDate: "",
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  useEffect(() => {
    if (isAuth) {
      fetchMovies();
    }
  }, [isAuth]);

  const fetchMovies = async () => {
    setLoadingMovies(true);
    try {
      const { data } = await axios.get(`${user_service}/api/v1/booking/movie`, {
        withCredentials: true
      });
      console.log("Fetched movies:", data.movies);
      setMovies(data.movies || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast.error("Failed to fetch movies");
    } finally {
      setLoadingMovies(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.duration || !formData.genre || !formData.language || !formData.releaseDate) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('genre', formData.genre);
      formDataToSend.append('language', formData.language);
      formDataToSend.append('releaseDate', formData.releaseDate);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const { data } = await axios.post(
        `${user_service}/api/v1/admin/movie`,
        formDataToSend,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log("Movie added response:", data);
      toast.success("Movie added successfully!");
      setFormData({ title: "", duration: "", genre: "", language: "", releaseDate: "", image: null });
      setImagePreview(null);
      setShowAddForm(false);
      fetchMovies();
    } catch (error: any) {
      console.error("Error adding movie:", error);
      toast.error(error.response?.data?.message || "Failed to add movie");
    }
  };

  const resetForm = () => {
    setFormData({ title: "", duration: "", genre: "", language: "", releaseDate: "", image: null });
    setImagePreview(null);
    setShowAddForm(false);
  };

  if (loading || loadingMovies) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-white text-xl">Loading movies...</div>
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
                onClick={() => router.push("/admin")}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Movie Management</h1>
                <p className="text-gray-400 text-sm">Add and manage movies in your system</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} className="text-white" />
              <span className="text-white text-sm">Add Movie</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Movie Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Add New Movie</h3>
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
                      Movie Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter movie title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Movie Poster
                    </label>
                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:border-blue-500 focus:outline-none"
                      />
                      
                      {imagePreview && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-400 mb-2">Preview:</p>
                          <div className="relative w-32 h-48 bg-gray-700 rounded-lg overflow-hidden">
                            <img
                              src={imagePreview}
                              alt="Movie poster preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        placeholder="120"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Genre
                      </label>
                      <select
                        name="genre"
                        value={formData.genre}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        required
                      >
                        <option value="">Select Genre</option>
                        <option value="Action">Action</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Drama">Drama</option>
                        <option value="Horror">Horror</option>
                        <option value="Romance">Romance</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Thriller">Thriller</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Animation">Animation</option>
                        <option value="Documentary">Documentary</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Language
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        required
                      >
                        <option value="">Select Language</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Korean">Korean</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Telugu">Telugu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Release Date
                      </label>
                      <input
                        type="date"
                        name="releaseDate"
                        value={formData.releaseDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
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
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Save size={18} />
                      <span>Add Movie</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Movies List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">All Movies</h3>
              <p className="text-gray-400">Manage your movie catalog</p>
            </div>
            <div className="text-blue-400 text-sm font-medium">
              {movies.length} Movies
            </div>
          </div>
          
          {movies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {movies.map((movie) => (
                <div
                  key={movie._id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center mb-4">
                    {movie.image ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden mr-4">
                        <img
                          src={movie.image}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                        <Film size={24} className="text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-1">{movie.title}</h4>
                      <p className="text-gray-400 text-sm">ID: {movie._id.slice(-8)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <Clock size={16} className="text-gray-400 mr-3" />
                      <span className="text-sm">{movie.duration} minutes</span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <Tag size={16} className="text-gray-400 mr-3" />
                      <span className="text-sm">{movie.genre}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <Globe size={16} className="text-gray-400 mr-3" />
                      <span className="text-sm">{movie.language}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <Calendar size={16} className="text-gray-400 mr-3" />
                      <span className="text-sm">
                        {new Date(movie.releaseDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400 text-sm font-medium">
                        {movie.shows.length} Shows
                      </span>
                      <div className="text-gray-400 text-sm">
                        Active
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
                <h4 className="text-xl font-semibold text-gray-300 mb-2">No Movies Added</h4>
                <p className="text-gray-400 mb-6">Start by adding your first movie to the system</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Add First Movie
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
