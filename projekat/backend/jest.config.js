'use strict';

module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  coverageReporters: ['html', 'text-summary'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/infrastructure/database/models/index.js',
  ],
};
