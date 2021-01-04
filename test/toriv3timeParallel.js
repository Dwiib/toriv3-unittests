const { expect } = require("chai");
const { setup } = require("../scripts/lib/setup")
const { BigNumber } = require("ethers");
const hre = require("hardhat");
describe("ToriV3 time parallel", function () {
    it("interest accrues per year in parallel", async function () {
        this.timeout(0);
        const state = await setup();
        for (const [key, value] of Object.entries(state.tokens)) {
            for (var tok of value) {
                for (const account of state.accounts) {
                    tok = await tok.connect(account);
                    const toriv3 = await state.toriv3.connect(account);
                    const bal = await tok.balanceOf(account.address);
                    const index = state.addressToIndex.get(tok.address);
                    await tok.approve(toriv3.address, BigNumber.from("2").pow("128"));
                    await toriv3.wrap(bal, index);
                    console.log("toriv3 balance for account", account.address, "is", await toriv3.balanceOf(account.address))
                    console.log(await tok.name());
                }
            }
        }
        await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 7 * 52])
        await ethers.provider.send("evm_mine")
        for (const [key, value] of Object.entries(state.tokens)) {
            for (var tok of value) {
                const superTok = tok.connect(state.superAccount);
                console.log(await tok.name())
                for (const account of state.accounts) {
                    //ENSURE CONTRACT HAS THE TOKENS
                    superTok.mint(state.toriv3.address, BigNumber.from(2).pow(128).sub(await tok.balanceOf(state.toriv3.address)));
                    //


                    await state.toriv3.updateTime();
                    console.log("interest scale", await state.toriv3._interestScale())
                    const toriv3 = await state.toriv3.connect(account);
                    tok = await tok.connect(account);
                    const index = state.addressToIndex.get(tok.address);
                    const toriv3bal = await toriv3.balanceOf(account.address)
                    await toriv3.approve(account.address, BigNumber.from("2").pow("128"));
                    await toriv3.unwrap(toriv3bal, index);
                    const balAfterInterest = await tok.balanceOf(account.address);
                    expect(balAfterInterest).to.be.at.least(BigNumber.from(1010));
                    expect(balAfterInterest).to.be.at.most(BigNumber.from(1011));
                }
            }
        }
    });
});