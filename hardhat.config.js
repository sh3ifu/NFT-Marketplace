require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  paths: {
    artifacts: './src/artifacts'
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/` + process.env.REACT_APP_INFURA_PRIVATE_KEY,
      accounts: [process.env.REACT_APP_DEPLOYMENT_PRIVATE_KEY],
    },
  }
};
