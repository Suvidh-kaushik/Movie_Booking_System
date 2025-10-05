"use client";

import { useAppData, user_service } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Film, Clock, MapPin } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface MovieDetailsPageProps {
  params: {
    id: string;
  };
}

interface Show {
  _id: string;
  showTime: string;
  showDuration: number;
  theaterId: {
    _id: string;
    theaterName: string;
    location: string;
  };
}

interface Seat {
  row: number;
  col: number;
}

interface SeatSelection {
  show: Show | null;
  seats: number[][];
  selectedSeats: Seat[];
  loading: boolean;
}

interface DateOption {
  date: string;
  display: string;
  day: string;
}

export default function MovieDetailsPage({ params }: MovieDetailsPageProps) {
  const { movies } = useAppData();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [seatSelection, setSeatSelection] = useState<SeatSelection>({
    show: null,
    seats: [],
    selectedSeats: [],
    loading: false
  });

  // Generate next 7 days
  useEffect(() => {
    const dates: DateOption[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = date.getDate();
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      dates.push({
        date: dateStr,
        display: `${dayNumber} ${monthName}`,
        day: dayName
      });
    }
    
    setDateOptions(dates);
    setSelectedDate(dates[0].date); // Set today as default
  }, []);

  useEffect(() => {
    if (movies) {
      const foundMovie = movies.find((m) => m._id === params.id);
      if (foundMovie) {
        setMovie(foundMovie);
      } else {
        // Movie not found, redirect back to home
        router.push("/home");
      }
    }
  }, [movies, params.id, router]);

  // Fetch shows when date changes
  useEffect(() => {
    if (selectedDate && movie) {
      fetchShowsForDate(selectedDate);
    }
  }, [selectedDate, movie]);

  const fetchShowsForDate = async (date: string) => {
    setLoadingShows(true);
    try {
      const { data } = await axios.get(
        `${user_service}/api/v1/booking/${movie._id}/shows?date=${date}`,
        { withCredentials: true }
      );
      setShows(data.shows);
    } catch (error) {
      console.error("Error fetching shows:", error);
      setShows([]);
    } finally {
      setLoadingShows(false);
    }
  };

  const handleShowSelect = async (show: Show) => {
    setSeatSelection(prev => ({ ...prev, loading: true, show }));
    
    try {
      const { data } = await axios.get(
        `${user_service}/api/v1/booking/show/${show._id}/seats`,
        { withCredentials: true }
      );
      
      setSeatSelection(prev => ({
        ...prev,
        seats: data.availableSeats || [],
        selectedSeats: [],
        loading: false
      }));
    } catch (error) {
      console.error("Error fetching seats:", error);
      setSeatSelection(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSeatClick = (row: number, col: number) => {
    const seatStatus = seatSelection.seats[row]?.[col];
    
    // Don't allow selection of booked seats
    if (seatStatus === 1) return;
    
    setSeatSelection(prev => {
      const isSelected = prev.selectedSeats.some(s => s.row === row && s.col === col);
      
      if (isSelected) {
        // Remove seat from selection
        return {
          ...prev,
          selectedSeats: prev.selectedSeats.filter(s => !(s.row === row && s.col === col))
        };
      } else {
        // Add seat to selection
        return {
          ...prev,
          selectedSeats: [...prev.selectedSeats, { row, col }]
        };
      }
    });
  };

  const handleBookSeats = async () => {
    if (!seatSelection.show || seatSelection.selectedSeats.length === 0) return;
    
    try {
      const { data } = await axios.patch(
        `${user_service}/api/v1/booking/show/${seatSelection.show._id}/book`,
        { seats: seatSelection.selectedSeats },
        { withCredentials: true }
      );
      
      // Close seat selection and refresh shows
      setSeatSelection({ show: null, seats: [], selectedSeats: [], loading: false });
      fetchShowsForDate(selectedDate);
      
      toast.success(`Booking successful! Booking ID: ${data.booking._id}`, {
        duration: 5000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #374151',
        },
      });
    } catch (error: any) {
      console.error("Error booking seats:", error);
      toast.error(error.response?.data?.message || "Failed to book seats", {
        duration: 4000,
        style: {
          background: '#dc2626',
          color: '#fff',
          border: '1px solid #b91c1c',
        },
      });
    }
  };

  const closeSeatSelection = () => {
    setSeatSelection({ show: null, seats: [], selectedSeats: [], loading: false });
  };

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading movie details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back to Movies
        </button>

        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              {movie.image ? (
                <div className="h-96 relative overflow-hidden">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-96 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <div className="text-lg opacity-90">Movie Poster</div>
                  </div>
                </div>
              )}
            </div>
            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-white mb-6">{movie.title}</h1>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-400 w-24">Duration:</span>
                  <span className="text-gray-300">{movie.duration} minutes</span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-semibold text-gray-400 w-24">Genre:</span>
                  <span className="text-gray-300">{movie.genre}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-semibold text-gray-400 w-24">Language:</span>
                  <span className="text-gray-300">{movie.language}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-semibold text-gray-400 w-24">Release Date:</span>
                  <span className="text-gray-300">
                    {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-6">Select Date & Show</h3>
                
                {/* Date Selection */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-300 mb-4">Choose Date</h4>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {dateOptions.map((dateOption) => (
                      <button
                        key={dateOption.date}
                        onClick={() => setSelectedDate(dateOption.date)}
                        className={`flex-shrink-0 px-4 py-3 rounded-lg border transition-colors ${
                          selectedDate === dateOption.date
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium">{dateOption.day}</div>
                          <div className="text-sm">{dateOption.display}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shows Display */}
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-4">
                    Available Shows for {dateOptions.find(d => d.date === selectedDate)?.display}
                  </h4>
                  
                  {loadingShows ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400">Loading shows...</div>
                    </div>
                  ) : shows.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {shows.map((show) => (
                        <div
                          key={show._id}
                          onClick={() => handleShowSelect(show)}
                          className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center mb-3">
                            <Clock className="w-4 h-4 text-blue-400 mr-2" />
                            <span className="text-white font-medium">
                              {new Date(show.showTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center mb-2">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-300 text-sm">{show.theaterId.theaterName}</span>
                          </div>
                          
                          <div className="text-gray-400 text-sm">
                            {show.theaterId.location}
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <div className="text-xs text-gray-500">
                              Duration: {show.showDuration} mins
                            </div>
                          </div>
                          
                          <div className="mt-3 text-center">
                            <span className="text-blue-400 text-sm font-medium">Select Seats</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                      <div className="text-gray-400">No shows available for this date.</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Book Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Selection Modal */}
      {seatSelection.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Select Seats</h3>
                  <div className="text-gray-300">
                    <div className="flex items-center mb-1">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(seatSelection.show.showTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {seatSelection.show.theaterId.theaterName} - {seatSelection.show.theaterId.location}
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeSeatSelection}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Screen */}
              <div className="text-center mb-6">
                <div className="bg-gray-700 rounded-lg py-4 mb-4">
                  <div className="text-white font-medium">SCREEN</div>
                </div>
              </div>

              {/* Seat Grid */}
              {seatSelection.loading ? (
                <div className="text-center py-12">
                  <div className="text-gray-400">Loading seats...</div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="grid grid-cols-10 gap-2 max-w-fit mx-auto">
                    {Array.from({ length: 10 }, (_, row) =>
                      Array.from({ length: 10 }, (_, col) => {
                        const seatStatus = seatSelection.seats[row]?.[col];
                        const isSelected = seatSelection.selectedSeats.some(s => s.row === row && s.col === col);
                        const isBooked = seatStatus === 1;
                        
                        return (
                          <button
                            key={`${row}-${col}`}
                            onClick={() => handleSeatClick(row, col)}
                            disabled={isBooked}
                            className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                              isBooked
                                ? 'bg-red-600 text-white cursor-not-allowed'
                                : isSelected
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            {String.fromCharCode(65 + row)}{col + 1}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="flex justify-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <span className="text-gray-300 text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-gray-300 text-sm">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span className="text-gray-300 text-sm">Booked</span>
                </div>
              </div>

              {/* Selected Seats Summary */}
              {seatSelection.selectedSeats.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="text-white font-medium mb-2">Selected Seats:</h4>
                  <div className="text-gray-300">
                    {seatSelection.selectedSeats.map((seat, index) => (
                      <span key={index}>
                        {String.fromCharCode(65 + seat.row)}{seat.col + 1}
                        {index < seatSelection.selectedSeats.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                  <div className="text-gray-400 text-sm mt-2">
                    Total: {seatSelection.selectedSeats.length} seat(s)
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={closeSeatSelection}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookSeats}
                  disabled={seatSelection.selectedSeats.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Book {seatSelection.selectedSeats.length} Seat(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
