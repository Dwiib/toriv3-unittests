const { expect } = require("chai");
const { BigNumber } = require("ethers");

const { setup } = require("../scripts/lib/setup")
describe("ToriV3", function () {
    it("wrap.unwrap ~ id", async function () {
        this.timeout(0);
        const state = await setup();
        for (const [key, value] of Object.entries(state.tokens))
            for (var tok of value) {
                for (const account of state.accounts) {
                    tok = tok.connect(account);
                    const toriv3 = state.toriv3.connect(account);
                    const bal = await tok.balanceOf(account.address);
                    const idx = state.addressToIndex.get(tok.address);
                    await tok.approve(toriv3.address, BigNumber.from("2").pow("128"));
                    await toriv3.wrap(bal, idx);
                    const newbal = await tok.balanceOf(toriv3.address);
                    await toriv3.unwrap(newbal, idx);
                    const fee = await toriv3._fee();
                    const feeDivisor = await toriv3._feedivisor();
                    const wrapFee = await toriv3._wrapfee();
                    const wrapFeeDivisor = await toriv3._wrapfeedivisor();
                    const wrapMinusFee = bal.sub(bal.mul(fee).div(feeDivisor));
                    const unwrapMinusFee = wrapMinusFee.sub(wrapMinusFee.mul(wrapFee).div(wrapFeeDivisor));
                    const currentBal = await tok.balanceOf(account.address);
                    expect(unwrapMinusFee).to.equal(currentBal);
                }
            }
    });
});