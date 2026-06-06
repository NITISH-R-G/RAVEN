const iterations = 10000;
const documents = Array.from({ length: 100 }).map((_, i) => ({
  name: `Document_${i}.pdf`,
  type: `Type_${i}`,
  content: `This is some content for document ${i}. It is a bit longer to simulate real text.`
}));

// Test 1: String Concatenation
console.time('String Concatenation');
for (let j = 0; j < iterations; j++) {
  let promptDocs = "";
  if (documents && Array.isArray(documents)) {
    documents.forEach((doc, i) => {
      promptDocs += `\n\n--- DOCUMENT ${i + 1}: ${doc.name} (Type: ${doc.type}) ---\n${doc.content}\n`;
    });
  }
}
console.timeEnd('String Concatenation');

// Test 2: Array Map Join
console.time('Array Map Join');
for (let j = 0; j < iterations; j++) {
  let promptDocs = "";
  if (documents && Array.isArray(documents)) {
    promptDocs = documents.map((doc, i) =>
      `\n\n--- DOCUMENT ${i + 1}: ${doc.name} (Type: ${doc.type}) ---\n${doc.content}\n`
    ).join('');
  }
}
console.timeEnd('Array Map Join');
