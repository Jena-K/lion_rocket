import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api'
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { ZoneContextManager } from '@opentelemetry/context-zone'
import type { Span } from '@opentelemetry/api'

/**
 * Distributed tracing service for frontend
 */
export class TracingService {
  private static instance: TracingService
  private tracer: any
  private provider: WebTracerProvider | null = null

  private constructor() {}

  static getInstance(): TracingService {
    if (!TracingService.instance) {
      TracingService.instance = new TracingService()
    }
    return TracingService.instance
  }

  /**
   * Initialize OpenTelemetry tracing
   */
  initialize(
    config: {
      serviceName?: string
      serviceVersion?: string
      environment?: string
      jaegerEndpoint?: string
    } = {}
  ) {
    // Create resource
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName || 'lionrocket-frontend',
      [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment || 'development',
      'browser.user_agent': navigator.userAgent,
      'browser.language': navigator.language,
    })

    // Create provider
    this.provider = new WebTracerProvider({
      resource,
    })

    // Configure exporter
    const exporter = new OTLPTraceExporter({
      url: config.jaegerEndpoint || 'http://localhost:14268/api/traces',
      headers: {},
    })

    // Add span processor
    this.provider.addSpanProcessor(new SimpleSpanProcessor(exporter))

    // Register provider
    this.provider.register({
      contextManager: new ZoneContextManager(),
    })

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
            span.setAttribute('http.request_id', request.headers.get('X-Request-ID') || 'unknown')
            if (response) {
              span.setAttribute('http.response_size', response.headers.get('content-length') || '0')
            }
          },
        }),
        new XMLHttpRequestInstrumentation({
          propagateTraceHeaderCorsUrls: [
            /.+/g, // Propagate to all URLs
          ],
        }),
      ],
    })

    // Get tracer
    this.tracer = trace.getTracer(
      config.serviceName || 'lionrocket-frontend',
      config.serviceVersion || '1.0.0'
    )
  }

  /**
   * Start a new span
   */
  startSpan(
    name: string,
    options?: {
      kind?: SpanKind
      attributes?: Record<string, any>
    }
  ): Span {
    return this.tracer.startSpan(name, {
      kind: options?.kind || SpanKind.CLIENT,
      attributes: options?.attributes,
    })
  }

  /**
   * Start an active span (automatically becomes current)
   */
  startActiveSpan<T>(
    name: string,
    fn: (span: Span) => T,
    options?: {
      kind?: SpanKind
      attributes?: Record<string, any>
    }
  ): T {
    return this.tracer.startActiveSpan(
      name,
      {
        kind: options?.kind || SpanKind.CLIENT,
        attributes: options?.attributes,
      },
      (span: Span) => {
        try {
          const result = fn(span)
          span.setStatus({ code: SpanStatusCode.OK })
          return result
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
          })
          span.recordException(error as Error)
          throw error
        } finally {
          span.end()
        }
      }
    )
  }

  /**
   * Add event to current span
   */
  addEvent(name: string, attributes?: Record<string, any>) {
    const span = trace.getActiveSpan()
    if (span) {
      span.addEvent(name, attributes)
    }
  }

  /**
   * Set attribute on current span
   */
  setAttribute(key: string, value: any) {
    const span = trace.getActiveSpan()
    if (span) {
      span.setAttribute(key, value)
    }
  }

  /**
   * Set multiple attributes on current span
   */
  setAttributes(attributes: Record<string, any>) {
    const span = trace.getActiveSpan()
    if (span) {
      span.setAttributes(attributes)
    }
  }

  /**
   * Record an exception on current span
   */
  recordException(error: Error) {
    const span = trace.getActiveSpan()
    if (span) {
      span.recordException(error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      })
    }
  }

  /**
   * Get current trace ID
   */
  getCurrentTraceId(): string | null {
    const span = trace.getActiveSpan()
    if (span) {
      const spanContext = span.spanContext()
      return spanContext.traceId
    }
    return null
  }

  /**
   * Wrap async function with tracing
   */
  async traceAsync<T>(
    name: string,
    fn: () => Promise<T>,
    options?: {
      kind?: SpanKind
      attributes?: Record<string, any>
    }
  ): Promise<T> {
    return this.startActiveSpan(
      name,
      async (span) => {
        try {
          const result = await fn()
          return result
        } catch (error) {
          throw error
        }
      },
      options
    )
  }

  /**
   * Wrap sync function with tracing
   */
  trace<T>(
    name: string,
    fn: () => T,
    options?: {
      kind?: SpanKind
      attributes?: Record<string, any>
    }
  ): T {
    return this.startActiveSpan(name, fn, options)
  }

  /**
   * Create a child span of current span
   */
  createChildSpan(
    name: string,
    options?: {
      kind?: SpanKind
      attributes?: Record<string, any>
    }
  ): Span {
    const parentSpan = trace.getActiveSpan()
    const ctx = parentSpan ? trace.setSpan(context.active(), parentSpan) : context.active()

    return this.tracer.startSpan(
      name,
      {
        kind: options?.kind || SpanKind.CLIENT,
        attributes: options?.attributes,
      },
      ctx
    )
  }
}

// Export singleton instance
export const tracingService = TracingService.getInstance()

// Export convenience functions
export const startSpan = (name: string, options?: any) => tracingService.startSpan(name, options)
export const traceAsync = <T>(name: string, fn: () => Promise<T>, options?: any) =>
  tracingService.traceAsync(name, fn, options)
export const trace = <T>(name: string, fn: () => T, options?: any) =>
  tracingService.trace(name, fn, options)
export const addEvent = (name: string, attributes?: Record<string, any>) =>
  tracingService.addEvent(name, attributes)
export const setAttribute = (key: string, value: any) => tracingService.setAttribute(key, value)
export const setAttributes = (attributes: Record<string, any>) =>
  tracingService.setAttributes(attributes)
export const recordException = (error: Error) => tracingService.recordException(error)
export const getCurrentTraceId = () => tracingService.getCurrentTraceId()
