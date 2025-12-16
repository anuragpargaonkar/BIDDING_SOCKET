// src/utility/serverConfig.ts
 
// ============================================================
// 1. REST API BASE URL
// ============================================================
// export const BASE_URL = 'https://car01.dostenterprises.com';
export const BASE_URL = 'http://192.168.1.102:8086';
 
// ============================================================
// 2. WEBSOCKET CONFIGURATION
// ============================================================
// Primary Socket URL
// export const SOCKET_SERVER_URL = 'https://webs01.dostenterprises.com';
export const SOCKET_SERVER_URL = 'http://192.168.1.102:3000';

 
// Fallback URLs (Client can try these if primary fails)
// export const SOCKET_SERVER_URLS = [
//   SOCKET_SERVER_URL,
//   'https://car01.dostenterprises.com:8090',
// ];
export const SOCKET_SERVER_URLS = [SOCKET_SERVER_URL, 'http://192.168.1.102:8090'];
 
// Socket preferences
export const DEFAULT_FORCE_POLLING = false;
 
// ============================================================
// 3. API METHOD CONFIGURATION
// ============================================================
export const apiConfig = {
  // ----------------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------------
  auth: {
    login: async (credentials: {username: string; password: string}) => {
      try {
        const response = await fetch(`${BASE_URL}/jwt/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(credentials),
        });
        return await response.text();
      } catch (error) {
        throw error;
      }
    },
  },
 
  // ----------------------------------------------------------
  // USER & DEALER
  // ----------------------------------------------------------
  user: {
    getDealerById: async (dealerId: string, token: string) => {
      const response = await fetch(`${BASE_URL}/dealer/${dealerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      return await response.json();
    },
 
    getProfilePhoto: async (userId: string, token: string) => {
      const response = await fetch(
        `${BASE_URL}/ProfilePhoto/getbyuserid?userId=${userId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      return response;
    },
 
    addProfilePhoto: async (formData: FormData, token: string) => {
      const response = await fetch(`${BASE_URL}/ProfilePhoto/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      return response;
    },
 
    deleteProfilePhoto: async (userId: string, token: string) => {
      const response = await fetch(
        `${BASE_URL}/ProfilePhoto/deletebyuserid?userId=${userId}`,
        {
          method: 'DELETE',
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      return response;
    },
  },
  
};
 