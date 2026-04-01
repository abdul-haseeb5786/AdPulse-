import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import apiClient from '../services/apiClient';
import { API_URL } from '../config/api';

export function useAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const fetchInitialAlerts = async () => {
      try {
        const data: any = await apiClient.get('/alerts');
        setAlerts(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialAlerts();

    // Connect real-time socket
    socketRef.current = io(API_URL);
         
    socketRef.current.on('new_alert', (alert: any) => {
      setAlerts(prev => [alert, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.patch(`/alerts/${id}/read`);
      setAlerts(prev => prev.map(a => 
        a.id === id ? { ...a, is_read: true } : a
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiClient.patch('/alerts/read-all');
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, []);

  return { alerts, unreadCount, isLoading, markAsRead, markAllRead };
}
