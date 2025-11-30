// API Configuration
// Update the IP address here based on your setup

// For Android Emulator, use: http://10.0.2.2:5000
// For iOS Simulator, use: http://localhost:5000
// For Physical Device, use your computer's IP address

// Your computer has these IPs:
// - 192.168.56.1 (VirtualBox/VM network)
// - 10.30.21.163 (Your main network - CURRENT IP)

// Using physical device on same WiFi network
export const API_BASE_URL = 'http://10.30.21.163:5000';
export const AUTH_API_URL = `${API_BASE_URL}/api/auth`;
