import { useEffect, useRef, useState, useCallback } from 'react';
import { websocketService } from '@/services/websocketService';
import type { WsConnectionStatus, WsInboundMessage, WsSessionConfig } from '@/types/websocket.types';

interface UseWebSocketReturn {
  status:         WsConnectionStatus;
  lastMessage:    WsInboundMessage | null;
  connect:        (url?: string) => void;
  disconnect:     () => void;
  startSession:   (config: WsSessionConfig) => void;
  stopSession:    (sessionId: string) => void;
  pauseSession:   (sessionId: string) => void;
  resumeSession:  (sessionId: string) => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [status, setStatus]           = useState<WsConnectionStatus>('idle');
  const [lastMessage, setLastMessage] = useState<WsInboundMessage | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Subscribe status — Fix F2: onStatus() (không phải onStatusChange)
    const unsubStatus = websocketService.onStatus((s) => {
      if (mountedRef.current) setStatus(s);
    });

    // Subscribe message
    const unsubMessage = websocketService.onMessage((msg) => {
      if (mountedRef.current) setLastMessage(msg);
    });

    return () => {
      mountedRef.current = false;
      unsubStatus();
      unsubMessage();
    };
  }, []);

  const connect       = useCallback((url?: string) => websocketService.connect(url), []);
  const disconnect    = useCallback(() => websocketService.disconnect(), []);
  const startSession  = useCallback((config: WsSessionConfig) => websocketService.startSession(config), []);
  const stopSession   = useCallback((id: string) => websocketService.stopSession(id), []);
  const pauseSession  = useCallback((id: string) => websocketService.pauseSession(id), []);
  const resumeSession = useCallback((id: string) => websocketService.resumeSession(id), []);

  return {
    status,
    lastMessage,
    connect,
    disconnect,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
  };
}
