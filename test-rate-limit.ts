import assert from "assert";

async function runTest() {
  const url = "http://localhost:3000/api/analyze";
  const numRequests = 12; // 10 allowed, 11th and 12th should be blocked

  console.log(`Sending ${numRequests} requests to ${url}...`);

  let blockedCount = 0;

  for (let i = 1; i <= numRequests; i++) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documents: [] }),
    });

    if (response.status === 429) {
      console.log(`Request ${i}: Blocked with 429 Too Many Requests`);
      blockedCount++;
    } else {
      console.log(`Request ${i}: Succeeded with status ${response.status}`);
    }
  }

  assert.strictEqual(blockedCount, 2, `Expected exactly 2 requests to be blocked, but ${blockedCount} were.`);
  console.log("Rate limiting works as expected.");
}

runTest().catch(console.error);
