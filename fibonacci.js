/* eslint-disable */

/**
 * Calculate fibonacci number using iterative approach
 * Time complexity: O(n), Space complexity: O(1)
 */
function fibonacci(n) {
    if (n <= 1) return n;

    let prev = 0;
    let curr = 1;

    for (let i = 2; i <= n; i++) {
        const next = prev + curr;
        prev = curr;
        curr = next;
    }

    return curr;
}

/**
 * Generate fibonacci sequence up to n terms
 * Returns array of fibonacci numbers
 */
function fibonacciSequence(count) {
    const sequence = [];

    for (let i = 0; i < count; i++) {
        sequence.push(fibonacci(i));
    }

    return sequence;
}

/**
 * Memoized fibonacci for better performance on repeated calls
 * Uses caching to avoid recalculating the same values
 */
const fibonacciMemo = (() => {
    const cache = {};

    return function (n) {
        if (n in cache) return cache[n];

        if (n <= 1) {
            cache[n] = n;
            return n;
        }

        cache[n] = fibonacciMemo(n - 1) + fibonacciMemo(n - 2);
        return cache[n];
    };
})();

/**
 * Check if a number is a fibonacci number
 * Uses mathematical property with perfect squares
 */
function isFibonacci(num) {
    const isPerfectSquare = x => {
        const sqrt = Math.sqrt(x);
        return sqrt === Math.floor(sqrt);
    };

    return isPerfectSquare(5 * num * num + 4) || isPerfectSquare(5 * num * num - 4);
}

/**
 * Calculate fibonacci using matrix exponentiation - O(log n)
 * Most efficient method for very large fibonacci numbers
 */
function fibonacciMatrix(n) {
    if (n <= 1) return n;

    const multiply = (a, b) => [
        [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
        [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
    ];

    const power = (matrix, exp) => {
        if (exp === 1) return matrix;
        if (exp % 2 === 0) {
            const half = power(matrix, exp / 2);
            return multiply(half, half);
        }
        return multiply(matrix, power(matrix, exp - 1));
    };

    const baseMatrix = [
        [1, 1],
        [1, 0],
    ];
    const resultMatrix = power(baseMatrix, n);
    return resultMatrix[0][1];
}

/**
 * Calculate golden ratio using fibonacci numbers
 * Ratio approaches (1 + √5) / 2 as n increases
 */
function goldenRatio(n) {
    if (n <= 1) return 1;

    const current = fibonacci(n);
    const previous = fibonacci(n - 1);

    return current / previous;
}

/**
 * Generate Lucas numbers (related to fibonacci)
 * Lucas sequence: 2, 1, 3, 4, 7, 11, 18, 29, 47, 76, 123...
 */
function lucasNumber(n) {
    if (n === 0) return 2;
    if (n === 1) return 1;

    let prev = 2;
    let curr = 1;

    for (let i = 2; i <= n; i++) {
        const next = prev + curr;
        prev = curr;
        curr = next;
    }

    return curr;
}

/**
 * Calculate fibonacci using Binet's formula (golden ratio)
 * Fast but may have floating point precision issues for large numbers
 */
function fibonacciBinet(n) {
    const phi = (1 + Math.sqrt(5)) / 2;
    const psi = (1 - Math.sqrt(5)) / 2;

    return Math.round((Math.pow(phi, n) - Math.pow(psi, n)) / Math.sqrt(5));
}

/**
 * Find fibonacci numbers within a range of values
 * Returns all fibonacci numbers between min and max
 */
function fibonacciInRange(min, max) {
    const result = [];
    let i = 0;
    let fib = fibonacci(i);

    while (fib <= max) {
        if (fib >= min) {
            result.push({ index: i, value: fib });
        }
        i++;
        fib = fibonacci(i);
    }

    return result;
}

/**
 * Calculate fibonacci statistics for a range
 * Returns comprehensive statistical analysis
 */
function fibonacciStats(start, end) {
    const numbers = [];
    let sum = 0;
    let evenCount = 0;
    let oddCount = 0;

    for (let i = start; i <= end; i++) {
        const fib = fibonacci(i);
        numbers.push(fib);
        sum += fib;

        if (fib % 2 === 0) evenCount++;
        else oddCount++;
    }

    return {
        range: [start, end],
        count: numbers.length,
        sum,
        average: sum / numbers.length,
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        evenCount,
        oddCount,
        numbers,
    };
}

/**
 * Check if fibonacci number is prime
 * Returns object with fibonacci value and primality test
 */
function fibonacciPrime(n) {
    const fib = fibonacci(n);

    const isPrime = num => {
        if (num < 2) return false;
        if (num === 2) return true;
        if (num % 2 === 0) return false;

        for (let i = 3; i <= Math.sqrt(num); i += 2) {
            if (num % i === 0) return false;
        }
        return true;
    };

    return {
        index: n,
        value: fib,
        isPrime: isPrime(fib),
    };
}

/**
 * Generate fibonacci spiral coordinates
 * Returns array of {x, y} coordinates for fibonacci spiral
 */
function fibonacciSpiral(terms) {
    const coordinates = [];
    let x = 0;
    let y = 0;
    let direction = 0; // 0: right, 1: up, 2: left, 3: down

    for (let i = 1; i <= terms; i++) {
        const fib = fibonacci(i);

        for (let step = 0; step < fib; step++) {
            coordinates.push({ x, y, fibIndex: i, step });

            switch (direction % 4) {
                case 0:
                    x++;
                    break; // right
                case 1:
                    y++;
                    break; // up
                case 2:
                    x--;
                    break; // left
                case 3:
                    y--;
                    break; // down
            }
        }

        direction++;
    }

    return coordinates;
}

/**
 * Helper function to print fibonacci number with formatting
 * Displays fibonacci number in a readable format
 */
function printFibonacci(n) {
    console.log(`F(${n}) = ${fibonacci(n)}`);
}

/**
 * Export all fibonacci-related functions
 * Comprehensive module for fibonacci calculations and analysis
 */
module.exports = {
    // Core fibonacci functions
    fibonacci,
    fibonacciSequence,
    fibonacciMemo,
    fibonacciMatrix,
    fibonacciBinet,

    // Analysis functions
    isFibonacci,
    goldenRatio,
    fibonacciPrime,
    fibonacciStats,
    fibonacciInRange,

    // Related sequences
    lucasNumber,

    // Utility functions
    fibonacciSpiral,
    printFibonacci,
};

/**
 * Comprehensive example usage demonstrating fibonacci functions
 * Shows practical applications and testing scenarios
 */
function runFibonacciExamples() {
    console.log('🔢 Fibonacci Library Examples');
    console.log('=============================\n');

    // Basic fibonacci calculations
    console.log('📊 Basic Fibonacci Sequence:');
    for (let i = 0; i <= 12; i++) {
        printFibonacci(i);
    }

    // Sequence generation
    console.log('\n🔄 Fibonacci Sequences:');
    console.log('First 10 numbers:', fibonacciSequence(10));
    console.log(
        'First 8 Lucas numbers:',
        Array.from({ length: 8 }, (_, i) => lucasNumber(i))
    );

    // Algorithm comparison
    console.log('\n⚡ Algorithm Performance Comparison (F(25)):');
    console.log(`Iterative: ${fibonacci(25)}`);
    console.log(`Memoized: ${fibonacciMemo(25)}`);
    console.log(`Matrix: ${fibonacciMatrix(25)}`);
    console.log(`Binet: ${fibonacciBinet(25)}`);

    // Mathematical properties
    console.log('\n🔍 Fibonacci Number Validation:');
    [5, 8, 13, 21, 34, 55, 89, 144, 100, 200].forEach(num => {
        console.log(`${num} is ${isFibonacci(num) ? 'a' : 'not a'} fibonacci number`);
    });

    // Prime fibonacci numbers
    console.log('\n🔢 Prime Fibonacci Analysis:');
    for (let i = 1; i <= 12; i++) {
        const result = fibonacciPrime(i);
        if (result.isPrime) {
            console.log(`F(${i}) = ${result.value} is PRIME`);
        }
    }

    // Golden ratio convergence
    console.log('\n✨ Golden Ratio Convergence:');
    for (let i = 5; i <= 20; i += 5) {
        console.log(`F(${i})/F(${i - 1}) = ${goldenRatio(i).toFixed(8)}`);
    }

    // Range analysis
    console.log('\n📈 Fibonacci Numbers in Range 10-100:');
    const fibsInRange = fibonacciInRange(10, 100);
    console.log(fibsInRange.map(f => f.value).join(', '));

    // Statistics
    console.log('\n📊 Statistical Analysis (F(1) to F(15)):');
    const stats = fibonacciStats(1, 15);
    console.log(`Count: ${stats.count}, Sum: ${stats.sum}, Average: ${stats.average.toFixed(2)}`);
    console.log(`Min: ${stats.min}, Max: ${stats.max}, Even: ${stats.evenCount}, Odd: ${stats.oddCount}`);

    // Spiral coordinates (first few points)
    console.log('\n🌀 Fibonacci Spiral (first 15 coordinates):');
    const spiral = fibonacciSpiral(4);
    spiral.slice(0, 15).forEach((coord, i) => {
        console.log(`Point ${i + 1}: (${coord.x}, ${coord.y}) from F(${coord.fibIndex})`);
    });

    console.log('\n🎯 All fibonacci examples completed successfully!');
}

/**
 * Main execution block for testing all functionality
 * Runs when file is executed directly
 */
if (require.main === module) {
    runFibonacciExamples();
}
