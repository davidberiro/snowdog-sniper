require("@nomiclabs/hardhat-waffle");
require("hardhat-abi-exporter");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "local",
  networks: {
    local: {
      url: "http://localhost:8545",
      timeout: 100000
    },
    hardhat: {
      forking: {
        url: "https://speedy-nodes-nyc.moralis.io/895bce540638a254f80d534d/avalanche/mainnet",
        //blockNumber: 12334447
      },
      chainId: 1337,
      accounts: {
        accountsBalance: "10000000000000000000000000000000"
      },
      mining: {
        auto: true,
        interval: [1000, 2000]
      }
    },
    mainnet: {
      url: "https://speedy-nodes-nyc.moralis.io/895bce540638a254f80d534d/avalanche/mainnet",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 6000000000,
      timeout: 100000
    }
  },
  abiExporter: {
    flat: true
  }
};
