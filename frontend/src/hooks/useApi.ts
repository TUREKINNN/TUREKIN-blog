import { useState, useCallback, useRef, useEffect } from 'react';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (overrideOptions?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = unknown>(url: string, options?: RequestInit): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (overrideOptions?: RequestInit): Promise<T | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const mergedHeaders = new Headers(options?.headers);
      if (overrideOptions?.headers) {
        new Headers(overrideOptions.headers).forEach((v, k) => mergedHeaders.set(k, v));
      }
      if (!mergedHeaders.has('Content-Type')) {
        mergedHeaders.set('Content-Type', 'application/json');
      }
      const res = await fetch(url, {
        credentials: 'include',
        ...options,
        ...overrideOptions,
        headers: mergedHeaders,
      });
      const json: ApiResponse<T> = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || '请求失败');
      }
      if (mountedRef.current) {
        setState({ data: json.data ?? null, loading: false, error: null });
      }
      return json.data ?? null;
    } catch (e) {
      const message = e instanceof Error ? e.message : '网络错误';
      if (mountedRef.current) {
        setState({ data: null, loading: false, error: message });
      }
      return null;
    }
  }, [url, options]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export async function apiFetch<T = unknown>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const mergedHeaders = new Headers(options?.headers);
    if (!mergedHeaders.has('Content-Type')) {
      mergedHeaders.set('Content-Type', 'application/json');
    }
    const res = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: mergedHeaders,
    });
    const json: ApiResponse<T> = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || '请求失败');
    }
    return json.data ?? null;
  } catch (e) {
    console.error(`[apiFetch] ${options?.method || 'GET'} ${url} failed:`, e instanceof Error ? e.message : e);
    return null;
  }
}

export async function apiUpload<T = unknown>(url: string, formData: FormData): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const json: ApiResponse<T> = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || '上传失败');
    }
    return json.data ?? null;
  } catch (e) {
    console.error(`[apiUpload] POST ${url} failed:`, e instanceof Error ? e.message : e);
    return null;
  }
}