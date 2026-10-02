const { sequelize, PrijavaNaPraksu } = require('./infrastructure/database/models');
const {
  backfillApplicationStatuses,
  backfillStudentStatuses,
} = require('./business/services/applicationStatus.service');
const { backfillAcceptedPractices } = require('./business/services/prakse.service');
const { startPracticeCompletionJob } = require('./jobs/practiceCompletion.job');

const syncOptions =
  process.env.DB_SYNC_ALTER === 'true'
    ? { alter: true }
    : {};

sequelize
  .sync(syncOptions)
  .then(async () => {
    await backfillApplicationStatuses(PrijavaNaPraksu);
    await backfillStudentStatuses(PrijavaNaPraksu);
    await backfillAcceptedPractices();

    startPracticeCompletionJob();

    console.log('Background worker started.');
  })
  .catch((err) => {
    console.error('Worker startup error:', err);
    process.exit(1);
  });
