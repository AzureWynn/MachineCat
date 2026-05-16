const axios = require('axios');

async function test() {
  const response = await axios.get('https://api.llama.fi/protocols', { timeout: 10000 });
  
  const tvlData = {};
  response.data.forEach(protocol => {
    if (protocol.name && protocol.tvl) {
      const normalizedName = protocol.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      tvlData[normalizedName] = protocol.tvl;
    }
  });

  const okxProtocols = ['Babylon BTC', 'Eigenlayer', 'Spark (Ethereum)', 'Sui', 'Aptos', 'SOL Staking', 'Cosmos'];
  
  const findTVL = (protocolName) => {
    const normalized = protocolName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (tvlData[normalized]) {
      console.log(`  Exact match: ${protocolName} -> ${normalized}`);
      return tvlData[normalized];
    }
    
    for (const [key, tvl] of Object.entries(tvlData)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        console.log(`  Contains match: ${protocolName} (${normalized}) -> ${key}`);
        return tvl;
      }
    }
    
    const parts = normalized.match(/[a-z]+/g) || [];
    for (const part of parts) {
      if (part.length < 3) continue;
      for (const [key, tvl] of Object.entries(tvlData)) {
        if (key.includes(part)) {
          console.log(`  Part match: ${protocolName} (${part}) -> ${key}`);
          return tvl;
        }
      }
    }
    
    console.log(`  No match: ${protocolName} (${normalized})`);
    return null;
  };

  okxProtocols.forEach(p => {
    console.log(`\nLooking for: ${p}`);
    findTVL(p);
  });
}

test().catch(console.error);
