// // // WebSocketConnection.tsx
// import React,
// {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useRef,
//   ReactNode,
// } from 'react';
// import { Socket } from 'socket.io-client';
// import { getSocket } from './socketio';
 
// interface WebSocketContextType {
//   isConnected: boolean;
//   placeBid: (userData: BidUserData) => Promise<any>;
//   getTopThreeBids: (bidCarId: string) => void;
//   topThreeBidsAmount: any[];
//   topThreeBidsAmountArray: any[];
//   getLiveCars: () => void;
//   liveCars: any[];
//   refreshTopThreeBids: (bidCarId: string) => Promise<any>;
//   client: Socket | null;
//   subscriptions: React.MutableRefObject<Record<string, any>>;
//   connectWebSocket: () => void;
//   disconnectWebSocket: () => void;
//   isAuthenticated: boolean;
//   connectionError: string | null;
//   connectionStatus: string;
// }
 
// interface WebSocketProviderProps {
//   children: ReactNode;
// }
 
// interface BidUserData {
//   userId: string;
//   bidCarId: string;
//   amount: number;
// }
 
// const WebSocketContext = createContext<WebSocketContextType | null>(null);
 
// // WebSocket endpoint configuration - connect to root namespace used by backend SocketIOServer
// const SOCKET_IO_URL = 'http://192.168.1.109:3000';

// // Fallback URLs to try
// const SOCKET_IO_URLS = [
//   'http://192.168.1.109:3000',        // Android emulator to host
//   'http://localhost:3000',        // Fallback
//   'http://192.168.1.1:3000',     // Possible network IP
// ];
 
// // Optional: enable client-side polling of getLiveCars (disabled; we rely on server push instead)
// const ENABLE_PERIODIC_LIVE_CARS_POLLING = false;
 
// // Toggle for client-side Socket.IO debug logging
// const ENABLE_SOCKET_DEBUG_LOGS = true; // 🔧 Set to true for debugging

// const debugLog = (...args: any[]) => {
//   if (ENABLE_SOCKET_DEBUG_LOGS) {
//     // eslint-disable-next-line no-console
//     console.log('[WebSocket Debug]', new Date().toISOString(), ...args);
//   }
// };

// const debugError = (...args: any[]) => {
//   if (ENABLE_SOCKET_DEBUG_LOGS) {
//     // eslint-disable-next-line no-console
//     console.error('[WebSocket Error]', new Date().toISOString(), ...args);
//   }
// };

// const debugWarn = (...args: any[]) => {
//   if (ENABLE_SOCKET_DEBUG_LOGS) {
//     // eslint-disable-next-line no-console
//     console.warn('[WebSocket Warning]', new Date().toISOString(), ...args);
//   }
// };export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
//   children,
// }) => {
//   debugLog('🚀 WebSocketProvider mounted');
  
//   const [isConnected, setIsConnected] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [connectionError, setConnectionError] = useState<string | null>(null);
//   const [connectionStatus, setConnectionStatus] =
//     useState<string>('disconnected');
//   const [socket, setSocket] = useState<Socket | null>(null);
 
//   const [topThreeBidsAmount, setTopThreeBidsAmount] = useState<any[]>([]);
//   const [topThreeBidsAmountArray, setTopThreeBidsAmountArray] = useState<any[]>(
//     [],
//   );
//   const [liveCars, setLiveCars] = useState<any[]>([]);
 
//   const reconnectAttempts = useRef(0);
//   const maxReconnectAttempts = 1;
//   const isConnecting = useRef(false);
//   const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const listenersAttachedRef = useRef(false);
//   const lastLiveCarsCountRef = useRef<number | null>(null);
 
//   const subscriptions = useRef<Record<string, any>>({});
 
//   const clearConnectionTimeout = () => {
//     if (connectionTimeoutRef.current) {
//       clearTimeout(connectionTimeoutRef.current);
//       connectionTimeoutRef.current = null;
//     }
//   };
 
//   const transformCars = (carsData: any[]): any[] => {
//     debugLog(`📝 Transforming ${carsData.length} cars...`);
//     return carsData.map((car: any, index: number) => {
//       // Prefer bidCarId/beadingCarId as stable identifiers so we can fetch details/images correctly
//       const bidId = car.bidCarId ?? car.bidcarid ?? car.carId ?? car.id;
//       const beadingId = car.beadingCarId ?? car.beadingcarid ?? bidId;
//       const id = String(bidId ?? beadingId ?? car.id ?? car.carId ?? Math.random());

//       const transformedCar = {
//         id,
//         // Also keep numeric IDs for backend HTTP detail/image APIs
//         bidCarId: bidId,
//         beadingCarId: beadingId,
//         imageUrl: car.imageUrl || car.image || car.carImage,
//         isScrap: car.isScrap || car.scrap || false,
//         city: car.city || car.location || 'Unknown',
//         rtoCode: car.rtoCode || car.rto || 'N/A',
//         make: car.make || car.brand || car.manufacturer || 'Car',
//         model: car.model || car.modelName || 'Model',
//         variant: car.variant || car.variantName || 'Variant',
//         engine: car.engine || car.engineCapacity || '1.0L',
//         kmsDriven: car.kmsDriven || car.kilometers || car.mileage || 0,
//         owner: car.owner || car.ownerType || '1st Owner',
//         fuelType: car.fuelType || car.fuel || 'Petrol',
//         remainingTime: car.remainingTime || car.timeLeft || '01:30:00',
//         currentBid: car.currentBid || car.highestBid || car.startingBid || 0,
//         ...car,
//       };
      
//       debugLog(`  Car ${index + 1}: ${transformedCar.make} ${transformedCar.model} (ID: ${id})`);
//       return transformedCar;
//     });
//   };  const attachSocketListeners = (s: Socket) => {
//     debugLog('🔗 Attaching socket listeners...');
//     if (listenersAttachedRef.current) {
//       debugWarn('⚠️ Listeners already attached, skipping...');
//       return;
//     }

//     console.log('🔧 RAW: Attaching listeners to socket, socket.connected =', s.connected);

//     s.on('connect', () => {
//       debugLog('✅ Socket.IO connected', `Socket ID: ${s.id}`);
//       debugLog('🔗 Socket connection status:', `connected=${s.connected}, id=${s.id}`);
//       console.log('🔧 RAW: Socket connected event fired, emitting getLiveCars');
//       setIsConnected(true);
//       setConnectionStatus('connected');
//       setConnectionError(null);
//       setIsAuthenticated(true);
//       reconnectAttempts.current = 0;
     
//       // Fetch live cars immediately after connection via Socket.IO
//       debugLog('📤 Fetching live cars on connection...');
//       debugLog('🔗 Before emit - Socket connected?', s.connected);
      
//       // Emit immediately
//       s.emit('getLiveCars');
//       console.log('🔧 RAW: Emitted getLiveCars on connect (immediate)');
      
//       // Also emit after a small delay to ensure socket is ready
//       setTimeout(() => {
//         debugLog('⏱️ Sending delayed getLiveCars request (100ms delay)');
//         s.emit('getLiveCars');
//         console.log('🔧 RAW: Emitted getLiveCars on connect (delayed 100ms)');
//       }, 100);

//       debugLog('✅ getLiveCars emit called on connect');
//     });

//     s.on('disconnect', () => {
//       debugLog('⚠️ Socket.IO disconnected');
//       console.log('🔧 RAW: Socket disconnected event fired');
//       setIsConnected(false);
//       setConnectionStatus('disconnected');
//       // Reset the listeners flag so they can be re-attached on reconnect
//       listenersAttachedRef.current = false;
//     });

//     // Listen for live cars data from server
//     s.on('liveCars', (carsData: any[]) => {
//       console.log('🔧 RAW: liveCars event received with data:', carsData);
//       debugLog(`📨 Received 'liveCars' event with data:`, carsData);
//       debugLog(`📨 Is array? ${Array.isArray(carsData)}, Length: ${Array.isArray(carsData) ? carsData.length : 'N/A'}`);
      
//       if (Array.isArray(carsData)) {
//         debugLog(`✅ Processing ${carsData.length} cars`);
//         const transformed = transformCars(carsData);
//         debugLog(`✅ Transformed ${transformed.length} cars`);
//         setLiveCars(transformed);

//         // Only log when the number of live cars actually changes to avoid spam
//         const newCount = transformed.length;
//         if (lastLiveCarsCountRef.current === null || lastLiveCarsCountRef.current !== newCount) {
//           debugLog(`🚗 Live cars updated: ${newCount} cars (was: ${lastLiveCarsCountRef.current})`);
//           lastLiveCarsCountRef.current = newCount;
//         }
//       } else {
//         debugError(`❌ liveCars data is not an array:`, typeof carsData, carsData);
//       }
//     });

//     // Listen for updated live cars (real-time updates)
//     s.on('liveCarUpdate', (carData: any) => {
//       console.log('🔧 RAW: liveCarUpdate event received:', carData);
//       debugLog('🚗 Live car update received:', `Car ID: ${carData?.id}, Make: ${carData?.make}`);
//       setLiveCars((prevCars) => {
//         const updatedCars = prevCars.map((car) =>
//           car.id === carData.id ? { ...car, ...carData } : car
//         );
//         return updatedCars;
//       });
//     });

//     // Listen for new live cars added
//     s.on('newLiveCar', (carData: any) => {
//       console.log('🔧 RAW: newLiveCar event received:', carData);
//       debugLog('🚗 New live car added:', `Make: ${carData?.make}, Model: ${carData?.model}`);
//       const transformed = transformCars([carData]);
//       setLiveCars((prevCars) => [...prevCars, ...transformed]);
//     });

//     s.on('topThreeBids', (bidsData: any[]) => {
//       console.log('🔧 RAW: topThreeBids event received:', bidsData);
//       debugLog(`📨 Received topThreeBids event with ${Array.isArray(bidsData) ? bidsData.length : 0} bids`);
//       if (Array.isArray(bidsData)) {
//         setTopThreeBidsAmount(bidsData);
//         setTopThreeBidsAmountArray(bidsData);
//         debugLog(`💰 Top three bids received: ${bidsData.length}`, bidsData);
//       }
//     });

//     s.on('error', (err: any) => {
//       console.error('🔧 RAW: Socket error:', err);
//       debugError('❌ Socket.IO error:', err);
//       setConnectionError(typeof err === 'string' ? err : (err?.message || 'Socket error'));
//       setConnectionStatus('error');
//       // Stop marking as connected so polling interval stops
//       setIsConnected(false);
//     });

//     // CATCH ALL EVENTS - for debugging
//     s.onAny((eventName: string, ...args: any[]) => {
//       console.log(`🔧 RAW WILDCARD EVENT: "${eventName}"`, args);
//     });

//     listenersAttachedRef.current = true;
//     console.log('🔧 RAW: Socket listeners attached successfully');
//     debugLog('✅ Socket listeners attached successfully');
//   };
 
//   const connectLiveCarsSocket = () => {
//     debugLog(`📡 Connecting to Socket.IO: ${SOCKET_IO_URL}`);

//     if (socket && socket.connected) {
//       debugLog('✅ Socket already connected, attaching listeners...');
//       attachSocketListeners(socket);
//       return true;
//     }

//     try {
//       debugLog('🔌 Getting new socket instance...');
//       const s = getSocket(SOCKET_IO_URL);
//       debugLog('✅ Socket instance created');
//       attachSocketListeners(s);
//       setSocket(s);
//       return true;
//     } catch (e) {
//       debugError('❌ Failed to init Socket.IO:', e);
//       return false;
//     }
//   };  const connectWebSocket = async () => {
//     debugLog('🔗 connectWebSocket() called');
//     console.log('🔧 RAW: connectWebSocket() called, current status:', connectionStatus);
//     clearConnectionTimeout();

//     if (isConnecting.current) {
//       debugLog('🔄 Connection already in progress...');
//       console.log('🔧 RAW: Already connecting, returning');
//       return;
//     }

//     setConnectionStatus('connecting');
//     setConnectionError(null);
//     isConnecting.current = true;
//     debugLog(`⏳ Setting connection status to: connecting`);

//     // Try to ping server first to verify it's reachable
//     try {
//       console.log('🔧 RAW: Attempting to reach server at', SOCKET_IO_URL);
//       await Promise.race([
//         fetch(`${SOCKET_IO_URL}/socket.io/?transport=websocket`, {
//           method: 'GET',
//         }).catch(e => {
//           console.log('🔧 RAW: Server ping failed (expected for websocket):', e.message);
//           return null;
//         }),
//         new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000)),
//       ]).catch(e => {
//         console.log('🔧 RAW: Server reachability test:', e.message);
//       });
//     } catch (e) {
//       console.log('🔧 RAW: Could not verify server reachability');
//     }

//     const success = connectLiveCarsSocket();

//     if (success) {
//       isConnecting.current = false;
//       debugLog('✅ Connected via Socket.IO');
//       console.log('🔧 RAW: Successfully connected via Socket.IO');
//     } else {
//       setConnectionStatus('error');
//       setConnectionError('Unable to connect to Socket.IO gateway');
//       isConnecting.current = false;
//       debugError('❌ Connection failed, triggering reconnect...');
//       console.log('🔧 RAW: Connection failed');
//       handleReconnect();
//     }
//   };
 
//   const handleReconnect = () => {
//     debugLog(`🔄 handleReconnect() called, attempts: ${reconnectAttempts.current}/${maxReconnectAttempts}`);
    
//     if (reconnectAttempts.current < maxReconnectAttempts) {
//       reconnectAttempts.current += 1;
//       debugWarn(
//         `🔄 Reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`,
//       );
//       setTimeout(() => {
//         if (!isConnecting.current) {
//           debugLog('⏱️ Retrying connection after timeout...');
//           connectWebSocket();
//         }
//       }, 3000);
//     } else {
//       debugError('🛑 Max reconnection attempts reached');
//       setConnectionError(
//         'Unable to connect to server. Please restart the app.',
//       );
//     }
//   };
 
//   // Auto-connect on mount and fetch live cars periodically
//   useEffect(() => {
//     debugLog('🎯 useEffect: Mounting WebSocketProvider, initiating connection...');
//     console.log('🔧 RAW: WebSocketProvider mounting, calling connectWebSocket');
//     connectWebSocket();

//     return () => {
//       debugLog('🎯 useEffect: Unmounting WebSocketProvider, cleaning up...');
//       console.log('🔧 RAW: WebSocketProvider unmounting, calling disconnectWebSocket');
//       disconnectWebSocket();
//     };
//   }, []);  // NOTE: We intentionally do NOT poll getLiveCars in a loop anymore to avoid
//   // repeated backend errors and console spam. Live cars are fetched:
//   // 1. Once on socket connect (see connect handler)
//   // 2. On-demand via getLiveCars()
 
//   const getLiveCars = () => {
//     debugLog('🔍 getLiveCars() called');
//     debugLog('🔗 Socket state - connected:', socket?.connected, 'socket exists:', !!socket);
    
//     if (socket && socket.connected) {
//       debugLog('📤 Emitting getLiveCars over Socket.IO');
//       socket.emit('getLiveCars');
//       debugLog('✅ getLiveCars emitted successfully');
//     } else {
//       debugWarn('⚠️ Socket.IO not connected yet', `socket=${!!socket}, connected=${socket?.connected}`);
//     }
//   };
 
//   const getTopThreeBids = (bidCarId: string) => {
//     debugLog(`🏆 getTopThreeBids() called for car: ${bidCarId}`);
//     if (socket && socket.connected) {
//       socket.emit('getTopThreeBids', { bidCarId });
//       debugLog(`📤 Emitted getTopThreeBids for car: ${bidCarId}`);
//     } else {
//       debugWarn(`⚠️ Socket.IO not connected yet, cannot emit getTopThreeBids for ${bidCarId}`);
//     }
//   };
 
//   const refreshTopThreeBids = (bidCarId: string): Promise<any> => {
//     debugLog(`♻️ refreshTopThreeBids() called for car: ${bidCarId}`);
//     return new Promise((resolve, reject) => {
//       if (!socket || !socket.connected) {
//         debugError('❌ Socket.IO not connected for refreshTopThreeBids');
//         reject('Socket.IO not connected');
//         return;
//       }

//       const handler = (response: any) => {
//         socket.off('topThreeBidsResponse', handler);
//         debugLog('📨 topThreeBidsResponse received:', response);
//         resolve(response);
//       };

//       socket.on('topThreeBidsResponse', handler);
//       socket.emit('refreshTopThreeBids', { bidCarId });
//       debugLog(`📤 Emitted refreshTopThreeBids for car: ${bidCarId}`);
//     });
//   };  const placeBid = (userData: BidUserData): Promise<any> => {
//     debugLog(`💵 placeBid() called`, `User: ${userData.userId}, Car: ${userData.bidCarId}, Amount: ${userData.amount}`);
    
//     const bid = {
//       placedBidId: null,
//       userId: userData.userId,
//       bidCarId: userData.bidCarId,
//       amount: userData.amount,
//       dateTime: new Date().toISOString(),
//     };

//     return new Promise((resolve, reject) => {
//       if (!socket || !socket.connected) {
//         debugError('❌ Socket.IO not connected for placeBid');
//         reject('Socket.IO not connected');
//         return;
//       }

//       const handler = (response: any) => {
//         socket.off('placeBidResult', handler);
//         debugLog('📨 placeBidResult received:', response);
//         resolve(response);
//       };

//       socket.on('placeBidResult', handler);
//       socket.emit('placeBid', bid);
//       debugLog('📤 Emitted placeBid over Socket.IO');
//     });
//   };
 
//   const disconnectWebSocket = () => {
//     debugLog('🔌 disconnectWebSocket() called');
//     setConnectionStatus('disconnected');
//     isConnecting.current = false;
//     clearConnectionTimeout();

//     if (socket) {
//       debugLog('📤 Disconnecting socket...');
//       socket.disconnect();
//     }

//     setIsConnected(false);
//     setIsAuthenticated(false);
//     setSocket(null);
//     setLiveCars([]);
//     setTopThreeBidsAmount([]);
//     setTopThreeBidsAmountArray([]);
//     listenersAttachedRef.current = false;
//     debugLog('✅ WebSocket fully disconnected and cleaned up');
//   };  // Optionally poll getLiveCars on an interval (disabled by default to avoid backend loops)
//   useEffect(() => {
//     debugLog('🎯 useEffect: Polling interval setup');
//     if (!ENABLE_PERIODIC_LIVE_CARS_POLLING) {
//       debugLog('ℹ️ Periodic polling disabled');
//       return;
//     }

//     let interval: NodeJS.Timeout | undefined;

//     if (isConnected && socket) {
//       debugLog('⏱️ Starting 5-second polling interval for live cars');
//       interval = setInterval(() => {
//         debugLog('🔄 Polling getLiveCars...');
//         socket.emit('getLiveCars');
//       }, 5000);
//     }

//     return () => {
//       if (interval) {
//         debugLog('🎯 useEffect: Clearing polling interval');
//         clearInterval(interval);
//       }
//     };
//   }, [isConnected, socket]);
 
//   const contextValue: WebSocketContextType = {
//     isConnected,
//     placeBid,
//     getTopThreeBids,
//     topThreeBidsAmount,
//     topThreeBidsAmountArray,
//     getLiveCars,
//     liveCars,
//     refreshTopThreeBids,
//     client: socket,
//     subscriptions,
//     connectWebSocket,
//     disconnectWebSocket,
//     isAuthenticated,
//     connectionError,
//     connectionStatus,
//   };

//   // HELPER: Expose debug functions for testing
//   useEffect(() => {
//     (globalThis as any).WebSocketDebug = {
//       forceLiveCars: () => {
//         console.log('🔧 DEBUG: Force calling getLiveCars');
//         getLiveCars();
//       },
//       forceConnect: () => {
//         console.log('🔧 DEBUG: Force calling connectWebSocket');
//         connectWebSocket();
//       },
//       socketState: () => {
//         return {
//           connected: socket?.connected,
//           id: socket?.id,
//           status: connectionStatus,
//           isConnected,
//           liveCarsCount: liveCars.length,
//         };
//       },
//       emitDirect: (eventName: string, data: any = null) => {
//         if (socket?.connected) {
//           socket.emit(eventName, data);
//           console.log(`🔧 DEBUG: Emitted "${eventName}":`, data);
//         } else {
//           console.warn('🔧 DEBUG: Socket not connected');
//         }
//       },
//     };
//   }, [socket, connectionStatus, isConnected, liveCars.length]);
 
//   return (
//     <WebSocketContext.Provider value={contextValue}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// export const useWebSocket = (): WebSocketContextType => {
//   // debugLog('🎣 useWebSocket hook called');
//   const context = useContext(WebSocketContext);
//   if (!context) {
//     debugError('❌ useWebSocket called outside WebSocketProvider');
//     throw new Error('useWebSocket must be used within a WebSocketProvider');
//   }
//   return context;
// };

// // Default export - empty component (provider is already in the tree from main.tsx)
// export default function WebSocketConnectionComponent() {
//   return null;
// }
// 


import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from './socketio';

interface WebSocketContextType {
  isConnected: boolean;
  placeBid: (userData: BidUserData) => Promise<any>;
  getTopThreeBids: (bidCarId: string) => void;
  topThreeBidsAmount: any[];
  topThreeBidsAmountArray: any[];
  getLiveCars: () => void;
  liveCars: any[];
  refreshTopThreeBids: (bidCarId: string) => Promise<any>;
  getLiveBidValue: (bidCarId: string) => void;
  client: Socket | null;
  subscriptions: React.MutableRefObject<Record<string, any>>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  isAuthenticated: boolean;
  connectionError: string | null;
  connectionStatus: string;
}

interface WebSocketProviderProps {
  children: ReactNode;
}

interface BidUserData {
  userId: string;
  bidCarId: string;
  amount: number;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

import { SOCKET_SERVER_URL } from './serverConfig';

// Primary socket endpoint used by the provider. Change `src/utility/serverConfig.ts` to update this.
const SOCKET_IO_URL = SOCKET_SERVER_URL;

const ENABLE_SOCKET_DEBUG_LOGS = true;

const debugLog = (...args: any[]) => {
  if (ENABLE_SOCKET_DEBUG_LOGS) {
    console.log('[Socket.IO]', new Date().toISOString(), ...args);
  }
};

const debugError = (...args: any[]) => {
  console.error('[Socket.IO ERROR]', new Date().toISOString(), ...args);
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [socket, setSocket] = useState<Socket | null>(null);

  const [topThreeBidsAmount, setTopThreeBidsAmount] = useState<any[]>([]);
  const [topThreeBidsAmountArray, setTopThreeBidsAmountArray] = useState<any[]>([]);
  const [liveCars, setLiveCars] = useState<any[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const listenersAttachedRef = useRef(false);
  const attachedSocketIdsRef = useRef<Set<string>>(new Set());
  const hasFetchedInitialDataRef = useRef(false);
  const lastLiveCarsFetchRef = useRef<number>(0);
  const lastReceivedLiveCarsRef = useRef<number>(0);
  const lastReceivedLiveCarsLengthRef = useRef<number>(0);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  const subscriptions = useRef<Record<string, any>>({});  const transformCars = (carsData: any[]): any[] => {
    return carsData.map((car: any) => {
      const bidId = car.bidCarId ?? car.bidcarid ?? car.carId ?? car.id;
      return {
        id: String(bidId),
        bidCarId: bidId,
        imageUrl: car.imageUrl || car.image || car.carImage,
        make: car.make || car.brand || 'Car',
        model: car.model || car.modelName || 'Model',
        currentBid: car.currentBid || car.highestBid || 0,
        remainingTime: car.remainingTime || '00:00:00',
        ...car,
      };
    });
  };

  const attachSocketListeners = (s: Socket) => {
    if (listenersAttachedRef.current) {
      debugLog('⚠️ Listeners already attached - skipping');
      return;
    }

    debugLog('🔗 Attaching Socket.IO listeners ONCE');

    s.on('connect', () => {
      debugLog('✅ Socket.IO CONNECTED', s.id);
      setIsConnected(true);
      setConnectionStatus('connected');
      setConnectionError(null);
      setIsAuthenticated(true);
      reconnectAttemptsRef.current = 0;

      // 🔥 Emit getLiveCars only once on the first successful connection
      // Use a debounce to prevent rapid re-emits if socket reconnects frequently
      const now = Date.now();
      if (!hasFetchedInitialDataRef.current || (now - lastLiveCarsFetchRef.current > 5000)) {
        hasFetchedInitialDataRef.current = true;
        lastLiveCarsFetchRef.current = now;
        debugLog('📤 Emitting getLiveCars on connect');
        s.emit('getLiveCars');
      }

      debugLog('✅ Socket connected and ready for events');
    });

    s.on('disconnect', (reason) => {
      debugLog('⚠️ Socket.IO DISCONNECTED:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      listenersAttachedRef.current = false;
      // Clear socket ID so listeners can be re-attached on reconnect
      if (s.id) {
        attachedSocketIdsRef.current.delete(s.id);
      }
    });

    s.on('liveCars', (carsData: any[]) => {
      // Deduplicate: ignore if we received the same length of cars within 500ms
      const now = Date.now();
      const currentLength = Array.isArray(carsData) ? carsData.length : 0;

      if (
        lastReceivedLiveCarsLengthRef.current === currentLength &&
        now - lastReceivedLiveCarsRef.current < 500
      ) {
        debugLog(`⏭️ Skipping duplicate liveCars event (${currentLength} cars)`);
        return;
      }

      lastReceivedLiveCarsRef.current = now;
      lastReceivedLiveCarsLengthRef.current = currentLength;

      debugLog(`📨 liveCars: ${currentLength} cars`);
      if (Array.isArray(carsData)) {
        setLiveCars(transformCars(carsData));
      }
    });

    s.on('liveCarUpdate', (carData: any) => {
      debugLog('🚗 liveCarUpdate:', carData.bidCarId);
      setLiveCars((prev) =>
        prev.map((car) =>
          car.bidCarId === carData.bidCarId ? { ...car, ...carData } : car
        )
      );
    });

    s.on('newLiveCar', (carData: any) => {
      debugLog('🚗 newLiveCar');
      const newCar = transformCars([carData])[0];
      setLiveCars((prev) => [...prev, newCar]);
    });

    s.on('topThreeBids', (bidsData: any[]) => {
      debugLog('🏆 topThreeBids:', bidsData.length);
      setTopThreeBidsAmount(bidsData);
      setTopThreeBidsAmountArray(bidsData);
    });

    s.on('liveBidValue', (bidData: any) => {
      debugLog('💰 liveBidValue:', bidData.bidCarId, bidData.amount);
      setTopThreeBidsAmount((prev) =>
        prev.map((bid) =>
          bid.bidCarId === bidData.bidCarId ? { ...bid, ...bidData } : bid
        )
      );
      setTopThreeBidsAmountArray((prev) =>
        prev.map((bid) =>
          bid.bidCarId === bidData.bidCarId ? { ...bid, ...bidData } : bid
        )
      );
      setLiveCars((prev) =>
        prev.map((car) =>
          car.bidCarId === bidData.bidCarId
            ? { ...car, currentBid: bidData.amount }
            : car
        )
      );
    });

    s.on('error', (err: any) => {
      debugError('❌ Socket error:', err);
      setConnectionError(err?.message || 'Socket error');
    });

    listenersAttachedRef.current = true;
    debugLog('✅ ALL Socket.IO listeners attached');
  };

  // ✅ FIXED: getSocket() takes 1 argument only
  const createSocketConnection = () => {
    if (socketRef.current?.connected) {
      debugLog('✅ Socket already connected');
      return socketRef.current;
    }

    try {
      // FIXED: Only pass URL - no options object
      const newSocket = getSocket(SOCKET_IO_URL);
      const socketId = newSocket.id || 'unknown';

      // Only attach listeners once per socket instance
      if (!attachedSocketIdsRef.current.has(socketId)) {
        attachedSocketIdsRef.current.add(socketId);
        socketRef.current = newSocket;
        setSocket(newSocket);
        attachSocketListeners(newSocket);
        debugLog(`🔐 Listeners attached for socket: ${socketId}`);
      }

      newSocket.connect();
      return newSocket;
    } catch (error) {
      debugError('❌ Socket creation failed:', error);
      return null;
    }
  };  const connectWebSocket = () => {
    debugLog('🔗 connectWebSocket called');
    createSocketConnection();
  };

  useEffect(() => {
    debugLog('🎯 Mounting - Creating Socket.IO connection');
    connectWebSocket();

    return () => {
      debugLog('🧹 Unmounting - Cleaning up');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setLiveCars([]);
      listenersAttachedRef.current = false;
    };
  }, []);

  const getLiveCars = () => {
    debugLog('🔍 Manual getLiveCars called');
    const now = Date.now();
    // Debounce: don't emit if called within 2 seconds of last emit
    if (now - lastLiveCarsFetchRef.current >= 2000) {
      lastLiveCarsFetchRef.current = now;
      socketRef.current?.emit('getLiveCars');
      debugLog('📤 Emitted getLiveCars');
    } else {
      debugLog('⏱️ getLiveCars call throttled (too soon)');
    }
  };

  const getTopThreeBids = (bidCarId: string) => {
    debugLog(`🏆 getTopThreeBids: ${bidCarId}`);
    socketRef.current?.emit('getTopThreeBids', { bidCarId });
  };

  const getLiveBidValue = (bidCarId: string) => {
    debugLog(`💰 getLiveBidValue: ${bidCarId}`);
    socketRef.current?.emit('getLiveBidValue', { bidCarId });
  };

  const refreshTopThreeBids = (bidCarId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject('Socket not connected');
        return;
      }
      const handler = (response: any) => {
        socketRef.current!.off('topThreeBidsResponse', handler);
        resolve(response);
      };
      socketRef.current!.on('topThreeBidsResponse', handler);
      socketRef.current!.emit('refreshTopThreeBids', { bidCarId });
    });
  };

  const placeBid = (userData: BidUserData): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject('Socket not connected');
        return;
      }
      const handler = (response: any) => {
        socketRef.current!.off('placeBidResult', handler);
        resolve(response);
      };
      socketRef.current!.on('placeBidResult', handler);
      socketRef.current!.emit('placeBid', {
        placedBidId: null,
        userId: userData.userId,
        bidCarId: userData.bidCarId,
        amount: userData.amount,
        dateTime: new Date().toLocaleString(),
      });
    });
  };

  const disconnectWebSocket = () => {
    debugLog('🔌 Manual disconnect');
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const contextValue: WebSocketContextType = {
    isConnected,
    placeBid,
    getTopThreeBids,
    topThreeBidsAmount,
    topThreeBidsAmountArray,
    getLiveCars,
    liveCars,
    refreshTopThreeBids,
    getLiveBidValue,
    client: socket,
    subscriptions,
    connectWebSocket,
    disconnectWebSocket,
    isAuthenticated,
    connectionError,
    connectionStatus,
  };

  useEffect(() => {
    (globalThis as any).SocketIODebug = {
      socketState: () => ({
        connected: socketRef.current?.connected,
        liveCars: liveCars.length,
        topBids: topThreeBidsAmount.length,
      }),
      forceLiveCars: getLiveCars,
      forceBidValue: getLiveBidValue,
    };
  }, [liveCars.length, topThreeBidsAmount.length]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export default function WebSocketConnectionComponent() {
  return null;
}
