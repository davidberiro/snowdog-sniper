const hre = require("hardhat");
const config = require("../config/config.json");

async function main() {
  await hre.run('compile');

  // We get the contract to deploy
  const SnowdogSeller = await hre.ethers.getContractFactory("SnowdogSeller");
  const snowdogSeller = await SnowdogSeller.deploy(
    config.snowdog,
    config.mim,
    config.snowdogMimLp,
    config.router,
    config.recipient,
  );
  await snowdogSeller.deployed();

  console.log("SnowdogSeller deployed to:", snowdogSeller.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });