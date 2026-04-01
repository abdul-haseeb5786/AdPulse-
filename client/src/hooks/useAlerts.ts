import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import apiClient from '../services/apiClient';
import { API_URL } from '../config/api';

export interface Alert {
  id: string;
  campaign_id: string;
  campaign_name: string;
  rule_id: string | null;
  metric: string;
  message: string;
  current_value: number;
  threshold_value: number;
  severity: 'info' | 'warning' | 'critical';
  is_read: boolean;
  triggered_at: string;
}

interface AlertsResponse {
  data: Alert[];
  unreadCount: number;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const fetchInitialAlerts = async () => {
      try {
        const data = await apiClient.get<any, AlertsResponse>('/alerts');
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
    const token = localStorage.getItem('adpulse-token');
    socketRef.current = io(API_URL, {
      auth: { token }
    });
         
    socketRef.current.on('new_alert', (alert: Alert) => {
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
