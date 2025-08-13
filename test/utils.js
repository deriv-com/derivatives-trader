/* eslint-disable */

/**
 * Deep clone an object or array using JSON methods
 * Works for objects without functions, dates, or undefined values
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));

    return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function to limit how often a function can be called
 * Useful for API calls, search inputs, and resize events
 */
function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle function to limit function execution to once per interval
 * Ensures function runs at most once per specified time period
 */
function throttle(func, interval) {
    let lastCallTime = 0;

    return function (...args) {
        const now = Date.now();

        if (now - lastCallTime >= interval) {
            lastCallTime = now;
            return func.apply(this, args);
        }
    };
}

/**
 * Generate a random string with specified length and character set
 * Supports alphanumeric, alphabetic, numeric, and custom character sets
 */
function generateRandomString(length = 8, charset = 'alphanumeric') {
    const charsets = {
        alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        alphabetic: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        numeric: '0123456789',
        hex: '0123456789ABCDEF',
        base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    };

    const chars = typeof charset === 'string' && charsets[charset] ? charsets[charset] : charset;
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

/**
 * Format bytes into human-readable file sizes
 * Converts bytes to appropriate units (B, KB, MB, GB, TB)
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Validate email address using comprehensive regex
 * Supports most common email formats and domains
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;

    const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL with optional protocol checking
 * Supports HTTP, HTTPS, FTP, and custom protocols
 */
function isValidURL(url, allowedProtocols = ['http', 'https']) {
    if (!url || typeof url !== 'string') return false;

    try {
        const urlObj = new URL(url);
        return allowedProtocols.includes(urlObj.protocol.slice(0, -1));
    } catch {
        return false;
    }
}

/**
 * Convert string to various case formats
 * Supports camelCase, PascalCase, snake_case, kebab-case, and more
 */
function convertCase(str, targetCase) {
    if (!str || typeof str !== 'string') return '';

    // Clean and split the string
    const words = str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(word => word.toLowerCase());

    switch (targetCase) {
        case 'camel':
        case 'camelCase':
            return (
                words[0] +
                words
                    .slice(1)
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join('')
            );

        case 'pascal':
        case 'PascalCase':
            return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');

        case 'snake':
        case 'snake_case':
            return words.join('_');

        case 'kebab':
        case 'kebab-case':
            return words.join('-');

        case 'constant':
        case 'CONSTANT_CASE':
            return words.join('_').toUpperCase();

        case 'title':
        case 'Title Case':
            return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        default:
            return words.join(' ');
    }
}

/**
 * Get nested object property safely without throwing errors
 * Supports dot notation and array access
 */
function getNestedProperty(obj, path, defaultValue = undefined) {
    if (!obj || typeof path !== 'string') return defaultValue;

    const keys = path.split('.').filter(key => key.length > 0);
    let current = obj;

    for (const key of keys) {
        if (current === null || current === undefined || !(key in current)) {
            return defaultValue;
        }
        current = current[key];
    }

    return current;
}

/**
 * Set nested object property safely, creating intermediate objects if needed
 * Supports dot notation for deep property assignment
 */
function setNestedProperty(obj, path, value) {
    if (!obj || typeof path !== 'string') return obj;

    const keys = path.split('.').filter(key => key.length > 0);
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
            current[key] = {};
        }

        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return obj;
}

/**
 * Remove duplicates from array with optional key selector
 * Supports primitive arrays and object arrays with custom comparison
 */
