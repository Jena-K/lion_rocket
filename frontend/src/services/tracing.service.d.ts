import { SpanKind } from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';
/**
 * Distributed tracing service for frontend
 */
export declare class TracingService {
    private static instance;
    private tracer;
    private provider;
    private constructor();
    static getInstance(): TracingService;
    /**
     * Initialize OpenTelemetry tracing
     */
    initialize(config?: {
        serviceName?: string;
        serviceVersion?: string;
        environment?: string;
        jaegerEndpoint?: string;
    }): void;
    /**
     * Start a new span
     */
    startSpan(name: string, options?: {
        kind?: SpanKind;
        attributes?: Record<string, any>;
    }): Span;
    /**
     * Start an active span (automatically becomes current)
     */
    startActiveSpan<T>(name: string, fn: (span: Span) => T, options?: {
        kind?: SpanKind;
        attributes?: Record<string, any>;
    }): T;
    /**
     * Add event to current span
     */
    addEvent(name: string, attributes?: Record<string, any>): void;
    /**
     * Set attribute on current span
     */
    setAttribute(key: string, value: any): void;
    /**
     * Set multiple attributes on current span
     */
    setAttributes(attributes: Record<string, any>): void;
    /**
     * Record an exception on current span
     */
    recordException(error: Error): void;
    /**
     * Get current trace ID
     */
    getCurrentTraceId(): string | null;
    /**
     * Wrap async function with tracing
     */
    traceAsync<T>(name: string, fn: () => Promise<T>, options?: {
        kind?: SpanKind;
        attributes?: Record<string, any>;
    }): Promise<T>;
    /**
     * Wrap sync function with tracing
     */
    trace<T>(name: string, fn: () => T, options?: {
        kind?: SpanKind;
        attributes?: Record<string, any>;
    }): T;
    /**
     * Create a child span of current span
     */
    createChildSpan(name: string, options?: {
        kind?: SpanKind;
        attributes?: Record<string, any>;
    }): Span;
}
export declare const tracingService: TracingService;
export declare const startSpan: (name: string, options?: any) => Span;
export declare const traceAsync: <T>(name: string, fn: () => Promise<T>, options?: any) => Promise<T>;
export declare const trace: <T>(name: string, fn: () => T, options?: any) => T;
export declare const addEvent: (name: string, attributes?: Record<string, any>) => void;
export declare const setAttribute: (key: string, value: any) => void;
export declare const setAttributes: (attributes: Record<string, any>) => void;
export declare const recordException: (error: Error) => void;
export declare const getCurrentTraceId: () => string | null;
