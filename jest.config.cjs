const nextJest = require('next/jest');

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  dir: './',
});

const config = {
  moduleDirectories: ['node_modules', '<rootDir>'],
  testTimeout: 60000,
};

module.exports = createJestConfig(config);
