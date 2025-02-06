require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://optimism-sepolia.infura.io/v3/9f327af0439946aea34da3b4aab131ff",
      accounts: [process.env.PRIVATE_KEY], 
    }
  }
};