const { expect } = require("chai");

const { setup } = require("../scripts/lib/setup")
describe("ToriV3", function () {
    it("wrap.unwrap ~ id", async function () {
        const state = await setup();
        for (const [key, value] of Object.entries(state.tokens))
            for (const tok of value) {
                for (const account of state.accounts) {
                    const toriv3 = state.toriv3.connect(account);
                    const bal = await tok.balanceOf(account.address);
                    const idx = state.addressToIndex.get(tok.address);
                    await tok.approve(toriv3.address, bal);
                    await toriv3.wrap(bal, idx);
                    const toribal = await toriv3.balanceOf(account.address);
                    console.log("Tori balance: "+toribal);
                    console.log("User balance in contract: "+ await tok.balanceOf(toriv3.address))
                    await toriv3.unwrap(toribal, idx);
                }
            }
    });
});