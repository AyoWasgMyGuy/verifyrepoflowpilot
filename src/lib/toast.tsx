import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFloatingBottomOffset } from './layout';
import { theme } from '../styles/theme';

type ToastOptions = {
  message: string;
  actionLabel?: string;
  durationMs?: number;
  onAction?: () => void;
};

type ToastContextValue = {
  showToast: (toast: ToastOptions) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomOffset = useFloatingBottomOffset(12);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((next: ToastOptions) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(next);
    const duration = next.durationMs ?? 5000;
    timeoutRef.current = setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, duration);
  }, []);

  useEffect(() => () => hideToast(), [hideToast]);

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.root} pointerEvents="box-none">
        {children}
        {toast ? (
          <View style={[styles.toast, { bottom: bottomOffset }]} pointerEvents="auto">
            <Text style={styles.toastText}>{toast.message}</Text>
            {toast.actionLabel ? (
              <Pressable
                onPress={() => {
                  toast.onAction?.();
                  hideToast();
                }}
              >
                <Text style={styles.toastAction}>{toast.actionLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toast: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(17,24,24,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toastText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  toastAction: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
});
