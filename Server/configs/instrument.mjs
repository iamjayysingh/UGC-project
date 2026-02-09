import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://a4ca791ed2ef38c0111aac6cb71dc24b@o4510759675035648.ingest.us.sentry.io/4510759685193728",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
