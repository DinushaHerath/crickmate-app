import axiosInstance from '../config/axios';
import { API_BASE_URL } from '../config/api';

const BOOKINGS_API_URL = `${API_BASE_URL}/api/bookings`;

// Create a new booking
export const createBooking = async (bookingData, token) => {
  try {
    const response = await axiosInstance.post(
      `${BOOKINGS_API_URL}/create`,
      bookingData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error.response?.data || error.message);
    throw error;
  }
};

// Get all bookings for a ground
export const getGroundBookings = async (groundId, token) => {
  try {
    const response = await axiosInstance.get(
      `${BOOKINGS_API_URL}/ground/${groundId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching ground bookings:', error.response?.data || error.message);
    throw error;
  }
};

// Get bookings by date
export const getBookingsByDate = async (date, token) => {
  try {
    const response = await axiosInstance.get(
      `${BOOKINGS_API_URL}/date/${date}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings by date:', error.response?.data || error.message);
    throw error;
  }
};

// Get all booking dates (for calendar marking)
export const getBookingDates = async (token) => {
  try {
    const response = await axiosInstance.get(
      `${BOOKINGS_API_URL}/dates`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching booking dates:', error.response?.data || error.message);
    throw error;
  }
};

// Confirm booking
export const confirmBooking = async (bookingId, token) => {
  try {
    const response = await axiosInstance.put(
      `${BOOKINGS_API_URL}/${bookingId}/confirm`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error confirming booking:', error.response?.data || error.message);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status, token) => {
  try {
    const response = await axiosInstance.put(
      `${BOOKINGS_API_URL}/${bookingId}/status`,
      { status },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error.response?.data || error.message);
    throw error;
  }
};

// Delete booking
export const deleteBooking = async (bookingId, token) => {
  try {
    const response = await axiosInstance.delete(
      `${BOOKINGS_API_URL}/${bookingId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting booking:', error.response?.data || error.message);
    throw error;
  }
};

// Edit booking details
export const editBooking = async (bookingId, updates, token) => {
  try {
    const response = await axiosInstance.put(
      `${BOOKINGS_API_URL}/${bookingId}`,
      updates,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error editing booking:', error.response?.data || error.message);
    throw error;
  }
};
