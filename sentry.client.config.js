import * as Sentry from '@sentry/astro'

Sentry.init({
  dsn: 'https://808302b867d64cbaef4c0b922bdfc82e@o4509835901272064.ingest.us.sentry.io/4509846527148032',
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/astro/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Session Replay
  replaysSessionSampleRate: 1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0,
})
