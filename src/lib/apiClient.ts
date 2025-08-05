import axios from 'axios';

// Create a new Axios instance with a custom configuration
const apiClient = axios.create({
  // Set the base URL for all API requests.
  // This means we can use relative paths like '/auth/token' later on.
  //baseURL: 'http://localhost:8001/api/v1',
  baseURL: 'https://synapse-backend-1.onrender.com',
  // Set default headers for all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Axios Request Interceptor ---
// This is a powerful feature that allows us to run code BEFORE a request is sent.
// We will use it to automatically attach the user's authentication token to every API call.
apiClient.interceptors.request.use(
  (config) => {
    // Check if we have a token in localStorage (we will store it there after login)
    const token = localStorage.getItem('authToken');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      // The 'Bearer' scheme is the standard for JWTs
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Return the modified config so the request can proceed
    return config;
  },
  (error) => {
    // If there's an error setting up the request, reject the promise
    return Promise.reject(error);
  }
);

// Export the configured instance as the default export
export default apiClient;