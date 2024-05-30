const { ethers } = require("hardhat");

async function main() {
//   const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  console.log("NFT Marketplace deployed to:", await nftMarketplace.getAddress()); 

  const myTokenAddress = await nftMarketplace.getTokenAddress();
  console.log("MyToken address:", myTokenAddress);

  await nftMarketplace.mintToken(ethers.parseEther('1'), 'https://cdn.mos.cms.futurecdn.net/pbGaKDvUkzQ4UhBj7kDoM5-970-80.jpg.webp');
  await nftMarketplace.mintToken(ethers.parseEther('2'), 'https://cdn.mos.cms.futurecdn.net/jRHS2UWAU3VBmXgEbFi4PG-970-80.jpeg.webp');
  await nftMarketplace.mintToken(ethers.parseEther('3'), 'https://crimson-cheerful-eagle-290.mypinata.cloud/ipfs/bafybeiddt7fzfxjgort2s7tpue576p2fogr3a5aiu7qfjbdllaqajjprhu');
  // await nftMarketplace.connect(otherAccount).buy(0, {value: ethers.parseEther('1')});
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });