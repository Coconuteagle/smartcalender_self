import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ApiKeyContextValue = {
  apiKey: string;
  setApiKey: (nextKey: string) => void;
  clearApiKey: () => void;
};

const STORAGE_KEY = 'smartcalendar:geminiApiKey';

const ApiKeyContext = createContext<ApiKeyContextValue | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    return (existing ?? '').trim();
  });

  const setApiKey = useCallback((nextKey: string) => {
    const cleaned = nextKey.trim();
    setApiKeyState(cleaned);
    if (cleaned) {
      localStorage.setItem(STORAGE_KEY, cleaned);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKey('');
  }, [setApiKey]);

  const value = useMemo<ApiKeyContextValue>(
    () => ({ apiKey, setApiKey, clearApiKey }),
    [apiKey, setApiKey, clearApiKey],
  );

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
}

export function useApiKey() {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return ctx;
}

