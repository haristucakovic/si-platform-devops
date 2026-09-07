'use strict';

const { completeExpiredPractices } = require('../business/services/prakse.service');

const INTERVAL_MS = 24 * 60 * 60 * 1000;
const INITIAL_DELAY_MS = 60 * 1000;

async function runPracticeCompletionJob() {
  try {
    const result = await completeExpiredPractices();
    if (result.processed > 0) {
      console.log(`[practiceCompletion] Obaviješteno o završetku: ${result.processed} praksi`);
    }
  } catch (error) {
    console.error('[practiceCompletion] Greška:', error.message);
  }
}

function startPracticeCompletionJob() {
  setTimeout(() => {
    runPracticeCompletionJob();
    setInterval(runPracticeCompletionJob, INTERVAL_MS);
  }, INITIAL_DELAY_MS);
}

module.exports = { startPracticeCompletionJob, runPracticeCompletionJob };
