const baseConfigForPackages = require('../../jest.config.base');

module.exports = {
    ...baseConfigForPackages,
    moduleNameMapper: {
        ...baseConfigForPackages.moduleNameMapper,
        '^@deriv-com/auth-client$': '<rootDir>/../../__mocks__/auth-client.mock.js',
    },
};
