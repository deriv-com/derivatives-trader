/** This config file is for packages in monorepo
    Universal configurations should go here
 */

module.exports = {
    testEnvironment: 'jsdom',
    testRegex: '(/__tests__/.*|(\\.)(test|spec))\\.(js|jsx|tsx|ts)?$',
    // This is needed to transform es modules imported from node_modules of the target component.
    transformIgnorePatterns: [
        '/node_modules/(?!(@enykeev/react-virtualized|@simplewebauthn/browser|@deriv-com/ui|@deriv-com/quill-ui|@deriv-com/auth-client|@deriv-com/translations)).+\\.js$',
    ],
    setupFilesAfterEnv: ['<rootDir>/../../setupTests.js'],
    moduleNameMapper: {
        // Use simple mock for CSS/SCSS imports instead of identity-obj-proxy
        '\\.(css|less|scss|sass)$': '<rootDir>/../../__mocks__/styleMock.js',
        '\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/../../__mocks__/fileMock.js',
        '@deriv-com/translations': '<rootDir>/../../__mocks__/translation.mock.js',
    },
};
