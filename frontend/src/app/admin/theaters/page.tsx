"use client";

import { useAppData, user_service } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Building2, 
  Plus,
  MapPin,
  Phone,
  Save,
  X,
  Monitor
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Theater {
  _id: string;
  theaterName: string;
  location: string;
  contactNumber: string;
  screens: string[];
}

export default function TheaterManagement() {
  const { user, isAuth, loading } = useAppData();
  const router = useRouter();
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loadingTheaters, setLoadingTheaters] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    theaterName: "",
    location: "",
    contactNumber: ""
  });

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  useEffect(() => {
    if (isAuth) {
      fetchTheaters();
    }
  }, [isAuth]);

  const fetchTheaters = async () => {
    setLoadingTheaters(true);
    try {
      const { data } = await axios.get(`${user_service}/api/v1/admin/theater`, {
        withCredentials: true
      });
      setTheaters(data.theaters || []);
    } catch (error) {
      console.error("Error fetching theaters:", error);
      toast.error("Failed to fetch theaters");
    } finally {
      setLoadingTheaters(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.theaterName || !formData.location || !formData.contactNumber) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const data = await axios.post(
        `${user_service}/api/v1/admin/theater`,
        {
          theaterName: formData.theaterName,
          location: formData.location,
          contactNumber: formData.contactNumber
        },
        { withCredentials: true }
      );
      
      toast.success("Theater added successfully!");
      setFormData({ theaterName: "", location: "", contactNumber: "" });
      setShowAddForm(false);
      fetchTheaters();
    } catch (error: any) {
      console.error("Error adding theater:", error);
      toast.error(error.response?.data?.message || "Failed to add theater");
    }
  };

  const resetForm = () => {
    setFormData({ theaterName: "", location: "", contactNumber: "" });
    setShowAddForm(false);
  };

  const handleManageScreens = (theaterId: string) => {
    router.push(`/admin/theaters/${theaterId}/screens`);
  };

  if (loading || loadingTheaters) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <div className="text-white text-xl">Loading theaters...</div>
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
                <h1 className="text-2xl font-bold text-white">Theater Management</h1>
                <p className="text-gray-400 text-sm">Add and manage theater locations</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} className="text-white" />
              <span className="text-white text-sm">Add Theater</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Theater Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Add New Theater</h3>
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
                      Theater Name
                    </label>
                    <input
                      type="text"
                      name="theaterName"
                      value={formData.theaterName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                      placeholder="Enter theater name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                      placeholder="Enter theater location"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                      placeholder="Enter contact number"
                      required
                    />
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
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Save size={18} />
                      <span>Add Theater</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Theaters List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">All Theaters</h3>
              <p className="text-gray-400">Manage your theater locations</p>
            </div>
            <div className="text-green-400 text-sm font-medium">
              {theaters.length} Theaters
            </div>
          </div>
          
          {theaters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {theaters.map((theater) => (
                <div
                  key={theater._id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-green-500 transition-colors"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                      <Building2 size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-1">{theater.theaterName}</h4>
                      <p className="text-gray-400 text-sm">ID: {theater._id.slice(-8)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-300">
                      <MapPin size={16} className="text-gray-400 mr-3" />
                      <span className="text-sm">{theater.location}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <Phone size={16} className="text-gray-400 mr-3" />
                      <span className="text-sm">{theater.contactNumber}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Monitor size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-400 text-sm">
                          {theater.screens.length} Screen{theater.screens.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-green-400 text-sm font-medium">
                        Active
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleManageScreens(theater._id)}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Manage Screens
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-12">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 size={40} className="text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-300 mb-2">No Theaters Added</h4>
                <p className="text-gray-400 mb-6">Start by adding your first theater location</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Add First Theater
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


