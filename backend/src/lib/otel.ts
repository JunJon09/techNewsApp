import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

const sdk = new NodeSDK({
  instrumentations: [
    getNodeAutoInstrumentations({
      // ファイルシステムのトレースは不要なので無効化
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
})

sdk.start()
console.log('[otel] トレース初期化完了')
