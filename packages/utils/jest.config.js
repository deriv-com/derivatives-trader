const baseConfigForPackages = require('../../jest.config.base');

module.exports = {
    ...baseConfigForPackages,
    moduleNameMapper: {
        ...baseConfigForPackages.moduleNameMapper,
    },
};
