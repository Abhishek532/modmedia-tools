'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

export function AnalyticsPageView() {
  useEffect(() => {
    trackPageView();
  }, []);

  return null;
}
