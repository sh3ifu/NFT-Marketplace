const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  async function deployFixture() {

    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const nftMarketplace = await NFTMarketplace.deploy();    

    return { nftMarketplace, owner, otherAccount, thirdAccount };
  }

  async function mintFixture() {
    const price = ethers.parseEther('1');
    const { nftMarketplace, owner, otherAccount, thirdAccount} = await loadFixture(deployFixture);

    await nftMarketplace.connect(otherAccount).mintToken(price, 'something');

    return {nftMarketplace, owner, otherAccount, thirdAccount, price};
  }

  async function buyFixture() {
    const {nftMarketplace, owner, otherAccount, thirdAccount, price} = await loadFixture(mintFixture);
    
    await nftMarketplace.connect(thirdAccount).buy(0, {value: price});

    return {nftMarketplace, owner, otherAccount, thirdAccount, price};
  }

  describe.skip("Deployment", function () {
    it("Should deploy contract correctly", async function () {
      const { nftMarketplace, owner } = await loadFixture(deployFixture);
      // console.log(nftMarketplace);
      // console.log(owner);

      // expect(await lock.unlockTime()).to.equal(unlockTime);
    });
  });

  describe("Minting", function () {
    it("Should fail if price < minimumPrice", async function () {
      const { nftMarketplace, otherAccount} = await loadFixture(deployFixture);

      await expect(nftMarketplace.connect(otherAccount).mintToken(1, 'asdf')).to.be.revertedWith("The price must be greater than the minimumPrice 0.001 ether");
    });
  });

  describe("Get functions testing", function () {    
    it("Should return correct price", async function () {
      const { nftMarketplace, price} = await loadFixture(mintFixture);
      expect(await nftMarketplace.getPrice(0)).to.equal(price);
    });

    it("Should return correct balanceOf", async function () {
      const {nftMarketplace, thirdAccount} = await loadFixture(buyFixture);
      expect(await nftMarketplace.getBalanceOf(thirdAccount)).to.equal(1);
    });

    it("Should return correct Name", async function () {
      const {nftMarketplace} = await loadFixture(mintFixture);
      expect(await nftMarketplace.getName()).to.equal('MyToken');
    });

    it("Should return correct Symbol", async function () {
      const {nftMarketplace} = await loadFixture(mintFixture);
      expect(await nftMarketplace.getSymbol()).to.equal('MTK');
    });

    it("Should return correct ownerOf after buying", async function () {
      const {nftMarketplace, thirdAccount} = await loadFixture(buyFixture);
      expect(await nftMarketplace.getOwnerOf(0)).to.equal(thirdAccount);
    });

    it("Should return correct tokenURI", async function () {
      const {nftMarketplace} = await loadFixture(mintFixture);
      expect(await nftMarketplace.getTokenURI(0)).to.equal('something');
    });

    it.only("Should return array of unsold NFT's", async function () {
      const price = ethers.parseEther('1');
      const {nftMarketplace, owner, otherAccount, thirdAccount} = await loadFixture(deployFixture);

      await nftMarketplace.connect(owner).mintToken(price, '0');
      await nftMarketplace.connect(otherAccount).mintToken(price, '1');
      await nftMarketplace.connect(otherAccount).mintToken(price, '2');

      await nftMarketplace.connect(thirdAccount).buy(1, {value: price});

      // console.log(await nftMarketplace.getUnsoldItems(););
      // console.log(typeof await nftMarketplace.getItem(2));
      // console.log(await nftMarketplace.getItem(1));
    });
  });
});
