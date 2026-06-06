const fs = require('fs');

let content = fs.readFileSync('src/server/analyzer.ts', 'utf8');

content = content.replace(
  'const FP_REGEX = /(?:device|fingerprint|fp-)\\s{0,5}(?:ID|id)?:?\\s{0,5}([a-fA-F0-9-]+)/gi;',
  'const FP_REGEX = /(?:device|fingerprint|fp-)\\s{0,5}(?:ID|id)?:?\\s*([a-fA-F0-9-]+)/gi;'
);

content = content.replace(
  '/(?:TOTAL INCOME|GROSS INCOME|TAXABLE INCOME|INCOME|GTI):\\s{0,5}(?:INR|₹)?\\s{0,5}([0-9,.]+)/i;',
  '/(?:TOTAL INCOME|GROSS INCOME|TAXABLE INCOME|INCOME|GTI):\\s{0,5}(?:INR|₹)?\\s*([0-9,.]+)/i;'
);

content = content.replace(
  '/(?:GROSS SALARY|NET SALARY|NET PAYABLE|PAYABLE|SALARY):\\s{0,5}(?:INR|₹)?\\s{0,5}([0-9,.]+)/i;',
  '/(?:GROSS SALARY|NET SALARY|NET PAYABLE|PAYABLE|SALARY):\\s{0,5}(?:INR|₹)?\\s*([0-9,.]+)/i;'
);

fs.writeFileSync('src/server/analyzer.ts', content);
