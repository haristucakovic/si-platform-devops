'use strict';

jest.mock('../../src/business/services/prakse.service', () => ({
  completeExpiredPractices: jest.fn(),
}));

const prakseService = require('../../src/business/services/prakse.service');
const { runPracticeCompletionJob, startPracticeCompletionJob } = require('../../src/jobs/practiceCompletion.job');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

describe('runPracticeCompletionJob', () => {
  test('poziva completeExpiredPractices i logira broj obrađenih praksi', async () => {
    prakseService.completeExpiredPractices.mockResolvedValue({ processed: 2, errors: [] });

    await runPracticeCompletionJob();

    expect(prakseService.completeExpiredPractices).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('[practiceCompletion] Obaviješteno o završetku: 2 praksi');
  });

  test('ne logira kada nema novih završetaka', async () => {
    prakseService.completeExpiredPractices.mockResolvedValue({ processed: 0, errors: [] });

    await runPracticeCompletionJob();

    expect(console.log).not.toHaveBeenCalled();
  });

  test('hvata neočekivane greške bez rušenja procesa', async () => {
    prakseService.completeExpiredPractices.mockRejectedValue(new Error('DB nedostupna'));

    await runPracticeCompletionJob();

    expect(console.error).toHaveBeenCalledWith('[practiceCompletion] Greška:', 'DB nedostupna');
  });
});

describe('startPracticeCompletionJob', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('pokreće job nakon početnog kašnjenja i ponavlja na intervalu', async () => {
    prakseService.completeExpiredPractices.mockResolvedValue({ processed: 1, errors: [] });

    startPracticeCompletionJob();

    expect(prakseService.completeExpiredPractices).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(60 * 1000);
    expect(prakseService.completeExpiredPractices).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(24 * 60 * 60 * 1000);
    expect(prakseService.completeExpiredPractices).toHaveBeenCalledTimes(2);
  });
});
