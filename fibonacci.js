/* eslint-disable */

/**
 * Generate Tribonacci sequence (sum of previous 3 numbers)
 * Tribonacci: 0, 0, 1, 1, 2, 4, 7, 13, 24, 44, 81...
 */
function tribonacci(n) {
    if (n <= 1) return 0;
    if (n === 2) return 1;
    let a = 0,
        b = 0,
        c = 1;
    for (let i = 3; i <= n; i++) {
        const next = a + b + c;
        a = b;
        b = c;
        c = next;
    }
    return c;
}

/**
 * Calculate fibonacci modulo m (prevents overflow)
 * Useful for very large fibonacci numbers
 */
function fibonacciMod(n, mod) {
    if (n <= 1) return n % mod;
    let prev = 0,
        curr = 1;
    for (let i = 2; i <= n; i++) {
        const next = (prev + curr) % mod;
        prev = curr;
        curr = next;
    }
    return curr;
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
    return { index: n, value: fib, isPrime: isPrime(fib) };
}

/**
 * Find fibonacci numbers in a given range
 * Returns all fibonacci numbers between min and max values
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
    let sum = 0,
        evenCount = 0,
        oddCount = 0;

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
 * Convert fibonacci to different number bases
 * Returns representations in binary, octal, and hexadecimal
 */
function fibonacciBase(n) {
    const fib = fibonacci(n);
    return {
        decimal: fib,
        binary: fib.toString(2),
        octal: fib.toString(8),
        hexadecimal: fib.toString(16).toUpperCase(),
    };
}

/**
 * Generate fibonacci spiral coordinates
 * Returns array of {x, y} coordinates for fibonacci spiral
 */
function fibonacciSpiral(terms) {
    const coordinates = [];
    let x = 0,
        y = 0,
        direction = 0;

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
 * Calculate golden ratio convergence analysis
 * Shows how fibonacci ratios approach the golden ratio
 */
function goldenRatioAnalysis(count) {
    const ratios = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 1; i < count; i++) {
        const current = fibonacci(i + 1);
        const previous = fibonacci(i);
        const ratio = current / previous;
        const error = Math.abs(ratio - goldenRatio);

        ratios.push({
            index: i,
            ratio,
            goldenRatio,
            error,
            convergence: 1 - error / goldenRatio,
        });
    }

    return ratios;
}

/**
 * Benchmark different fibonacci implementations
 * Compares performance of various algorithms
 */
function fibonacciBenchmark(n, iterations = 1000) {
    const implementations = {
        iterative: fibonacci,
        memoized: fibonacciMemo,
        matrix: fibonacciMatrix,
        binet: fibonacciBinet,
    };

    const results = {};

    Object.entries(implementations).forEach(([name, impl]) => {
        const start = performance.now();

        for (let i = 0; i < iterations; i++) {
            impl(n);
        }

        const end = performance.now();
        const time = end - start;

        results[name] = {
            averageTime: time / iterations,
            totalTime: time,
            result: impl(n),
        };
    });

    return {
        n,
        iterations,
        results,
        fastest: Object.entries(results).reduce((a, b) => (a[1].averageTime < b[1].averageTime ? a : b))[0],
    };
}

/**
 * Generate fibonacci word (fractal string)
 * Creates a binary string following fibonacci substitution rules
 */
function fibonacciWord(n) {
    if (n === 0) return '0';
    if (n === 1) return '01';

    let prev = '0';
    let curr = '01';

    for (let i = 2; i <= n; i++) {
        const next = curr + prev;
        prev = curr;
        curr = next;
    }

    return curr;
}

/**
 * Calculate pisano period (fibonacci sequence modulo m period)
 * Useful for calculating very large fibonacci numbers modulo m
 */
function pisanoPeriod(m) {
    let prev = 0;
    let curr = 1;

    for (let i = 0; i < m * m; i++) {
        const next = (prev + curr) % m;
        prev = curr;
        curr = next;

        // Period found when we return to 0, 1
        if (prev === 0 && curr === 1) {
            return i + 1;
        }
    }

    return -1; // Period not found
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

    // Related sequences
    lucasNumber,
    tribonacci,

    // Analysis functions
    isFibonacci,
    goldenRatio,
    goldenRatioAnalysis,
    fibonacciPrime,
    fibonacciStats,

    // Utility functions
    fibonacciMod,
    fibonacciInRange,
    fibonacciBase,
    fibonacciSpiral,
    fibonacciWord,
    pisanoPeriod,

    // Performance and testing
    fibonacciBenchmark,
    printFibonacci,
};

/**
 * Comprehensive example usage demonstrating all fibonacci functions
 * Shows practical applications and testing scenarios
 */
function runFibonacciExamples() {
    console.log('🔢 Comprehensive Fibonacci Library Examples');
    console.log('============================================\n');

    // Core fibonacci calculations
    console.log('📊 Core Fibonacci Calculations:');
    for (let i = 0; i <= 15; i++) {
        printFibonacci(i);
    }

    // Sequence generation
    console.log('\n🔄 Sequence Generation:');
    console.log('First 12 fibonacci numbers:', fibonacciSequence(12));
    console.log(
        'First 8 Lucas numbers:',
        Array.from({ length: 8 }, (_, i) => lucasNumber(i))
    );
    console.log(
        'First 8 Tribonacci numbers:',
        Array.from({ length: 8 }, (_, i) => tribonacci(i))
    );

    // Algorithm comparison
    console.log('\n⚡ Algorithm Performance Comparison:');
    const n = 30;
    console.log(`Calculating F(${n}) using different methods:`);
    console.log(`Iterative: ${fibonacci(n)}`);
    console.log(`Memoized: ${fibonacciMemo(n)}`);
    console.log(`Matrix: ${fibonacciMatrix(n)}`);
    console.log(`Binet: ${fibonacciBinet(n)}`);

    // Mathematical properties
    console.log('\n🔍 Mathematical Properties:');
    [5, 8, 13, 21, 34, 55, 89, 144].forEach(num => {
        console.log(`${num} is ${isFibonacci(num) ? 'a' : 'not a'} fibonacci number`);
    });

    // Prime fibonacci numbers
    console.log('\n🔢 Prime Fibonacci Analysis:');
    for (let i = 1; i <= 15; i++) {
        const result = fibonacciPrime(i);
        if (result.isPrime) {
            console.log(`F(${i}) = ${result.value} is PRIME`);
        }
    }

    // Golden ratio convergence
    console.log('\n✨ Golden Ratio Convergence:');
    const ratios = goldenRatioAnalysis(10);
    ratios.slice(-5).forEach(r => {
        console.log(`F(${r.index + 1})/F(${r.index}) = ${r.ratio.toFixed(8)}, Error: ${r.error.toFixed(8)}`);
    });

    // Range analysis
    console.log('\n📈 Range Analysis:');
    const fibsInRange = fibonacciInRange(10, 200);
    console.log(`Fibonacci numbers between 10-200: ${fibsInRange.map(f => f.value).join(', ')}`);

    // Statistics
    console.log('\n📊 Statistical Analysis (F(1) to F(20)):');
    const stats = fibonacciStats(1, 20);
    console.log(`Count: ${stats.count}, Sum: ${stats.sum}, Average: ${stats.average.toFixed(2)}`);
    console.log(`Min: ${stats.min}, Max: ${stats.max}, Even: ${stats.evenCount}, Odd: ${stats.oddCount}`);

    // Base conversions
    console.log('\n🔢 Base Conversions for F(20):');
    const bases = fibonacciBase(20);
    console.log(`Decimal: ${bases.decimal}`);
    console.log(`Binary: ${bases.binary}`);
    console.log(`Octal: ${bases.octal}`);
    console.log(`Hexadecimal: ${bases.hexadecimal}`);

    // Modular arithmetic
    console.log('\n🔄 Modular Arithmetic:');
    console.log(`F(100) mod 1000 = ${fibonacciMod(100, 1000)}`);
    console.log(`F(1000) mod 10000 = ${fibonacciMod(1000, 10000)}`);

    // Fibonacci word
    console.log('\n📝 Fibonacci Words:');
    for (let i = 0; i <= 6; i++) {
        console.log(`Word(${i}): ${fibonacciWord(i)}`);
    }

    // Pisano periods
    console.log('\n🔄 Pisano Periods:');
    for (let m = 2; m <= 12; m++) {
        console.log(`Pisano period for mod ${m}: ${pisanoPeriod(m)}`);
    }

    // Spiral coordinates (first few)
    console.log('\n🌀 Fibonacci Spiral (first 20 coordinates):');
    const spiral = fibonacciSpiral(5);
    spiral.slice(0, 20).forEach((coord, i) => {
        console.log(`Point ${i + 1}: (${coord.x}, ${coord.y}) from F(${coord.fibIndex})`);
    });

    console.log('\n🎯 All examples completed successfully!');
}

/**
 * Main execution block for testing all functionality
 * Runs when file is executed directly
 */
if (require.main === module) {
    runFibonacciExamples();
}
