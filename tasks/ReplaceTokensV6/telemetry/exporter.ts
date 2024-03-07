import { SpanStatusCode } from '@opentelemetry/api';
import { ExportResult, ExportResultCode, hrTimeToMilliseconds, hrTimeToNanoseconds } from '@opentelemetry/core';
import { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { HttpSender } from './sender';

export class ApplicationInsightsExporter implements SpanExporter {
  private readonly _key: string;
  private readonly _version: string;
  private readonly _sender: HttpSender;

  private _isShutdown = false;

  constructor(options: { url?: string, key: string, version: string, proxy?: string }) {
    this._key = options.key;
    this._version = options.version || '6.0.0';
    this._isShutdown = false;

    this._sender = new HttpSender({ url: options.url || 'https://dc.services.visualstudio.com/v2/track', proxy: options.proxy });
  }

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    if (this._isShutdown) {
      setTimeout(() => resultCallback({ code: ExportResultCode.FAILED }), 0);

      return;
    }

    if (spans.length > 0) {
      const events: any[] = [];
      for (const span of spans) {
        events.push({
          name: `Microsoft.ApplicationInsights.Dev.${this._key}.Event`,
          time: new Date(hrTimeToNanoseconds(span.startTime) / 1000000).toISOString(),
          iKey: this._key,
          tags: {
            'ai.application.ver': this._version,
            'ai.cloud.role': span.attributes['host'],
            'ai.internal.sdkVersion': 'replacetokens:2.0.0',
            'ai.operation.id': span.spanContext().traceId,
            'ai.operation.name': 'replacetokens',
            'ai.user.accountId': span.attributes['account'],
            'ai.user.authUserId': span.attributes['pipeline'],
          },
          data: {
            baseType: 'EventData',
            baseData: {
              ver: '2',
              name: 'tokens.replaced',
              properties: {
                ...span.attributes,
                result: (() => {
                  switch (span.status.code) {
                    case SpanStatusCode.ERROR: return 'failed';
                    case SpanStatusCode.OK: return 'success';
                    default: return '';
                  }
                })(),
                duration: hrTimeToMilliseconds(span.duration),
              }
            }
          }
        });
      }

      resultCallback(this._sender.send(events));

      for (const e of events) {
        e.name = '*****',
        e.iKey = '*****';
      }
      console.debug(`telemetry: ${JSON.stringify(events)}`);
    }

    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  shutdown(): Promise<void> {
    this._isShutdown = true;

    return Promise.resolve();
  }
}