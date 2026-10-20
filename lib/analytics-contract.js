const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const POSTHOG_EU_HOST = 'https://eu.i.posthog.com';

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
