/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // Use node environment for utility functions
  roots: ['<rootDir>/src'], // Look for tests in the src directory
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ], // Standard Jest test file patterns
  transform: {
    '^.+\.(ts|tsx)?$': ['ts-jest', { /* ts-jest config options here */ }],
  },
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json)
    // Example: '@/(.*)': '<rootDir>/src/$1'
  },
  // Add any other Jest configuration options you need
}; 