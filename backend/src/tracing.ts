import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'

const apiKey = process.env.ARIZE_API_KEY
const spaceId = process.env.ARIZE_SPACE_ID

if (apiKey && spaceId) {
  const exporter = new OTLPTraceExporter({
    url: 'https://otlp.arize.com/v1/traces',
    headers: {
      'api_key': apiKey,
      'space_id': spaceId,
    },
  })

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({ 'service.name': 'aura-backend' }),
    traceExporter: exporter,
  })

  try {
    sdk.start()
    console.info('[Tracing] Arize OpenTelemetry initialized')
  } catch (err) {
    console.warn('[Tracing] Failed to initialize Arize tracing:', err)
  }
} else {
  console.info('[Tracing] ARIZE_API_KEY or ARIZE_SPACE_ID not set — tracing disabled')
}
