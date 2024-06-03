const { ethers } = require("hardhat");

async function main() {
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  console.log("\nMarketplace address:\t", await nftMarketplace.getAddress()); 

  const myTokenAddress = await nftMarketplace.getTokenAddress();
  console.log("MyToken address:\t", myTokenAddress);

  await nftMarketplace.mintToken(ethers.parseEther('0.1'), 'https://crimson-cheerful-eagle-290.mypinata.cloud/ipfs/QmUgybSeBieciwoQ1MefkXEmqT2QKoQMzeiwgPDmUrZhps');
  await nftMarketplace.mintToken(ethers.parseEther('7'), 'https://crimson-cheerful-eagle-290.mypinata.cloud/ipfs/QmQbwFfi2aRGyGd8fvSEMTy5tdWVuATAnyd84hBtMUCGzD');
  await nftMarketplace.mintToken(ethers.parseEther('0.05'), 'https://crimson-cheerful-eagle-290.mypinata.cloud/ipfs/QmVjD6FBfvwLb4kQYMTjtmdrSWt3P7GYsJgvcAdHJTkTaZ');
  await nftMarketplace.mintToken(ethers.parseEther('4.3'), 'https://crimson-cheerful-eagle-290.mypinata.cloud/ipfs/QmULTdLLyywhKXh3HSDV5CN6Czb2QgHNHSTpbnbqXoKT6R');
  await nftMarketplace.mintToken(ethers.parseEther('2.9'), 'https://crimson-cheerful-eagle-290.mypinata.cloud/ipfs/QmQu3mbQiEUoa4i2r37ESrpWGpYJC86mS1Cn57FmXVpxrH');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });