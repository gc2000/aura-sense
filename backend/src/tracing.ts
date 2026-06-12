import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'

const apiKey = process.env.PHOENIX_API_KEY
const collectorEndpoint = process.env.PHOENIX_COLLECTOR_ENDPOINT ?? 'https://app.phoenix.arize.com'

if (apiKey) {
  const exporter = new OTLPTraceExporter({
    url: `${collectorEndpoint}/v1/traces`,
    headers: {
      'api_key': apiKey,
    },
  })

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({ 'service.name': 'aura-backend' }),
    traceExporter: exporter,
  })

  try {
    sdk.start()
    console.info('[Tracing] Arize Phoenix OpenTelemetry initialized')
  } catch (err) {
    console.warn('[Tracing] Failed to initialize Phoenix tracing:', err)
  }
} else {
  console.info('[Tracing] PHOENIX_API_KEY not set — tracing disabled')
}
