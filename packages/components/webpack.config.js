const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = function () {
    return {
        entry: {
            components: path.resolve(__dirname, 'src', 'index.ts'),
        },
        output: {
            path: path.resolve(__dirname, 'lib'),
            filename: '[name].js',
            libraryExport: 'default',
            library: '@deriv/component',
            libraryTarget: 'umd',
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                        },
                    },
                },
                {
                    test: /\.(scss|css)$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'resolve-url-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'sass-resources-loader',
                            options: {
                                resources: require('@deriv/shared/src/styles/index.js'),
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    type: 'asset/resource',
                },
            ],
        },
        resolve: {
            alias: {
                'react/jsx-runtime': 'react/jsx-runtime.js',
                Components: path.resolve(__dirname, 'src', 'components'),
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        optimization: {
            minimize: true,
        },
        devServer: {
            static: {
                publicPath: '/dist/',
            },
        },
        plugins: [
            ...(process.env.ANALYZE_BUNDLE
                ? [
                      new BundleAnalyzerPlugin({
                          analyzerMode: 'static',
                          reportFilename: path.resolve(__dirname, 'bundle-report.html'),
                          openAnalyzer: false,
                          generateStatsFile: true,
                          statsFilename: path.resolve(__dirname, 'bundle-stats.json'),
                      }),
                  ]
                : []),
        ],
        externals: [
            {
                formik: 'formik',
                classnames: 'classnames',
                'react-div-100vh': 'react-div-100vh',
                'framer-motion': 'framer-motion',
                'prop-types': 'prop-types',
                'react-transition-group': 'react-transition-group',
                react: 'react',
                'react/jsx-runtime': 'react/jsx-runtime',
                'react-content-loader': 'react-content-loader',
                'react-dom': 'react-dom',
                'react-dropzone': 'react-dropzone',
                '@deriv/shared': '@deriv/shared',
                '@deriv-com/translations': '@deriv-com/translations',
                '@deriv-com/ui': '@deriv-com/ui',
                '@deriv/utils': '@deriv/utils',
                'react-router-dom': 'react-router-dom',
                'react-swipeable': 'react-swipeable',
                'react-tiny-popover': 'react-tiny-popover',
                'lodash.debounce': 'lodash.debounce',
                'lodash.throttle': 'lodash.throttle',
            },
            /^@deriv\/shared\/.+$/,
            /^@deriv-com\/translations\/.+$/,
            /^@deriv-com\/ui\/.+$/,
        ],
    };
};
