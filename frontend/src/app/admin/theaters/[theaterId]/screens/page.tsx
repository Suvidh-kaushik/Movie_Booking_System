"use client";

import { useAppData, user_service } from "@/context/AppContext";
import { useParams, useRouter } from "next/navigation";
import React, { Usable, useCallback, useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Monitor, 
  Plus,
  Building2,
  Save,
  X,
  Calendar
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Screen {
  _id: string;
  theaterId: string;
  seatLayout: number[][];
  shows: string[];
}

interface Theater {
  _id: string;
  theaterName: string;
  location: string;
  contactNumber: string;
}

interface ScreenManagementPageProps {
  params: Usable<{ theaterId: string }>;
}

export default function ScreenManagement({ params }: ScreenManagementPageProps) {
  const { user, isAuth, loading } = useAppData();
  const router = useRouter();
  const { theaterId } = React.use(params); 
  const [screens, setScreens] = useState<Screen[]>([]);
  const [theater, setTheater] = useState<Theater | null>(null);
  const [loadingScreens, setLoadingScreens] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);



  useEffect(() => {
    console.log("Auth:", isAuth, "Loading:", loading, "User:", user);
    if (isAuth) {
      fetchScreens();
    }
  }, [isAuth,theaterId]);

  const fetchScreens = async () => {
    setLoadingScreens(true);
    try {
      const [screensResponse, theatersResponse] = await Promise.all([
        axios.get(`${user_service}/api/v1/admin/theater/${theaterId}/screen`, {
          withCredentials: true
        }),
        axios.get(`${user_service}/api/v1/admin/theater`, {
          withCredentials: true
        })
      ]);
      console.log(screensResponse.data.screens);
      setScreens(screensResponse.data.screens || []);
      const foundTheater = theatersResponse.data.theaters.find((t: Theater) => t._id === theaterId);
      setTheater(foundTheater);
    } catch (error) {
      console.error("Error fetching screens:", error);
      toast.error("Failed to fetch screens");
    } finally {
      setLoadingScreens(false);
    }
  };

  const handleAddScreen = async () => {
    try {
      const { data } = await axios.post(
        `${user_service}/api/v1/admin/theater/${theaterId}/screen`,
        {},
        { withCredentials: true }
      );
      
      toast.success("Screen added successfully!");
      setShowAddForm(false);
      await fetchScreens();
    } catch (error: any) {
      console.error("Error adding screen:", error);
      toast.error(error.response?.data?.message || "Failed to add screen");
    }
  };

  const handleManageShows = (screenId: string) => {
    router.push(`/admin/screens/${screenId}/shows`);
  };

  // if (loading || loadingScreens) {
  //   return (
  //     <div className="min-h-screen bg-gray-900 flex items-center justify-center">
  //       <div className="flex flex-col items-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
  //         <div className="text-white text-xl">Loading screens...</div>
  //       </div>
  //     </div>
  //   );
  // }

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
                <h1 className="text-2xl font-bold text-white">Screen Management</h1>
                <p className="text-gray-400 text-sm">
                  {theater ? `${theater.theaterName} - ${theater.location}` : "Manage theater screens"}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} className="text-white" />
              <span className="text-white text-sm">Add Screen</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Screen Confirmation Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Add New Screen</h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Monitor size={32} className="text-white" />
                  </div>
                  <p className="text-gray-300 text-center mb-4">
                    This will create a new screen with a 10×10 seat layout for {theater?.theaterName}.
                  </p>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Screen Details:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 100 seats (10 rows × 10 columns)</li>
                      <li>• Seat layout: A1-A10, B1-B10, etc.</li>
                      <li>• Ready for show scheduling</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddScreen}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Save size={18} />
                    <span>Add Screen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Theater Info */}
        {theater && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{theater.theaterName}</h3>
                <p className="text-gray-400">{theater.location}</p>
                <p className="text-gray-400 text-sm">Contact: {theater.contactNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Screens List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Screens</h3>
              <p className="text-gray-400">Manage screens for this theater</p>
            </div>
            <div className="text-purple-400 text-sm font-medium">
              {screens.length} Screen{screens.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {screens.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {screens.map((screen, index) => (
                <div
                  key={screen?._id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <Monitor size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-1">Screen {index + 1}</h4>
                      <p className="text-gray-400 text-sm">
                      ID: {screen?._id || "Unknown"}
                    </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-gray-300">
                      <span className="text-sm">Total Seats:</span>
                      <span className="text-sm font-medium">100</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-gray-300">
                      <span className="text-sm">Layout:</span>
                      <span className="text-sm font-medium">10×10</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-gray-300">
                      <span className="text-sm">Shows:</span>
                      <span className="text-sm font-medium">{screen.shows?.length}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-400 text-sm">
                          {screen.shows?.length} Show{screen.shows?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-purple-400 text-sm font-medium">
                        Active
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleManageShows(screen._id)}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Manage Shows
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-12">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Monitor size={40} className="text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-300 mb-2">No Screens Added</h4>
                <p className="text-gray-400 mb-6">Add screens to start scheduling shows</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Add First Screen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


