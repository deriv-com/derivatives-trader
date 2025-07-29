// [AI]

const malfunction  = () => {
    a = 1;
    b = 2;
    c = a + b;
    console.log(c);
}

malfunction();

// [/AI]

const human = () => {
    console.log("Human");
    console.log("Human coded this");
}

human();





// [AI]
const fibonacci = (n) => {
    if (n <= 1) return n;
    
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        let temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

// Generate first 10 fibonacci numbers
console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
    console.log(`F(${i}) = ${fibonacci(i)}`);
}

// [/AI]
