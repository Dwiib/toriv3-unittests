const { BigNumber } = require("ethers");
const hre = require("hardhat");

// constructor (string memory name, string memory symbol) public {
//     _name = name;
//     _symbol = symbol;
//     _decimals = 18;
// }


async function setup(log = false) {
    var logger = str => {};
    if(log) {
        logger = str => {
            console.log(str);
        }
    }
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile 
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy
    const Token1 = await hre.ethers.getContractFactory("TestTokenDecimals");
    const accounts = await ethers.getSigners();
    const ToriV3Factory = await (await hre.ethers.getContractFactory("contracts/tori_v3.sol:CommonWealth")).connect(accounts[0]);
    const toriv3 = await ToriV3Factory.deploy("CommonWealth v3", "tori");
    await toriv3.deployed();
    const myToriV3 = toriv3.connect(accounts[0])
    await myToriV3.setWrapFee("10", "1000");
    await myToriV3.setFeeTarget(accounts[0].address);
    await myToriV3.updateRate("20000000000000000");
    var ret = {
        accounts,
        toriv3,
        tokens: {},
        addressToIndex: new Map(),
        indexToAddress: new Map(),
    };
    for (var i = 0; i <= 18; i++) {
        ret.tokens[18 - i] = [];
    }
    for (var i = 0; i <= 18; i++) {
        for(const char of ["A", "B"]) { 
            const Token1 = await (await hre.ethers.getContractFactory("TestTokenDecimals")).connect(accounts[0]);
            const decimals = 18;
            const symbol = char + " " + decimals;
            const name = "Test 1 " + symbol;
            var token1 = await Token1.deploy(name, symbol, decimals);
            await token1.deployed();

            await myToriV3.arrayAdd(token1.address, "1000000000000000000");
            ret.tokens[18 - i].push(token1);
        }
    }
    var arrLength = (await myToriV3.arrayLength());

    for(var i = BigNumber.from(0); i.lt(arrLength); i = i.add(BigNumber.from(1))) {
        var address = await myToriV3._erc20Address(i);
        ret.addressToIndex.set(address, i);
        ret.indexToAddress.set(i, address);
    }

    for (const account of accounts) {
        logger(account);
    }
    for (const [key, value] of Object.entries(ret.tokens)) {
        for (const tok2 of ret.tokens[key]) {
            const tok = tok2.connect(accounts[0]);
            var name = await tok.name();
            logger("Deployed token named: " + name);
            for (const account of accounts) {
                await tok.mint(account.address, 1000);
                const bal = await tok.balanceOf(account.address);
                logger("Minted " + bal + " to " + account.address);
            }
        }

    }
    return ret;
}
module.exports.setup = setup;