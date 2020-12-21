const { expect } = require("chai");

const { setup } = require("../scripts/lib/setup")
describe("Token Account State", function () {
    it("Mints 1000 tokens to address", async function () {
        const state = await setup();
        for (const account of state.accounts) {
            for (const [key, value] of Object.entries(state.tokens))
                for (const tok of value) {
                    const name = await tok.name();

                    it("minted 1000 tokens of " + name, async function () {
                        expect(await tok.balanceOf(account.address)).to.equal(1000);
                    });
                }
        }
    });
});