import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import { addWebSocketNotification, syncUnreadCount } from '../Redux Toolkit/features/notification/notificationSlice';
import { fetchUnreadCount } from '../Redux Toolkit/features/notification/notificationThunks';

export const useWebSocket = () => {
  const dispatch = useDispatch();
  const { user, userProfile } = useSelector(state => state.user);
  const currentUser = userProfile || user;
  const stompClient = useRef(null);

  useEffect(() => {
    if (!currentUser?.id) return;

    // Fetch initial unread count
    dispatch(fetchUnreadCount());

    const token = localStorage.getItem('jwt');
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws/websocket';
    
    stompClient.current = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        stompClient.current.subscribe(`/topic/admin-notifications/${currentUser.id}`, (message) => {
          if (message.body) {
            try {
              const notification = JSON.parse(message.body);
              dispatch(addWebSocketNotification(notification));
            } catch (e) {
              console.error('Failed to parse WebSocket notification', e);
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });

    stompClient.current.activate();

    // Cross-tab synchronization
    const channel = new BroadcastChannel('notifications_channel');
    channel.onmessage = (event) => {
      if (event.data.type === 'SYNC_UNREAD') {
        dispatch(syncUnreadCount(event.data.count));
      }
    };

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
      channel.close();
    };
  }, [dispatch, currentUser?.id]);
};

