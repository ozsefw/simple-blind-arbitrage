const ethers = require('ethers')
const PoolManager = require('./poolManager.js')
require('dotenv').config()

async function main(){
    const provider = new ethers.providers.JsonRpcProvider(process.env.rpcUrl)
    const poolManager = new PoolManager(provider, "mainnet")

    // const firstPair = "0x70235a346a1ec1d7a40181ff88a3a2e5260e1d04"
    const firstPair = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
    const [token0, token1, factoryToCheck] = await poolManager.checkPool(firstPair) // Get the pool and the other factory we need to check
    if (token0 == false || token1 == false || factoryToCheck == false) {return} // These are false if the pool does not have a WETH pair
    console.log(factoryToCheck);

    const secondPair = await poolManager.checkFactory(factoryToCheck, token0, token1) // Check if the other factory has the pool too
    if (secondPair == false) {return} // If it doesn't, stop here
    console.log(secondPair);
    // console.log(token0);
    // console.log(token1);
    // console.log(JSON.stringify(factoryToCheck, null, 2));
}

main()