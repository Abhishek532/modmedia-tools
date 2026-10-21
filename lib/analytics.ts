import {
  analyticsCaptureOptions,
  sanitizeAnalyticsProperties,
  shouldEnableAnalytics,
  soundboardExportProperties,
  stickerExportProperties,
} from '@/lib/analytics-contract';

type SoundboardSourceType = 'mp3' | 'mp4';
type StickerOutputFormat = 'png' | 'jpg' | 'gif';

const projectKey = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '';
const analyticsHost = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? '').replace(
  /\/+$/,
  '',
);

let clientPromise: Promise<import('posthog-js').PostHog | null> | null = null;

function getAnalyticsClient() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (
    !shouldEnableAnalytics({
      nodeEnv: process.env.NODE_ENV,
      projectKey,
      host: analyticsHost,
      hostname: window.location.hostname,
    })
  )
    return Promise.resolve(null);

  if (!clientPromise) {
    clientPromise = import('posthog-js')
      .then(({ default: posthog }) =>
        posthog.init(projectKey, {
          api_host: analyticsHost,
          defaults: '2026-05-30',
          autocapture: false,
          capture_pageview: false,
          capture_pageleave: false,
          person_profiles: 'never',
          persistence: 'memory',
          disable_session_recording: true,
          disable_surveys: true,
          capture_heatmaps: false,
          capture_performance: false,
          capture_exceptions: false,
          advanced_disable_feature_flags: true,
          advanced_disable_feature_flags_on_first_load: true,
          disable_external_dependency_loading: true,
          save_campaign_params: false,
          save_referrer: false,
          respect_dnt: true,
          on_request_error: (response) => {
            console.warn(
              `[ModMedia analytics] Delivery failed with status ${response.statusCode}.`,
            );
          },
          before_send: (event) => {
            if (!event) return event;
            return {
              ...event,
              properties: sanitizeAnalyticsProperties(
                event.event,
                event.properties,
              ),
            };
          },
        }),
      )
      .catch(() => null);
  }

  return clientPromise;
}

function capture(
  eventName: string,
  properties: Record<string, string | number>,
) {
  void getAnalyticsClient()
    .then((client) => {
      client?.capture(
        eventName,
        properties,
        analyticsCaptureOptions(eventName),
      );
    })
    .catch(() => undefined);
}

export function trackPageView() {
  if (typeof window === 'undefined') return;
  capture('$pageview', { $pathname: window.location.pathname });
}

export function trackSoundboardExport(input: {
  sourceType: SoundboardSourceType;
  outputSizeBytes: number;
  outputDurationSeconds: number;
}) {
  capture('soundboard_mp3_created', soundboardExportProperties(input));
}

export function trackStickerExport(input: {
  outputFormat: StickerOutputFormat;
  outputSizeBytes: number;
}) {
  capture('sticker_created', stickerExportProperties(input));
}
