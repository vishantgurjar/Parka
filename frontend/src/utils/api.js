export const getBackendUrl = () => {
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname === '0.0.0.0';
  
  // If we are on localhost, we almost always want the local backend for development
  let url = isLocal ? 'http://localhost:5000' : import.meta.env.VITE_API_BASE_URL;
  
  console.log(`[API Utility] Hostname: ${hostname}, isLocal: ${isLocal}, URL: ${url}`);
  return url;
};
