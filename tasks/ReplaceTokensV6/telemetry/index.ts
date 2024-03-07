import { trace } from '@opentelemetry/api';
import { BasicTracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import * as crypto from 'crypto';
import { ApplicationInsightsExporter } from './exporter';

const url = 'https://westeurope-5.in.applicationinsights.azure.com/v2/track'
const instrumentationKey = 'e18a8793-c093-46f9-8c3b-433c9553eb7f';
const applicationName = 'replacetokens-task';
const version = '6.0.0';
const tracer = trace.getTracer(applicationName, version);

const provider = new BasicTracerProvider({
  forceFlushTimeoutMillis: 3000
});
trace.setGlobalTracerProvider(provider);

export function useApplicationInsightsExporter(proxy?: string) {
  provider.addSpanProcessor(new SimpleSpanProcessor(new ApplicationInsightsExporter({
    key: instrumentationKey,
    proxy: proxy,
    url: url,
    version: version
  })));
}

export function startSpan(name: string, account: string, pipeline: string, host: string) {
  return tracer.startSpan(name, {
    attributes: {
      'account': crypto.createHash('sha256').update(account || '').digest('hex'),
      'pipeline': crypto.createHash('sha256').update(pipeline || '').digest('hex'),
      'host': !host || host.toLowerCase() !== 'hosted' ? 'server' : 'cloud',
    }
  });
};