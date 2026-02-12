import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { type AxiosRequestConfig, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface ApiMetrics {
    endpoint: string;
    latency: number;
    status: number | null;
    timestamp: number;
    correlationId: string;
    isSuccess: boolean;
}

interface UseVerticalApiOptions<T> {
    endpoint: string;
    pollingInterval?: number; // ms
    headers?: Record<string, string>;
    transformResponse?: (data: any) => T;
}

export function useVerticalApi<T>({ endpoint, pollingInterval, headers, transformResponse }: UseVerticalApiOptions<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<ApiMetrics | null>(null);
    
    // Use refs to prevent interval overlap
    const isFetching = useRef(false);

    const fetchData = useCallback(async () => {
        if (isFetching.current) return;
        isFetching.current = true;

        const correlationId = uuidv4();
        const startTime = performance.now();
        
        // Log Request
        console.log(`[${correlationId}] Requesting ${endpoint}`);

        try {
            setLoading(true);
            const config: AxiosRequestConfig = {
                headers: {
                    'X-Correlation-ID': correlationId,
                    ...headers
                }
            };

            const response = await axios.get(endpoint, config);
            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);

            const transformedData = transformResponse ? transformResponse(response.data) : response.data;
            setData(transformedData);
            setError(null);

            const newMetrics: ApiMetrics = {
                endpoint,
                latency,
                status: response.status,
                timestamp: Date.now(),
                correlationId,
                isSuccess: true
            };
            setMetrics(newMetrics);
            
            // In a real app, send metrics to backend/monitoring service here
            console.log(`[${correlationId}] Success (${latency}ms)`);

        } catch (err) {
            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);
            const axiosError = err as AxiosError;
            
            const errorMessage = axiosError.message || 'Unknown error occurred';
            setError(errorMessage);

            const newMetrics: ApiMetrics = {
                endpoint,
                latency,
                status: axiosError.response?.status || 0,
                timestamp: Date.now(),
                correlationId,
                isSuccess: false
            };
            setMetrics(newMetrics);

            console.error(`[${correlationId}] Failed (${latency}ms): ${errorMessage}`);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [endpoint, headers, transformResponse]);

    useEffect(() => {
        fetchData();

        if (pollingInterval) {
            const intervalId = setInterval(fetchData, pollingInterval);
            return () => clearInterval(intervalId);
        }
    }, [fetchData, pollingInterval]);

    const refetch = () => fetchData();

    return { data, loading, error, metrics, refetch };
}
