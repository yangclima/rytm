const nextJest = require('next/jest');

const dotenv = require('dotenv');
dotenv.config({
  path: '.env.development',
});

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  dir: './src',
});

const config = {
  moduleDirectories: ['node_modules', '<rootDir>', 'src'],
  testTimeout: 60000,
};

module.exports = createJestConfig(config);
