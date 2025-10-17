# Derivatives Trader

> A modern platform for derivatives trading with a modular, component-based architecture.

![Prerequisite](https://img.shields.io/badge/node-20.x-blue.svg)
![Prerequisite](https://img.shields.io/badge/npm-9.x-blue.svg)

## Table of Contents

- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
- [Repository Structure](#repository-structure)
    - [Packages](#packages)
- [Development Workflow](#development-workflow)
    - [Package Names and Structure](#package-names-and-structure)
    - [Starting Development Servers](#starting-development-servers)
    - [Common Development Tasks](#common-development-tasks)
- [Building and Testing](#building-and-testing)
- [Deployment](#deployment)
    - [Test Deployments](#test-deployments)
    - [Release Process](#release-process)
- [Troubleshooting](#troubleshooting)
- [Additional Documentation](#additional-documentation)

## Getting Started

### Prerequisites

Before working with this repository, ensure you have the following installed:

- **Node.js 20.x**
- **npm 9.x**
- **git** (for contribution)

### Installation

1. **Fork the project**

    Fork the project to your own GitHub account to work on your own version.

2. **Clone the repository**

    ```sh
    git clone git@github.com:deriv-com/derivatives-trader.git
    cd derivatives-trader
    ```

3. **Install dependencies**

    ```sh
    npm run bootstrap
    ```

4. **Build all packages**

    ```sh
    npm run build:all
    ```

## Repository Structure

This project uses a monorepo structure managed with npm workspaces. All individual packages are located in the `packages/` directory.

### Packages

| Package      | Description                     | Documentation                                                                                                            |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Api`        | API client for backend services | [![Docs](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](../packages/api/README.md)        |
| `Api-v2`     | Next generation API client      | [![Docs](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](../packages/api-v2/README.md)     |
| `Components` | Shared UI component library     | [![Docs](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](../packages/components/README.md) |
| `Core`       | Core application framework      | [![Docs](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](../packages/core/README.md)       |
| `Reports`    | Transaction and trading reports | [![Docs](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](../packages/reports/README.md)    |
| `Shared`     | Shared utilities and helpers    | [![Docs](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](../packages/shared/README.md)     |
| `Stores`     | State management stores         | [![Docs](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](../packages/stores/README.md)     |
| `Trader`     | Trading platform interface      | [![Docs](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](../packages/trader/README.md)     |
| `Utils`      | Utility functions               | [![Docs](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](../packages/utils/README.md)      |

## Development Workflow

### Package Names and Structure

Each package follows a consistent naming convention with the `@deriv/` prefix. For example, the Components package is named `@deriv/components`.

When using scripts from the root directory, you don't need to include the `@deriv/` prefix:

```sh
# This works:
npm run serve components

# Instead of:
npm run serve @deriv/components
```

### Starting Development Servers

The Core package must be running to develop any other package:

**Option 1:** Working on Core only

```sh
npm run serve core
```

**Option 2:** Working on other packages

```sh
# Terminal 1 - Start the package you're working on
npm run serve trader

# Terminal 2 - Start the core
npm run serve core
```

**Note:** The serve command runs the specified package's development server.

### Common Development Tasks

**Cleaning node_modules:**

```sh
npm run clean
```

**Clearing npm cache:**

```sh
npm cache clean -f
```

**Regenerating package-lock.json:**

```sh
npm run bootstrap:dev
```

## Building and Testing

Available scripts from the root directory:

| Command           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `serve <pkg>`     | Builds and starts the dev server for a package |
| `build:all`       | Builds all packages                            |
| `test`            | Runs eslint, stylelint and jest tests          |
| `test:jest`       | Runs only jest tests                           |
| `test:eslint-all` | Runs eslint tests for all packages             |
| `test:stylelint`  | Runs stylelint tests                           |

Examples:

```sh
# Start development server for a package
npm run serve trader

# Build all packages
npm run build:all

# Run all tests
npm run test
```

## Deployment

#### Preview Deployment

When creating a PR, Cloudflare automatically generates a preview link.

### Release Process

There are two types of releases:

1. **Staging Release**

    Staging releases happen automatically when a PR is merged to the master branch.

2. **Production Release**

    ```sh
    git tag production_v20230723 -m 'release production'
    git push origin production_v20230723
    ```

## Troubleshooting

### Common Issues

1. **Installing packages**

    ```sh
    # In package directory:
    cd packages/trader
    npm i package-name

    # Or with npm workspaces:
    npm i package-name --workspace=@deriv/trader
    ```

2. **Uninstalling packages**

    ```sh
    npm uninstall package-name --workspace=@deriv/translations
    ```

3. **Using package-lock.json**

    ```sh
    # Option 1:
    npm ci --workspace=@deriv/trader

    # Option 2:
    cd packages/trader && npm ci
    ```

4. **Sass compilation issues**

    ```sh
    # Try these in order:
    npm cache clean --force
    npm run clean
    npm run bootstrap
    npm run build:all
    ```

## Additional Documentation

- [Stylesheet Guidelines](../docs/Stylesheet/README.md) - CSS/SASS code style
- [JavaScript Guidelines](../docs/JavaScript/README.md) - JS/JSX code style
- [Git Workflow](../docs/git/README.md) - Git practices and processes
- Test PR
