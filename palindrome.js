/* eslint-disable */

/**
 * Check if a string is a palindrome (case-insensitive)
 * Ignores spaces, punctuation, and case differences
 */
function isPalindrome(str) {
    if (!str || typeof str !== 'string') return false;

    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const reversed = cleaned.split('').reverse().join('');

    return cleaned === reversed;
}

/**
 * Check if a number is a palindrome
 * Works with both positive and negative numbers
 */
function isPalindromeNumber(num) {
    if (typeof num !== 'number') return false;
    if (num < 0) return false; // Negative numbers are not palindromes

    const str = num.toString();
    return str === str.split('').reverse().join('');
}

/**
 * Find the longest palindromic substring in a string
 * Uses expand around centers algorithm - O(n²) time complexity
 */
function longestPalindromicSubstring(str) {
    if (!str || str.length === 0) return '';

    let longest = '';

    const expandAroundCenter = (left, right) => {
        while (left >= 0 && right < str.length && str[left] === str[right]) {
            const current = str.substring(left, right + 1);
            if (current.length > longest.length) {
                longest = current;
            }
            left--;
            right++;
        }
    };

    for (let i = 0; i < str.length; i++) {
        // Check for odd-length palindromes
        expandAroundCenter(i, i);
        // Check for even-length palindromes
        expandAroundCenter(i, i + 1);
    }

    return longest;
}

/**
 * Generate all palindromic substrings of a given string
 * Returns array of unique palindromes sorted by length
 */
function findAllPalindromes(str) {
    if (!str || str.length === 0) return [];

    const palindromes = new Set();

    const expandAroundCenter = (left, right) => {
        while (left >= 0 && right < str.length && str[left] === str[right]) {
            palindromes.add(str.substring(left, right + 1));
            left--;
            right++;
        }
    };

    for (let i = 0; i < str.length; i++) {
        expandAroundCenter(i, i); // odd-length palindromes
        expandAroundCenter(i, i + 1); // even-length palindromes
    }

    return Array.from(palindromes)
        .filter(p => p.length > 1)
        .sort((a, b) => a.length - b.length);
}

/**
 * Create a palindrome by adding minimum characters to the beginning
 * Returns the shortest palindrome possible
 */
function makeShortestPalindrome(str) {
    if (!str || str.length === 0) return '';
    if (isPalindrome(str)) return str;

    const reversed = str.split('').reverse().join('');

    for (let i = 0; i < str.length; i++) {
        const candidate = reversed.substring(0, i) + str;
        if (isPalindrome(candidate)) {
            return candidate;
        }
    }

    return reversed + str;
}

/**
 * Check if a sentence is a palindrome (ignoring spaces and punctuation)
 * Supports word-level palindrome checking
 */
function isSentencePalindrome(sentence, wordLevel = false) {
    if (!sentence || typeof sentence !== 'string') return false;

    if (wordLevel) {
        const words = sentence
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0);

        const reversed = words.slice().reverse();
        return words.join(' ') === reversed.join(' ');
    } else {
        return isPalindrome(sentence);
    }
}

/**
 * Generate palindromic numbers up to a given limit
 * Returns array of palindromic numbers
 */
function generatePalindromeNumbers(limit) {
    const palindromes = [];

    for (let i = 1; i <= limit; i++) {
        if (isPalindromeNumber(i)) {
            palindromes.push(i);
        }
    }

    return palindromes;
}

/**
 * Find the next palindromic number after a given number
 * Efficiently generates the next palindrome
 */
function nextPalindrome(num) {
    if (typeof num !== 'number' || num < 0) return 1;

    for (let i = num + 1; ; i++) {
        if (isPalindromeNumber(i)) {
            return i;
        }
    }
}

/**
 * Check if a string can be rearranged to form a palindrome
 * Uses character frequency counting
 */
function canFormPalindrome(str) {
    if (!str || typeof str !== 'string') return false;

    const charCount = {};

    for (const char of str.toLowerCase()) {
        if (/[a-z0-9]/.test(char)) {
            charCount[char] = (charCount[char] || 0) + 1;
        }
    }

    let oddCount = 0;
    for (const count of Object.values(charCount)) {
        if (count % 2 === 1) {
            oddCount++;
        }
    }

    // At most one character can have an odd count
    return oddCount <= 1;
}

/**
 * Calculate palindrome statistics for a given text
 * Returns comprehensive analysis of palindromic content
 */
function palindromeStats(text) {
    if (!text || typeof text !== 'string') {
        return {
            totalCharacters: 0,
            palindromes: [],
            longestPalindrome: '',
            palindromeCount: 0,
            averageLength: 0,
            palindromeRatio: 0,
        };
    }

    const allPalindromes = findAllPalindromes(text);
    const longest = longestPalindromicSubstring(text);
    const totalLength = allPalindromes.reduce((sum, p) => sum + p.length, 0);

    return {
        totalCharacters: text.length,
        palindromes: allPalindromes,
        longestPalindrome: longest,
        palindromeCount: allPalindromes.length,
        averageLength: allPalindromes.length > 0 ? totalLength / allPalindromes.length : 0,
        palindromeRatio: text.length > 0 ? longest.length / text.length : 0,
    };
}

/**
 * Remove minimum characters to make a string palindrome
 * Returns the minimum number of characters to remove
 */
function minRemovalsForPalindrome(str) {
    if (!str || str.length <= 1) return 0;

    const n = str.length;
    const dp = Array(n)
        .fill()
        .map(() => Array(n).fill(0));

    // Fill DP table for longest palindromic subsequence
    for (let len = 1; len <= n; len++) {
        for (let i = 0; i <= n - len; i++) {
            const j = i + len - 1;

            if (i === j) {
                dp[i][j] = 1;
            } else if (str[i] === str[j]) {
                dp[i][j] = dp[i + 1][j - 1] + 2;
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
            }
        }
    }

    return n - dp[0][n - 1];
}

/**
 * Check if two strings are palindromic pairs
 * Returns true if concatenation forms a palindrome
 */
function isPalindromicPair(str1, str2) {
    if (!str1 || !str2) return false;

    const combined1 = str1 + str2;
    const combined2 = str2 + str1;

    return isPalindrome(combined1) || isPalindrome(combined2);
}

/**
 * Generate palindromic words of a specific length
 * Creates pronounceable palindromic words
 */
function generatePalindromicWords(length, count = 10) {
    if (length < 1) return [];

    const vowels = 'aeiou';
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const words = new Set();

    while (words.size < count) {
        let word = '';
        const halfLength = Math.floor(length / 2);

        // Generate first half
        for (let i = 0; i < halfLength; i++) {
            const useVowel = Math.random() < 0.4;
            const chars = useVowel ? vowels : consonants;
            word += chars[Math.floor(Math.random() * chars.length)];
        }

        // Add middle character for odd lengths
        if (length % 2 === 1) {
            const useVowel = Math.random() < 0.6;
            const chars = useVowel ? vowels : consonants;
            word += chars[Math.floor(Math.random() * chars.length)];
        }

        // Mirror the first half
        word += word.slice(0, halfLength).split('').reverse().join('');

        words.add(word);
    }

    return Array.from(words);
}

/**
 * Check palindrome complexity and provide analysis
 * Returns detailed breakdown of palindromic structure
 */
function analyzePalindromeComplexity(str) {
    if (!str) return null;

    const analysis = {
        original: str,
        length: str.length,
        isPalindrome: isPalindrome(str),
        canFormPalindrome: canFormPalindrome(str),
        longestPalindromicSubstring: longestPalindromicSubstring(str),
        allPalindromes: findAllPalindromes(str),
        minRemovals: minRemovalsForPalindrome(str),
        characterFrequency: {},
        palindromeTypes: {
            exact: isPalindrome(str),
            sentence: isSentencePalindrome(str),
            wordLevel: isSentencePalindrome(str, true),
        },
    };

    // Calculate character frequency
    for (const char of str.toLowerCase()) {
        if (/[a-z0-9]/.test(char)) {
            analysis.characterFrequency[char] = (analysis.characterFrequency[char] || 0) + 1;
        }
    }

    return analysis;
}

/**
 * Export all palindrome-related functions
 * Comprehensive module for palindrome operations and analysis
 */
module.exports = {
    // Core palindrome functions
    isPalindrome,
    isPalindromeNumber,
    longestPalindromicSubstring,
    findAllPalindromes,

    // Palindrome generation and manipulation
    makeShortestPalindrome,
    generatePalindromicWords,

    // Sentence and text analysis
    isSentencePalindrome,
    palindromeStats,
    analyzePalindromeComplexity,

    // Number palindromes
    generatePalindromeNumbers,
    nextPalindrome,

    // Utility functions
    canFormPalindrome,
    minRemovalsForPalindrome,
    isPalindromicPair,
};

/**
 * Comprehensive example usage demonstrating all palindrome functions
 * Shows practical applications and testing scenarios
 */
function runPalindromeExamples() {
    console.log('🔄 Palindrome Library Examples');
    console.log('==============================\n');

    // Basic palindrome tests
    console.log('📝 Basic Palindrome Tests:');
    const testStrings = ['racecar', 'hello', 'A man a plan a canal Panama', 'race a car', '12321'];
    testStrings.forEach(str => {
        console.log(`"${str}" is ${isPalindrome(str) ? 'a' : 'not a'} palindrome`);
    });

    // Number palindromes
    console.log('\n🔢 Number Palindrome Tests:');
    const testNumbers = [121, 123, 1221, 12321, 12345];
    testNumbers.forEach(num => {
        console.log(`${num} is ${isPalindromeNumber(num) ? 'a' : 'not a'} palindromic number`);
    });

    // Generate palindromic numbers
    console.log('\n📊 First 15 palindromic numbers:');
    console.log(generatePalindromeNumbers(150).slice(0, 15).join(', '));

    // Longest palindromic substring
    console.log('\n🔍 Longest Palindromic Substrings:');
    const longStrings = ['babad', 'cbbd', 'raceacar', 'abcdeffedcba'];
    longStrings.forEach(str => {
        const longest = longestPalindromicSubstring(str);
        console.log(`"${str}" -> longest: "${longest}"`);
    });

    // Find all palindromes
    console.log('\n📋 All Palindromes in "raceacar":');
    const allPalindromes = findAllPalindromes('raceacar');
    console.log(allPalindromes.join(', '));

    // Sentence palindromes
    console.log('\n💬 Sentence Palindrome Tests:');
    const sentences = ['A man a plan a canal Panama', 'Was it a rat I saw', 'Never odd or even', 'hello world'];
    sentences.forEach(sentence => {
        console.log(`"${sentence}"`);
        console.log(`  Character-level: ${isSentencePalindrome(sentence)}`);
        console.log(`  Word-level: ${isSentencePalindrome(sentence, true)}`);
    });

    // Can form palindrome
    console.log('\n🔄 Can Form Palindrome Tests:');
    const scrambled = ['aab', 'abc', 'aabbcc', 'abccba'];
    scrambled.forEach(str => {
        console.log(`"${str}" can ${canFormPalindrome(str) ? '' : 'not '}form a palindrome`);
    });

    // Make shortest palindrome
    console.log('\n✂️ Make Shortest Palindromes:');
    const toShorten = ['abc', 'abcd', 'race'];
    toShorten.forEach(str => {
        const shortest = makeShortestPalindrome(str);
        console.log(`"${str}" -> "${shortest}"`);
    });

    // Next palindrome
    console.log('\n➡️ Next Palindromic Numbers:');
    const numbers = [10, 99, 121, 1991];
    numbers.forEach(num => {
        console.log(`Next palindrome after ${num}: ${nextPalindrome(num)}`);
    });

    // Palindrome statistics
    console.log('\n📈 Palindrome Statistics for "raceacar level madam":');
    const stats = palindromeStats('raceacar level madam');
    console.log(`Total characters: ${stats.totalCharacters}`);
    console.log(`Palindrome count: ${stats.palindromeCount}`);
    console.log(`Longest palindrome: "${stats.longestPalindrome}"`);
    console.log(`Average length: ${stats.averageLength.toFixed(2)}`);

    // Generate palindromic words
    console.log('\n📝 Generated 5-letter Palindromic Words:');
    const palindromicWords = generatePalindromicWords(5, 6);
    console.log(palindromicWords.join(', '));

    // Complex analysis
    console.log('\n🔬 Complex Analysis for "racecar":');
    const analysis = analyzePalindromeComplexity('racecar');
    console.log(`Length: ${analysis.length}`);
    console.log(`Is palindrome: ${analysis.isPalindrome}`);
    console.log(`Can form palindrome: ${analysis.canFormPalindrome}`);
    console.log(`Min removals needed: ${analysis.minRemovals}`);

    console.log('\n🎯 All palindrome examples completed successfully!');
}

/**
 * Main execution block for testing all functionality
 * Runs when file is executed directly
 */
if (require.main === module) {
    runPalindromeExamples();
}
