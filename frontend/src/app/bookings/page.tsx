"use client";

import { useAppData, user_service } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  Film,
  RefreshCw,
  Trash2
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Booking {
  _id: string;
  seats: Array<{ row: number; col: number }>;
  showId: {
    _id: string;
    showTime: string;
    showDuration: number;
    theaterId: {
      _id: string;
      theaterName: string;
      location: string;
    };
  };
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
}

export default function BookingsPage() {
  const { user, isAuth, loading } = useAppData();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  useEffect(() => {
    if (isAuth) {
      fetchBookings();
    }
  }, [isAuth]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const { data } = await axios.get(
        `${user_service}/api/v1/booking/self`,
        { withCredentials: true }
      );
      setBookings(data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  const formatSeatNumber = (row: number, col: number) => {
    return `${String.fromCharCode(65 + row)}${col + 1}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDelete = async (bookingId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this booking?");
    if (!confirmDelete) return;

    try {
      setDeletingId(bookingId);
      const { data } = await axios.post(
        `${user_service}/api/v1/booking/show/delete`,
        { bookingId },
        { withCredentials: true }
      );
      toast.success(data.message || "Booking deleted");
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to delete booking";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || loadingBookings) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-white text-xl">Loading your bookings...</div>
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
                onClick={() => router.push("/home")}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Your Bookings</h1>
                <p className="text-gray-400 text-sm">View and manage your movie tickets</p>
              </div>
            </div>
            
            <button
              onClick={fetchBookings}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw size={18} className="text-white" />
              <span className="text-white text-sm">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Ticket size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Booking #{booking._id.slice(-8)}</h3>
                      <p className="text-gray-400 text-sm">
                        Booked on {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-sm font-medium">Confirmed</div>
                    <div className="text-gray-400 text-xs">
                      {booking.seats.length} seat{booking.seats.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Show Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <Film size={20} className="text-blue-400 mr-2" />
                      Show Details
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <Calendar size={16} className="text-gray-400 mr-3" />
                        <span className="text-sm">{formatDate(booking.showId?.showTime)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300">
                        <Clock size={16} className="text-gray-400 mr-3" />
                        <span className="text-sm">{formatTime(booking.showId?.showTime)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300">
                        <MapPin size={16} className="text-gray-400 mr-3" />
                        <span className="text-sm">
                          {booking.showId?.theaterId.theaterName} - {booking.showId?.theaterId.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seat Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <User size={20} className="text-green-400 mr-2" />
                      Seat Information
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="text-gray-300">
                        <span className="text-sm font-medium text-gray-400">Seats: </span>
                        <span className="text-sm">
                          {booking.seats.map((seat, index) => (
                            <span key={index}>
                              {formatSeatNumber(seat.row, seat.col)}
                              {index < booking.seats.length - 1 && ', '}
                            </span>
                          ))}
                        </span>
                      </div>
                      
                      <div className="text-gray-300">
                        <span className="text-sm font-medium text-gray-400">Duration: </span>
                        <span className="text-sm">{booking.showId?.showDuration} minutes</span>
                      </div>
                      
                      <div className="text-gray-300">
                        <span className="text-sm font-medium text-gray-400">Total Seats: </span>
                        <span className="text-sm">{booking.seats.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-400 text-sm">
                      Booking ID: {booking._id}
                    </div>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm">
                        Download Ticket
                      </button>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                        View Details
                      </button>
                      <button
                        onClick={() => handleDelete(booking._id)}
                        disabled={deletingId === booking._id}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center space-x-2 ${deletingId === booking._id ? 'bg-red-900 text-red-200 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                      >
                        <Trash2 size={16} />
                        <span>{deletingId === booking._id ? 'Deleting...' : 'Delete'}</span>
                      </button>
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
                <Ticket size={40} className="text-gray-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-300 mb-2">No Bookings Yet</h4>
              <p className="text-gray-400 mb-6">You haven't made any bookings yet. Start exploring movies!</p>
              <button
                onClick={() => router.push("/home")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
              >
                Browse Movies
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
