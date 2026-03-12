/**
 * useStreamingChat — WebSocket streaming chat hook
 *
 * Connects to ws://{host}/ws/chat/{conversation_id}
 * Streams tokens like ChatGPT, with reconnection + typing indicators.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../types';

// ── Types ────────────────────────────────────────────────────

export type MessageReaction = 'thumbs_up' | 'thumbs_down' | null;

export interface StreamingMessage extends ChatMessage {
  streaming?: boolean;
  reaction?: MessageReaction;
}

export interface UseStreamingChatOptions {
  conversationId?: string;
  onError?: (err: Error) => void;
  onTokenReceived?: (token: string) => void;
  onMessageComplete?: (msg: StreamingMessage) => void;
  maxReconnectAttempts?: number;
  initialMessages?: StreamingMessage[];
}

export interface UseStreamingChatReturn {
  messages: StreamingMessage[];
  isConnected: boolean;
  isTyping: boolean;
  isSending: boolean;
  conversationId: string | null;
  sendMessage: (text: string) => void;
  clearMessages: () => void;
  reactToMessage: (messageId: string, reaction: MessageReaction) => void;
  reconnect: () => void;
}

// ── WS event shapes ──────────────────────────────────────────

interface WsTokenEvent {
  type: 'token';
  token: string;
  message_id: string;
}

interface WsCompleteEvent {
  type: 'complete';
  message_id: string;
  module_used?: string;
  tokens_used?: number;
}

interface WsErrorEvent {
  type: 'error';
  error: string;
}

interface WsConnectedEvent {
  type: 'connected';
  conversation_id: string;
}

type WsEvent = WsTokenEvent | WsCompleteEvent | WsErrorEvent | WsConnectedEvent;

// ── Helpers ───────────────────────────────────────────────────

function buildWsUrl(conversationId: string): string {
  const apiBase = (import.meta as Record<string, unknown> & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ?? '';
  // Convert http(s) → ws(s), or use relative ws upgrade
  if (apiBase) {
    const wsBase = apiBase.replace(/^https?/, (m) => (m === 'https' ? 'wss' : 'ws'));
    return `${wsBase}/ws/chat/${conversationId}`;
  }
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/ws/chat/${conversationId}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Hook ──────────────────────────────────────────────────────

const BASE_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 30_000;
const JITTER_FACTOR = 0.3;

export function useStreamingChat(options: UseStreamingChatOptions = {}): UseStreamingChatReturn {
  const {
    conversationId: initialConvId,
    onError,
    onTokenReceived,
    onMessageComplete,
    maxReconnectAttempts = 8,
    initialMessages = [],
  } = options;

  const [messages, setMessages] = useState<StreamingMessage[]>(initialMessages);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(initialConvId ?? null);

  // Mutable refs (don't trigger re-render)
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);
  const pendingMessageId = useRef<string | null>(null);
  const pendingQueue = useRef<string[]>([]);

  // ── Connect ───────────────────────────────────────────────

  const connect = useCallback(
    (convId: string) => {
      if (unmounted.current) return;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

      const url = buildWsUrl(convId);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (unmounted.current) { ws.close(); return; }
        setIsConnected(true);
        reconnectAttempts.current = 0;
        // Flush any queued messages
        while (pendingQueue.current.length > 0) {
          const queued = pendingQueue.current.shift();
          if (queued) ws.send(JSON.stringify({ type: 'message', text: queued }));
        }
      };

      ws.onmessage = (ev: MessageEvent<string>) => {
        if (unmounted.current) return;
        let event: WsEvent;
        try {
          event = JSON.parse(ev.data) as WsEvent;
        } catch {
          return;
        }

        if (event.type === 'connected') {
          setConversationId(event.conversation_id);
          return;
        }

        if (event.type === 'token') {
          onTokenReceived?.(event.token);
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === event.message_id);
            if (idx === -1) {
              // New streaming message
              const newMsg: StreamingMessage = {
                id: event.message_id,
                role: 'assistant',
                content: event.token,
                timestamp: new Date().toISOString(),
                streaming: true,
              };
              return [...prev, newMsg];
            }
            // Append token to existing streaming message
            const updated = [...prev];
            updated[idx] = { ...updated[idx], content: updated[idx].content + event.token };
            return updated;
          });
          return;
        }

        if (event.type === 'complete') {
          setIsTyping(false);
          setIsSending(false);
          pendingMessageId.current = null;
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === event.message_id);
            if (idx === -1) return prev;
            const updated = [...prev];
            const completed: StreamingMessage = {
              ...updated[idx],
              streaming: false,
              module_used: event.module_used,
              tokens_used: event.tokens_used,
            };
            updated[idx] = completed;
            onMessageComplete?.(completed);
            return updated;
          });
          return;
        }

        if (event.type === 'error') {
          setIsTyping(false);
          setIsSending(false);
          const err = new Error(event.error);
          onError?.(err);
          // Append error message inline
          const errMsg: StreamingMessage = {
            id: generateId(),
            role: 'assistant',
            content: `⚠️ ${event.error}`,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errMsg]);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = (ev) => {
        if (unmounted.current) return;
        setIsConnected(false);
        setIsTyping(false);

        // Don't reconnect on clean close (code 1000) or auth failure (4001)
        if (ev.code === 1000 || ev.code === 4001) return;

        if (reconnectAttempts.current >= maxReconnectAttempts) {
          onError?.(new Error(`WebSocket failed after ${maxReconnectAttempts} attempts`));
          return;
        }

        const attempt = reconnectAttempts.current++;
        const backoff = Math.min(BASE_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS);
        const jitter = backoff * JITTER_FACTOR * (Math.random() * 2 - 1);
        const delay = Math.max(100, Math.round(backoff + jitter));

        reconnectTimer.current = setTimeout(() => {
          connect(convId);
        }, delay);
      };
    },
    [maxReconnectAttempts, onError, onTokenReceived, onMessageComplete],
  );

  // ── Disconnect ────────────────────────────────────────────

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (wsRef.current) {
      wsRef.current.onclose = null; // suppress reconnect
      wsRef.current.close(1000, 'user disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // ── Auto-connect when conversationId is available ─────────

  useEffect(() => {
    if (!conversationId) return;
    connect(conversationId);
    return () => {
      disconnect();
    };
  }, [conversationId, connect, disconnect]);

  // ── Cleanup on unmount ────────────────────────────────────

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close(1000, 'unmount');
      }
    };
  }, []);

  // ── sendMessage ───────────────────────────────────────────

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      // Add user message immediately
      const userMsg: StreamingMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsSending(true);
      setIsTyping(true);

      const payload = JSON.stringify({ type: 'message', text: trimmed });

      // If we don't have a conversationId yet, create one and connect
      if (!conversationId) {
        const newId = generateId();
        setConversationId(newId);
        pendingQueue.current.push(trimmed);
        return;
      }

      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        // Queue and reconnect
        pendingQueue.current.push(trimmed);
        connect(conversationId);
        return;
      }

      ws.send(payload);
    },
    [isSending, conversationId, connect],
  );

  // ── clearMessages ─────────────────────────────────────────

  const clearMessages = useCallback(() => {
    setMessages([]);
    const newId = generateId();
    disconnect();
    setConversationId(newId);
  }, [disconnect]);

  // ── reactToMessage ────────────────────────────────────────

  const reactToMessage = useCallback((messageId: string, reaction: MessageReaction) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, reaction: m.reaction === reaction ? null : reaction }
          : m,
      ),
    );
    // Fire-and-forget feedback to API
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'feedback', message_id: messageId, reaction }));
    }
  }, []);

  // ── reconnect (manual) ────────────────────────────────────

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    disconnect();
    if (conversationId) {
      setTimeout(() => connect(conversationId), 100);
    }
  }, [conversationId, connect, disconnect]);

  return {
    messages,
    isConnected,
    isTyping,
    isSending,
    conversationId,
    sendMessage,
    clearMessages,
    reactToMessage,
    reconnect,
  };
}
