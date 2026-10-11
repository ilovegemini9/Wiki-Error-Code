/**
 * Automation is scheduled through the authenticated /api/cron/automation route.
 * Do not start a process-local interval here: Vercel serverless instances are
 * ephemeral and an interval can create duplicate, unreliable invocations.
 */
export async function register() {
  // Intentionally no background timer.
}
