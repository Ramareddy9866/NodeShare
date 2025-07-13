const API_BASE_URL = process.env.REACT_APP_API_URL;

if (!API_BASE_URL) {
  throw new Error('REACT_APP_API_URL is not defined in your environment variables. Please set it in your .env file.');
}

export { API_BASE_URL };