import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { ZoneContextManager } from '@opentelemetry/context-zone';
/**
 * Distributed tracing service for frontend
 */
export class TracingService {
    static instance;
    tracer;
    provider = null;
    constructor() { }
    static getInstance() {
        if (!TracingService.instance) {
            TracingService.instance = new TracingService();
        }
        return TracingService.instance;
    }
    /**
     * Initialize OpenTelemetry tracing
     */
    initialize(config = {}) {
        // Create resource
        const resource = new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName || 'lionrocket-frontend',
            [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion || '1.0.0',
            [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment || 'development',
            'browser.user_agent': navigator.userAgent,
            'browser.language': navigator.language,
        });
        // Create provider
        this.provider = new WebTracerProvider({
            resource,
        });
        // Configure exporter
        const exporter = new OTLPTraceExporter({
            url: config.jaegerEndpoint || 'http://localhost:14268/api/traces',
            headers: {},
        });
        // Add span processor
        this.provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
        // Register provider
        this.provider.register({
            contextManager: new ZoneContextManager(),
        });
        // Register instrumentations
        registerInstrumentations({
            instrumentations: [
                new FetchInstrumentation({
                    propagateTraceHeaderCorsUrls: [
                        /.+/g, // Propagate to all URLs
                    ],
                    clearTimingResources: true,
                    applyCustomAttributesOnSpan: (span, request, response) => {
                        // Add custom attributes
                        span.setAttribute('http.request_id', request.headers.get('X-Request-ID') || 'unknown');
                        if (response) {
                            span.setAttribute('http.response_size', response.headers.get('content-length') || '0');
                        }
                    },
                }),
                new XMLHttpRequestInstrumentation({
                    propagateTraceHeaderCorsUrls: [
                        /.+/g, // Propagate to all URLs
                    ],
                }),
            ],
        });
        // Get tracer
        this.tracer = trace.getTracer(config.serviceName || 'lionrocket-frontend', config.serviceVersion || '1.0.0');
    }
    /**
     * Start a new span
     */
    startSpan(name, options) {
        return this.tracer.startSpan(name, {
            kind: options?.kind || SpanKind.CLIENT,
            attributes: options?.attributes,
        });
    }
    /**
     * Start an active span (automatically becomes current)
     */
    startActiveSpan(name, fn, options) {
        return this.tracer.startActiveSpan(name, {
            kind: options?.kind || SpanKind.CLIENT,
            attributes: options?.attributes,
        }, (span) => {
            try {
                const result = fn(span);
                span.setStatus({ code: SpanStatusCode.OK });
                return result;
            }
            catch (error) {
                span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: error instanceof Error ? error.message : 'Unknown error',
                });
                span.recordException(error);
                throw error;
            }
            finally {
                span.end();
            }
        });
    }
    /**
     * Add event to current span
     */
    addEvent(name, attributes) {
        const span = trace.getActiveSpan();
        if (span) {
            span.addEvent(name, attributes);
        }
    }
    /**
     * Set attribute on current span
     */
    setAttribute(key, value) {
        const span = trace.getActiveSpan();
        if (span) {
            span.setAttribute(key, value);
        }
    }
    /**
     * Set multiple attributes on current span
     */
    setAttributes(attributes) {
        const span = trace.getActiveSpan();
        if (span) {
            span.setAttributes(attributes);
        }
    }
    /**
     * Record an exception on current span
     */
    recordException(error) {
        const span = trace.getActiveSpan();
        if (span) {
            span.recordException(error);
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error.message,
            });
        }
    }
    /**
     * Get current trace ID
     */
    getCurrentTraceId() {
        const span = trace.getActiveSpan();
        if (span) {
            const spanContext = span.spanContext();
            return spanContext.traceId;
        }
        return null;
    }
    /**
     * Wrap async function with tracing
     */
    async traceAsync(name, fn, options) {
        return this.startActiveSpan(name, async (span) => {
            try {
                const result = await fn();
                return result;
            }
            catch (error) {
                throw error;
            }
        }, options);
    }
    /**
     * Wrap sync function with tracing
     */
    trace(name, fn, options) {
        return this.startActiveSpan(name, fn, options);
    }
    /**
     * Create a child span of current span
     */
    createChildSpan(name, options) {
        const parentSpan = trace.getActiveSpan();
        const ctx = parentSpan ? trace.setSpan(context.active(), parentSpan) : context.active();
        return this.tracer.startSpan(name, {
            kind: options?.kind || SpanKind.CLIENT,
            attributes: options?.attributes,
        }, ctx);
    }
}
// Export singleton instance
export const tracingService = TracingService.getInstance();
// Export convenience functions
export const startSpan = (name, options) => tracingService.startSpan(name, options);
export const traceAsync = (name, fn, options) => tracingService.traceAsync(name, fn, options);
export const trace = (name, fn, options) => tracingService.trace(name, fn, options);
export const addEvent = (name, attributes) => tracingService.addEvent(name, attributes);
export const setAttribute = (key, value) => tracingService.setAttribute(key, value);
export const setAttributes = (attributes) => tracingService.setAttributes(attributes);
export const recordException = (error) => tracingService.recordException(error);
export const getCurrentTraceId = () => tracingService.getCurrentTraceId();
