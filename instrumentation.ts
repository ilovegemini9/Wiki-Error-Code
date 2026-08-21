export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const phase = process.env.NEXT_PHASE || '';
    if (phase.includes('build') || phase.includes('export') || phase === 'phase-production-build') {
      return;
    }
    const { initAutomationBackgroundServer } = await import('@/lib/automation-runner');
    initAutomationBackgroundServer();
  }
}

