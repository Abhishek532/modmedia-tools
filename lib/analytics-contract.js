const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const POSTHOG_EU_HOST = 'https://eu.i.posthog.com';

const REQUIRED_POSTHOG_PROPERTIES = [
  '$token',
  'distinct_id',
  '$device_id',
  '$lib',
  '$lib_version',
  '$insert_id',
  '$process_person_profile',
];

const EVENT_PROPERTY_ALLOWLIST = {
  $pageview: ['$pathname'],
  soundboard_mp3_created: [
    'source_type',
    'output_size_bytes',
    'output_duration_seconds',
  ],
  sticker_created: ['output_format', 'output_size_bytes'],
};

/**
 * Analytics only runs in a configured production build on a public hostname.
 * This keeps previews, local development, and test runs out of production data.
 */
export function shouldEnableAnalytics({ nodeEnv, projectKey, host, hostname }) {
  if (
    nodeEnv !== 'production' ||
    !projectKey ||
    host !== POSTHOG_EU_HOST ||
    !hostname
  )
    return false;
  const normalizedHostname = hostname.toLowerCase();
  return (
    !LOCAL_HOSTNAMES.has(normalizedHostname) &&
    !normalizedHostname.endsWith('.local')
  );
}

export function soundboardExportProperties({
  sourceType,
  outputSizeBytes,
  outputDurationSeconds,
}) {
  return {
    source_type: sourceType,
    output_size_bytes: Math.max(0, Math.round(outputSizeBytes)),
    output_duration_seconds: Math.max(
      0,
      Number(outputDurationSeconds.toFixed(3)),
    ),
  };
}

export function stickerExportProperties({ outputFormat, outputSizeBytes }) {
  return {
    output_format: outputFormat,
    output_size_bytes: Math.max(0, Math.round(outputSizeBytes)),
  };
}

/**
 * Keep only PostHog's minimum delivery fields plus the properties explicitly
 * approved for each event. This removes automatic URL, referrer, campaign,
 * device, viewport, and session-entry enrichment before transmission.
 */
export function sanitizeAnalyticsProperties(eventName, properties = {}) {
  const sanitized = { $geoip_disable: true };
  for (const key of REQUIRED_POSTHOG_PROPERTIES) {
    if (properties[key] !== undefined) sanitized[key] = properties[key];
  }
  for (const key of EVENT_PROPERTY_ALLOWLIST[eventName] ?? []) {
    if (properties[key] !== undefined) sanitized[key] = properties[key];
  }
  return sanitized;
}
