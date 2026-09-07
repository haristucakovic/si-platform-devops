const app = require('./app');
const { sequelize, PrijavaNaPraksu } = require('./infrastructure/database/models');
const {
  backfillApplicationStatuses,
  backfillStudentStatuses,
} = require('./business/services/applicationStatus.service');
const { backfillAcceptedPractices } = require('./business/services/prakse.service');
const { startPracticeCompletionJob } = require('./jobs/practiceCompletion.job');

const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: true })
  .then(async () => {
    await backfillApplicationStatuses(PrijavaNaPraksu);
    await backfillStudentStatuses(PrijavaNaPraksu);
    await backfillAcceptedPractices();
    startPracticeCompletionJob();
    console.log('Baza spojena');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => console.error('Greska:', err));
