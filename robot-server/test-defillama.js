const axios = require('axios');

async function test() {
  console.log('Fetching DeFiLlama protocols...');
  const response = await axios.get('https://api.llama.fi/protocols', { timeout: 10000 });
  
  console.log(`Total protocols: ${response.data.length}`);
  
  const top10 = response.data
    .filter(p => p.tvl > 0)
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 10);
  
  console.log('\nTop 10 protocols by TVL:');
  top10.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}: $${(p.tvl / 1e9).toFixed(2)}B`);
  });
  
  const babylon = response.data.find(p => p.name.toLowerCase().includes('babylon'));
  const eigen = response.data.find(p => p.name.toLowerCase().includes('eigen'));
  
  console.log('\nLooking for Babylon:', babylon ? `$${(babylon.tvl / 1e9).toFixed(2)}B` : 'Not found');
  console.log('Looking for Eigenlayer:', eigen ? `$${(eigen.tvl / 1e9).toFixed(2)}B` : 'Not found');
}

test().catch(console.error);
