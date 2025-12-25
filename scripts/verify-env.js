const fs = require('fs');
const content = fs.readFileSync('.env', 'utf-8');
console.log('--- .env content ---');
console.log(content.replace(/:[^:@]+@/, ':****@')); // Mask password
console.log('--------------------');
