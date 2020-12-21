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
    var accounts = await ethers.getSigners();
    var ret = {
        accounts: [],
        toriv3: null,
        tokens: {},
        addressToIndex: new Map(),
        indexToAddress: new Map(),
        superAccount: accounts[0],
    };
    for(const account of accounts) {
        if(account.address === accounts[0].address) { continue; }
        ret.accounts.push(account);
    }
    accounts = ret.accounts;
    for (var i = 0; i <= 18; i++) {
        ret.tokens[18 - i] = [];
    }
    const ToriV3Factory = await (await hre.ethers.getContractFactory("contracts/tori_v3.sol:CommonWealth")).connect(ret.superAccount);
    const toriv3 = await ToriV3Factory.deploy("CommonWealth v3", "tori");
    await toriv3.deployed();
    const myToriV3 = toriv3.connect(ret.superAccount)
    await myToriV3.setFee("10", "1000");
    await myToriV3.setWrapFee("10", "1000");
    await myToriV3.setFeeTarget(ret.superAccount.address);
    await myToriV3.updateRate("20000000000000000");
    ret.toriv3 = toriv3;
    for (var i = 0; i <= 18; i++) {
        for(const char of ["A", "B"]) { 
            const Token1 = await (await hre.ethers.getContractFactory("contracts/commonWealth-TokenStandard.sol:CommonWealth")).connect(ret.superAccount);
            const decimals = 18-i;
            const symbol = char + " " + decimals;
            const name = "Test 1 " + symbol;
            var token1 = await Token1.deploy(name, symbol);;
            await token1.deployed();
            await token1.setFee("10", "1000")
            await token1.setFeeTarget(ret.superAccount.address);

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
            const tok = tok2.connect(ret.superAccount);
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