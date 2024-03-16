module.exports = {
    collectCoverage: true,
    coverageDirectory: 'coverage_jest',
    collectCoverageFrom: ['js/**.{cjs,js,mjs}','js/classes/**.{cjs,js,mjs}','src/**.{cjs,js,mjs}','./main.{cjs,js,mjs}'],
    projects: [
        {
            displayName: '    MAIN',
            runner: '@jest-runner/electron/main',
            testEnvironment: 'node',
            testMatch: ['**/__tests__/**main**/*.js', '!**/{date-aux,import-export,time-math,validate-json}.js']
        },
        {
            displayName: 'RENDERER',
            runner: '@jest-runner/electron',
            testEnvironment: '@jest-runner/electron/environment',
            testMatch: ['**/__tests__/**renderer**/*.js', '**/__tests__/**renderer**/classes/*.js', '!**/{notification-channel,themes,workday-waiver-aux}.js']
        }
    ]
};
