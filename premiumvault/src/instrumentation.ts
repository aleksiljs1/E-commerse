export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runEmailRetry } = await import("@/lib/email/retry");

    // Run once shortly after boot, then every 5 minutes
    setTimeout(async () => {
      const result = await runEmailRetry().catch((err) => {
        console.error("[instrumentation] Email retry failed:", err);
        return null;
      });
      if (result && result.tried > 0) {
        console.log(`[instrumentation] Email retry: ${result.succeeded}/${result.tried} succeeded`);
      }
    }, 30_000);

    setInterval(async () => {
      const result = await runEmailRetry().catch((err) => {
        console.error("[instrumentation] Email retry failed:", err);
        return null;
      });
      if (result && result.tried > 0) {
        console.log(`[instrumentation] Email retry: ${result.succeeded}/${result.tried} succeeded`);
      }
    }, 5 * 60 * 1000);
  }
}
