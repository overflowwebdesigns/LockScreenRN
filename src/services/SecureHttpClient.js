/**
 * HTTP Client for API Communication
 * Provides a clean interface for making HTTP requests to the backend
 * Certificate pinning is handled automatically by TrustKit at the native iOS level
 */
class HttpClient {
  constructor() {
    this.baseURL = 'https://lock-screen-backend.overflowhosting.tech';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    console.log('🌐 HttpClient initialized');
    console.log('Base URL:', this.baseURL);
  }

  /**
   * Make an HTTP request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} - Response promise
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const requestConfig = {
      method: options.method || 'GET',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    try {
      console.log(`Making request to: ${url}`);
      console.log('Method:', requestConfig.method);
      
      const response = await fetch(url, requestConfig);
      
      console.log('✅ Response received:', response.status, response.statusText);
      
      // Parse response
      const responseData = await this.parseResponse(response);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return responseData;
    } catch (error) {
      console.error('❌ HTTP request failed:', error);
      console.error('Error details:', {
        message: error.message,
        url: url,
        method: requestConfig.method
      });
      
      throw error;
    }
  }

  /**
   * Parse response based on content type
   * @param {Response} response - Fetch response object
   * @returns {Promise} - Parsed response data
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} headers - Additional headers
   * @returns {Promise} - Response promise
   */
  async get(endpoint, headers = {}) {
    return this.request(endpoint, {
      method: 'GET',
      headers,
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} headers - Additional headers
   * @returns {Promise} - Response promise
   */
  async post(endpoint, data = {}, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
      headers,
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} headers - Additional headers
   * @returns {Promise} - Response promise
   */
  async put(endpoint, data = {}, headers = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
      headers,
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} headers - Additional headers
   * @returns {Promise} - Response promise
   */
  async delete(endpoint, headers = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  /**
   * Update base URL if needed
   * @param {string} newBaseURL - New base URL
   */
  setBaseURL(newBaseURL) {
    this.baseURL = newBaseURL;
    console.log('Base URL updated to:', this.baseURL);
  }

  /**
   * Add default header
   * @param {string} key - Header key
   * @param {string} value - Header value
   */
  setDefaultHeader(key, value) {
    this.defaultHeaders[key] = value;
    console.log(`Default header set: ${key} = ${value}`);
  }

  /**
   * Remove default header
   * @param {string} key - Header key to remove
   */
  removeDefaultHeader(key) {
    delete this.defaultHeaders[key];
    console.log(`Default header removed: ${key}`);
  }
}

// Export singleton instance
export default new HttpClient();
