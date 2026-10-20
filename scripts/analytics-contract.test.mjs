import assert from 'node:assert/strict';
import test from 'node:test';
import {
  shouldEnableAnalytics,
  soundboardExportProperties,
  stickerExportProperties,
} from '../lib/analytics-contract.js';

const productionConfig = {
  nodeEnv: 'production',
  projectKey: 'phc_test',
  host: 'https://eu.i.posthog.com',
  hostname: 'modmedia.example',
};

test('analytics is enabled only for configured public production hosts', () => {
  assert.equal(shouldEnableAnalytics(productionConfig), true);
  assert.equal(
    shouldEnableAnalytics({ ...productionConfig, nodeEnv: 'development' }),
    false,
  );
  assert.equal(
    shouldEnableAnalytics({ ...productionConfig, projectKey: '' }),
    false,
  );
  assert.equal(
    shouldEnableAnalytics({
      ...productionConfig,
      host: 'https://us.i.posthog.com',
    }),
    false,
  );
  assert.equal(
    shouldEnableAnalytics({ ...productionConfig, hostname: 'localhost' }),
    false,
  );
  assert.equal(
    shouldEnableAnalytics({ ...productionConfig, hostname: '127.0.0.1' }),
    false,
  );
  assert.equal(
    shouldEnableAnalytics({ ...productionConfig, hostname: 'preview.local' }),
    false,
  );
});

test('soundboard success properties contain only the approved aggregates', () => {
  assert.deepEqual(
    soundboardExportProperties({
      sourceType: 'mp4',
      outputSizeBytes: 2048.4,
      outputDurationSeconds: 2.34567,
    }),
    {
      source_type: 'mp4',
      output_size_bytes: 2048,
      output_duration_seconds: 2.346,
    },
  );
});

test('sticker success properties contain only format and aggregate output size', () => {
  assert.deepEqual(
    stickerExportProperties({ outputFormat: 'gif', outputSizeBytes: 8192.6 }),
    {
      output_format: 'gif',
      output_size_bytes: 8193,
    },
  );
});
