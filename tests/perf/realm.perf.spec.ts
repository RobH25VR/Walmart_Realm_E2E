import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { PerfMetrics } from './types';

function parseTargetUrls(): string[] {
  const raw = process.env.PERF_TARGET_URL || 'https://walmartrealm.com/';
  // Remove any leading/trailing quotes just in case CI adds them
  return raw.split(',').map(u => u.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
}

async function waitForRealmCanvas(page) {
  const iframeLocator = page.locator('iframe[title="Experience"]');
  await iframeLocator.first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(500); // warm-up
}

test('Walmart Realm performance snapshot', async ({ page }) => {
  test.setTimeout(120_000); // increase timeout for slow CI

  const urls = parseTargetUrls();
  const apiCalls: PerfMetrics['apiCalls'] = [];
  const failedRequests: PerfMetrics['failedRequests'] = [];

  page.on('response', response => {
    const status = response.status();
    if (response.url().includes('/api/')) {
      const timing = response.request().timing();
      apiCalls.push({
        url: response.url(),
        responseTime: timing.responseEnd - timing.requestStart,
      });
    }
    if (status >= 400) {
      failedRequests.push({
        url: response.url(),
        method: response.request().method(),
        status,
        resourceType: response.request().resourceType(),
      });
    }
  });

  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText,
      resourceType: request.resourceType(),
    });
  });

  const runId = Date.now();
  const outputDir = path.resolve('perf-results');
  fs.mkdirSync(outputDir, { recursive: true });

  for (let i = 0; i < urls.length; i++) {
    const targetUrl = urls[i];
    apiCalls.length = 0;
    failedRequests.length = 0;

    await page.goto('about:blank');
    await page.goto(targetUrl);

    // Navigation timing
    const nav = await page.evaluate(() => {
      const [n] =
        performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return {
        domContentLoaded: n?.domContentLoadedEventEnd ?? 0,
        loadEvent: n?.loadEventEnd ?? 0,
      };
    });

    // Realm-specific FPS
    await waitForRealmCanvas(page);

    const iframeHandle = await page.locator('iframe[title="Experience"]').elementHandle();
    if (!iframeHandle) throw new Error('Experience iframe not found');

    const frame = await iframeHandle.contentFrame();
    if (!frame) throw new Error('Unable to resolve Experience iframe frame');

    const fps = await frame.evaluate((duration) => {
      return new Promise(resolve => {
        const frameTimes: number[] = [];
        let last = performance.now();
        const start = last;
        let resolved = false;

        function tick(now: number) {
          frameTimes.push(now - last);
          last = now;

          if (now - start < duration) {
            requestAnimationFrame(tick);
          } else if (!resolved) {
            resolved = true;
            const fpsValues = frameTimes.filter(t => t > 0).map(t => 1000 / t);
            const avgFps = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length || 0;
            resolve({
              avgFps: Math.round(avgFps),
              minFps: Math.round(Math.min(...fpsValues, avgFps || 0)),
              fpsSampleDurationMs: duration,
            });
          }
        }

        // Safety fallback
        setTimeout(() => {
          if (!resolved) resolve({ avgFps: 0, minFps: 0, fpsSampleDurationMs: duration });
        }, duration + 2000);

        requestAnimationFrame(tick);
      });
    }, 3000);

    const perf: PerfMetrics = {
      url: page.url(),
      timestamp: new Date().toISOString(),
      domContentLoaded: nav.domContentLoaded,
      loadEvent: nav.loadEvent,
      avgFps: (fps as any)?.avgFps ?? 0,
      minFps: (fps as any)?.minFps ?? 0,
      fpsSampleDurationMs: (fps as any)?.fpsSampleDurationMs ?? 0,
      apiCalls: [...apiCalls],
      failedRequests: [...failedRequests],
    };

    fs.writeFileSync(
      path.join(outputDir, `realm-perf-${runId}-${i}.json`),
      JSON.stringify(perf, null, 2)
    );
  }
});
