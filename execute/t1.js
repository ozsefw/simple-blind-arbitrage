const EventSource = require('eventsource');
const config = require('./utils/config.json')

async function main(){
    let MatchMaker = new EventSource(config.mainnetMatchMaker)
    // let MatchMaker = new EventSource(config.goerliMatchMaker)

    // console.log("start")
    MatchMaker.onmessage = async (event) => {
        // Handle the incoming event
        const data = JSON.parse(event.data)
        console.log(JSON.stringify(data, null, 2));
        // console.log("New transaction with hash:", data.hash)

        // if (data.logs == null) {return}

        // // Loop through all the logs in the transaction
        // console.log("Transaction has logs, parsing them")
        // for (let i = 0; i < data.logs.length; i++) {
        //     console.log(data.logs[i])
        //     if (data.logs[i].topics[0] != config.syncTopic) {continue} // Skip if it isn't a sync event
        //     const firstPair = data.logs[i].address // Get the address of the first pair, which is the address the logs are coming from
    
        //     console.log("Transaction trading on Uniswap v2 pool detected! Pool address:", firstPair)
    
        //     const [token0, token1, factoryToCheck] = await poolManager.checkPool(firstPair) // Get the pool and the other factory we need to check
        //     if (token0 == false || token1 == false || factoryToCheck == false) {return} // These are false if the pool does not have a WETH pair
            
        //     const secondPair = await poolManager.checkFactory(factoryToCheck, token0, token1) // Check if the other factory has the pool too
        //     if (secondPair == false) {return} // If it doesn't, stop here
    
        //     await bundleExecutor.execute(firstPair, secondPair, data.hash) // Execute the bundle if we've made it this far
        // }

    };
    MatchMaker.onerror = (error) => {
        // Handle the error
        console.error(error);
    }
}

main()