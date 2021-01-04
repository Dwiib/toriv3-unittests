const { expect } = require("chai");
const { setup } = require("../scripts/lib/setup")
const { BigNumber } = require("ethers");
const hre = require("hardhat");
describe("ToriV3 time", function () {
    it("interest accrues per year sequentially", async function () {
        this.timeout(0);
        const state = await setup();
        for (const [key, value] of Object.entries(state.tokens))
            for (var tok of value) {
                const account = state.accounts[0]
                const superTok = tok.connect(state.superAccount);
                tok = tok.connect(account);

                const toriv3 = state.toriv3.connect(account);
                const prevToriV3Balance = await superTok.balanceOf(toriv3.address);
                superTok.mint(toriv3.address, BigNumber.from(2).pow(128));
                const bal = await tok.balanceOf(account.address);
                const index = state.addressToIndex.get(tok.address);
                await tok.approve(toriv3.address, BigNumber.from("2").pow("128"));
                await toriv3.wrap(bal, index);
                var toriv3bal = toriv3.balanceOf(account.address)
                await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 7 * 52])
                await ethers.provider.send("evm_mine")
                await toriv3.approve(account.address, BigNumber.from("2").pow("128"));
                await toriv3.unwrap(toriv3bal, index);
                const balAfterInterest = await tok.balanceOf(account.address);
                expect(balAfterInterest).to.be.at.least(BigNumber.from(1010));
                expect(balAfterInterest).to.be.at.most(BigNumber.from(1011));
                toriv3bal = await toriv3.balanceOf(account.address)
                expect(toriv3bal).to.equal(BigNumber.from(0));
            }
    });
});