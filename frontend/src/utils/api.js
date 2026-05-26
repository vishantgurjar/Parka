export const getBackendUrl = () => {
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname === '0.0.0.0';
  
  // If we are on local network, use the current IP to connect to local backend (for mobile debugging)
  let url = isLocal 
    ? (hostname === '0.0.0.0' ? 'http://localhost:5000' : `http://${hostname}:5000`)
    : import.meta.env.VITE_API_BASE_URL;
  
  console.log(`[API Utility] Hostname: ${hostname}, isLocal: ${isLocal}, URL: ${url}`);
  return url;
};
