const { ethers } = require("hardhat");

async function main() {
//   const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  console.log("NFT Marketplace deployed to:", await nftMarketplace.getAddress()); 

  const myTokenAddress = await nftMarketplace.getTokenAddress();
  console.log("MyToken address:", myTokenAddress);

  await nftMarketplace.mintToken(ethers.parseEther('2'), 'https://crimson-cheerful-eagle-290.mypinata.cloud/ipfs/QmPf7bRkpSKvLyPsReVBNXCJfwqLCEFSYesaUWipRWfif4');
  await nftMarketplace.mintToken(ethers.parseEther('3'), 'https://crimson-cheerful-eagle-290.mypinata.cloud/ipfs/QmUT3KBLk9qpoeWGFg3xpEe3ZfmCiWD3PKtXzFbfVBhW2M');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });