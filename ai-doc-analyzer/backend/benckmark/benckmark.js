const axios = require('axios');

const prompt = "What is the capital of France?";
const url = "http://localhost:5000/ai";
const N = 50; // Number of requests

async function timeRequests(useCache) {
  const times = [];
  for (let i = 0; i < N; i++) {
    const t0 = Date.now();
    await axios.post(url, { prompt: useCache ? prompt : prompt + " " + i });
    times.push(Date.now() - t0);
  }
  times.sort((a, b) => a - b);
  const p50 = times[Math.floor(N * 0.5)];
  const p95 = times[Math.floor(N * 0.95)];
  const throughput = Math.round(1000 * N / times.reduce((a, b) => a + b, 0));
  return { p50, p95, throughput };
}

(async () => {
  console.log("Benchmarking raw API (no cache)...");
  const raw = await timeRequests(false);
  console.log("Raw API:", raw);

  console.log("Benchmarking cached API...");
  // Warm up cache
  await axios.post(url, { prompt });
  const cached = await timeRequests(true);
  console.log("Cached:", cached);
})();