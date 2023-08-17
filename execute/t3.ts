// const PoolManager = require('./poolManager.js')
// const ethers = require('ethers')
import { Contract, providers, BigNumber, utils} from "ethers";

const config = {
    "uni_v2_factory": "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    "uni_v3_factory": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    "weth": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "pepe": "0xfb66321D7C674995dFcC2cb67A30bC978dc862AD",
}; 

const ETHEREUM_RPC_URL="http://127.0.0.1:8545"
const provider = new providers.StaticJsonRpcProvider(ETHEREUM_RPC_URL)

async function build_uni_v3_factory() {
    const ABI = [
        "function getPool(address,address,uint24)public view returns (address)",
    ];

    const uni_v3_factory = new Contract(config.uni_v3_factory, ABI, provider);
    return uni_v3_factory;
}

async function build_erc20(address: any) {
    const ABI = [
        "function balanceOf(address) public view returns (uint256)",
    ];

    const contract = new Contract(address, ABI, provider);
    return contract;
}

async function t02() {
    const uni_v3_factory = await build_uni_v3_factory();
    let pool_address = await uni_v3_factory.getPool(config.weth, config.pepe, 3000);

    let weth_erc02 = await build_erc20(config.weth);
    let pepe_erc20 = await build_erc20(config.pepe);

    let weth_balance = await weth_erc02.balanceOf(pool_address);
    let pepe_balance = await pepe_erc20.balanceOf(pool_address);

    console.log(weth_balance, pepe_balance);
}


async function t01(){
    const uni_v3_factory = await build_uni_v3_factory();
    let fee = 3000;
    let address = await uni_v3_factory.getPool(config.weth, config.pepe, fee);
    console.log(fee, address);

    fee = 5000;
    address = await uni_v3_factory.getPool(config.weth, config.pepe, fee);
    console.log(fee, address);

    fee = 10000;
    address = await uni_v3_factory.getPool(config.weth, config.pepe, fee);
    console.log(fee, address);
}


t02();