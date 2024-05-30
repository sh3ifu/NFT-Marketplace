const { ethers } = require("hardhat");

async function main() {
//   const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  console.log("NFT Marketplace deployed to:", await nftMarketplace.getAddress()); 

  const myTokenAddress = await nftMarketplace.getTokenAddress();
  console.log("MyToken address:", myTokenAddress);

  await nftMarketplace.mintToken(ethers.parseEther('1'), 'asdf');
  // await nftMarketplace.connect(otherAccount).buy(0, {value: ethers.parseEther('1')});
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });