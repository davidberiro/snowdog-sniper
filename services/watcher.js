require("dotenv").config();
const cron = require("node-cron");
const express = require("express");
const ethers = require("ethers");
const config = require("../config/config.json");

const providerUrl = process.env.PROVIDER_URL;
const privateKey = process.env.PRIVATE_KEY;
const minSellLiquidity = process.env.MIN_SELL_LIQUIDITY;
const gasPrice = process.env.GAS_PRICE;
if (!providerUrl) throw new Error("Missing env var PROVIDER_URL");
if (!privateKey) throw new Error("Missing env var PRIVATE_KEY");
if (!minSellLiquidity) throw new Error("Missing env var MIN_SELL_LIQUIDITY");
if (!gasPrice) throw new Error("Missing env var GAS_PRICE");

const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const erc20Abi = require("../abi/IERC20.json");
const snowdogSellerAbi = require("../abi/SnowdogSeller.json");
  
const app = express(); // Initializing app
  
// Creating a cron job which runs on every 5 second
cron.schedule("*/5 * * * * *", async function() {
    console.log("Checking for buyback");
    await checkIfBuybackOccured();
});

async function checkIfBuybackOccured() {
    const mimContract = new ethers.Contract(config.mim, erc20Abi, provider);
    const snowdogMimLpBalance = await mimContract.balanceOf(config.snowdogMimLp);
    const formattedBalance = ethers.utils.formatEther(snowdogMimLpBalance);
    console.log(`snowdogMimLp balance: ${formattedBalance}`);
    if (snowdogMimLpBalance.gt(ethers.utils.parseEther(minSellLiquidity))) {
        console.log(`snowdog-mim-lp balance above $${minSellLiquidity} (${formattedBalance}) triggering sell`);
        const success = await sellSnowdog();
        if (success) {
            const recipientMimBalance = await mimContract.balanceOf(config.recipient);
            console.log(`Snowbank sold for ${ethers.utils.formatEther(recipientMimBalance)} MIM`);
            process.exit(); 
        } else {
            console.log("TX Failed!");
            process.exit(1); 
        }
    }
}

async function sellSnowdog() {
    const snowdogSeller = new ethers.Contract(config.snowdogSeller, snowdogSellerAbi, wallet);
    try {
        const tx = await snowdogSeller.sellSnowdog(
            ethers.utils.parseEther(minSellLiquidity),
            { gasPrice: ethers.utils.parseUnits(gasPrice, "gwei") }
        );
        console.log(`Sent sell snowdog tx! - ${tx.hash}`);
        await provider.waitForTransaction(tx.hash, 3);
        console.log("TX confirmed with 3 blocks");
        return true;
    } catch(e) {
        console.error("Received error selling snowdog");
        console.error(e.message);
        return false;
    }
}
  
app.listen(3000, async function() {
    console.log(`watcher app listening at http://localhost:${3000}`)
    const snowdogContract = new ethers.Contract(config.snowdog, erc20Abi, provider);
    const snowdogSellerBalance = await snowdogContract.balanceOf(config.snowdogSeller);
    const formattedBalance = ethers.utils.formatUnits(snowdogSellerBalance, 9); // 9 decimals
    console.log(`watching snowdog seller at ${config.snowdogSeller} with balance ${formattedBalance}`);
    console.log(`provider url: ${providerUrl}`);
    console.log(`min sell liquidity: ${minSellLiquidity}`);
    console.log(`gas price: ${gasPrice}`);
});