function removeDuplicates(array, keySelector = null) {
    if (!Array.isArray(array)) return [];

    if (keySelector && typeof keySelector === 'function') {
        const seen = new Set();
        return array.filter(item => {
            const key = keySelector(item);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    return [...new Set(array)];
}

/**
 * Group array elements by a key or function
 * Returns object with grouped elements
 */
function groupBy(array, keyOrFunction) {
    if (!Array.isArray(array)) return {};

    const getKey = typeof keyOrFunction === 'function' ? keyOrFunction : item => getNestedProperty(item, keyOrFunction);

    return array.reduce((groups, item) => {
        const key = getKey(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

/**
 * Create a range of numbers with optional step
 * Similar to Python's range function
 */
function range(start, end = null, step = 1) {
    if (end === null) {
        end = start;
        start = 0;
    }

    const result = [];

    if (step > 0) {
        for (let i = start; i < end; i += step) {
            result.push(i);
        }
    } else if (step < 0) {
        for (let i = start; i > end; i += step) {
            result.push(i);
        }
    }

    return result;
}

/**
 * Chunk array into smaller arrays of specified size
 * Useful for pagination and batch processing
 */
function chunkArray(array, size) {
    if (!Array.isArray(array) || size <= 0) return [];

    const chunks = [];

    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }

    return chunks;
}

/**
 * Flatten nested arrays to specified depth
 * Supports infinite depth flattening
 */
function flattenArray(array, depth = Infinity) {
    if (!Array.isArray(array)) return [];

    if (depth === 0) return array.slice();

    return array.reduce((acc, item) => {
        if (Array.isArray(item)) {
            acc.push(...flattenArray(item, depth - 1));
        } else {
            acc.push(item);
        }
        return acc;
    }, []);
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * Comprehensive emptiness checking for various data types
 */
function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    if (typeof value === 'number') return isNaN(value);

    return false;
}

/**
 * Sleep/delay function using Promises
 * Useful for adding delays in async functions
 */
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Retry async function with exponential backoff
 * Handles temporary failures with configurable retry logic
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === maxRetries) {
                throw lastError;
            }

            const delay = baseDelay * Math.pow(2, attempt);
            await sleep(delay);
        }
    }
}

/**
 * Format numbers with thousands separators and decimal places
 * Supports different locales and currency formatting
 */
function formatNumber(number, options = {}) {
    const {
        decimals = 2,
        thousandsSeparator = ',',
        decimalSeparator = '.',
        prefix = '',
        suffix = '',
        locale = 'en-US',
    } = options;

    if (typeof number !== 'number' || isNaN(number)) return '0';

    try {
        const formatted = new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(number);

        return prefix + formatted + suffix;
    } catch {
        // Fallback for unsupported locales
        const fixed = number.toFixed(decimals);
        const parts = fixed.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

        return prefix + parts.join(decimalSeparator) + suffix;
    }
}

/**
 * Parse and validate JSON safely without throwing errors
 * Returns parsed object or default value on error
 */
function safeJsonParse(jsonString, defaultValue = null) {
    try {
        return JSON.parse(jsonString);
    } catch {
        return defaultValue;
    }
}

/**
 * Create a memoization wrapper for expensive function calls
 * Caches results to improve performance for repeated calls
 */
function memoize(fn, keyGenerator = (...args) => JSON.stringify(args)) {
    const cache = new Map();

    return function (...args) {
        const key = keyGenerator(...args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn.apply(this, args);
        cache.set(key, result);

        return result;
    };
}

/**
 * Calculate percentage with optional precision and formatting
 * Handles edge cases and provides readable percentage strings
 */
function calculatePercentage(value, total, precision = 2, includeSymbol = true) {
    if (total === 0 || typeof value !== 'number' || typeof total !== 'number') {
        return includeSymbol ? '0%' : 0;
    }

    const percentage = (value / total) * 100;
    const formatted = parseFloat(percentage.toFixed(precision));

    return includeSymbol ? `${formatted}%` : formatted;
}

/**
 * Export all utility functions
 * Comprehensive collection of JavaScript utility functions
 */
module.exports = {
    // Object and data manipulation
    deepClone,
    getNestedProperty,
    setNestedProperty,
    safeJsonParse,
    isEmpty,

    // Array utilities
    removeDuplicates,
    groupBy,
    range,
    chunkArray,
    flattenArray,

    // String utilities
    generateRandomString,
    convertCase,

    // Validation
    isValidEmail,
    isValidURL,

    // Formatting
    formatBytes,
    formatNumber,
    calculatePercentage,

    // Function utilities
    debounce,
    throttle,
    memoize,

    // Async utilities
    sleep,
    retryWithBackoff,
};

/**
 * Comprehensive testing and example usage
 * Demonstrates all utility functions with practical examples
 */
function runUtilityExamples() {
    console.log('🛠️ Comprehensive Utility Library Examples');
    console.log('==========================================\n');

    // Object manipulation examples
    console.log('📦 Object Manipulation:');
    const testObj = { user: { profile: { name: 'John', age: 30 } } };
    console.log('Original object:', JSON.stringify(testObj));
    console.log('Nested property (user.profile.name):', getNestedProperty(testObj, 'user.profile.name'));

    const cloned = deepClone(testObj);
    setNestedProperty(cloned, 'user.profile.email', 'john@example.com');
    console.log('After adding email:', JSON.stringify(cloned));

    // Array utilities examples
    console.log('\n📋 Array Utilities:');
    const numbers = [1, 2, 2, 3, 4, 4, 5];
    console.log('Original array:', numbers);
    console.log('Remove duplicates:', removeDuplicates(numbers));
    console.log('Range 0-10:', range(10));
    console.log('Chunk into groups of 3:', chunkArray(numbers, 3));

    const users = [
        { name: 'Alice', department: 'Engineering' },
        { name: 'Bob', department: 'Sales' },
        { name: 'Charlie', department: 'Engineering' },
    ];
    console.log('Group by department:', groupBy(users, 'department'));

    // String utilities examples
    console.log('\n🔤 String Utilities:');
    const testString = 'hello_world-example';
    console.log('Original string:', testString);
    console.log('camelCase:', convertCase(testString, 'camel'));
    console.log('PascalCase:', convertCase(testString, 'pascal'));
    console.log('kebab-case:', convertCase(testString, 'kebab'));
    console.log('Random string (8 chars):', generateRandomString(8));

    // Validation examples
    console.log('\n✅ Validation:');
    const emails = ['test@example.com', 'invalid-email', 'user@domain.co.uk'];
    emails.forEach(email => {
        console.log(`${email}: ${isValidEmail(email) ? 'Valid' : 'Invalid'} email`);
    });

    const urls = ['https://example.com', 'ftp://files.example.com', 'invalid-url'];
    urls.forEach(url => {
        console.log(`${url}: ${isValidURL(url) ? 'Valid' : 'Invalid'} URL`);
    });

    // Formatting examples
    console.log('\n🎨 Formatting:');
    const bytes = [1024, 1048576, 1073741824];
    bytes.forEach(b => {
        console.log(`${b} bytes = ${formatBytes(b)}`);
    });

    const amounts = [1234.567, 9876543.21, 0.123];
    amounts.forEach(amount => {
        console.log(`${amount} formatted: ${formatNumber(amount, { decimals: 2, prefix: '$' })}`);
    });

    console.log('Percentage calculations:');
    console.log(`25 out of 100: ${calculatePercentage(25, 100)}`);
    console.log(`3 out of 7: ${calculatePercentage(3, 7, 1)}`);

    // Function utilities examples
    console.log('\n⚡ Function Utilities:');

    // Memoization example
    const expensiveFunction = memoize(n => {
        console.log(`Computing for ${n}...`);
        return n * n;
    });

    console.log('Memoized function calls:');
    console.log('First call f(5):', expensiveFunction(5));
    console.log('Second call f(5):', expensiveFunction(5)); // Should use cache

    // Empty value checking
    console.log('\n🕳️ Empty Value Checking:');
    const values = ['', null, undefined, [], {}, 0, false, 'hello'];
    values.forEach(value => {
        console.log(`${JSON.stringify(value)}: ${isEmpty(value) ? 'Empty' : 'Not empty'}`);
    });

    // JSON parsing
    console.log('\n📄 Safe JSON Parsing:');
    const jsonStrings = ['{"valid": true}', 'invalid json', '[]'];
    jsonStrings.forEach(json => {
        const result = safeJsonParse(json, { error: 'Invalid JSON' });
        console.log(`"${json}" -> ${JSON.stringify(result)}`);
    });

    console.log('\n🎯 All utility examples completed successfully!');
}

/**
 * Main execution block for testing all functionality
 * Runs comprehensive examples when file is executed directly
 */
if (require.main === module) {
    runUtilityExamples();
}
