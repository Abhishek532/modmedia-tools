const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const POSTHOG_EU_HOST = 'https://eu.i.posthog.com';

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
 * Keep PostHog's internal delivery fields plus the properties explicitly
 * approved for each event. Navigation context and unapproved custom fields
 * are removed before transmission.
 */
export function sanitizeAnalyticsProperties(eventName, properties = {}) {
  const sanitized = { $geoip_disable: true };
  for (const [key, value] of Object.entries(properties)) {
    const isPostHogInternal = key.startsWith('$');
    const isRequiredIdentity = key === 'distinct_id' || key === 'token';
    const exposesNavigationContext = /url|referr|host|pathname/i.test(key);
    if (
      value !== undefined &&
      (isPostHogInternal || isRequiredIdentity) &&
      !exposesNavigationContext
    ) {
      sanitized[key] = value;
    }
  }
  for (const key of EVENT_PROPERTY_ALLOWLIST[eventName] ?? []) {
    if (properties[key] !== undefined) sanitized[key] = properties[key];
  }
  return sanitized;
}
