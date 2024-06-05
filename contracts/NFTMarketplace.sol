// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Counters.sol";

import "./MyToken.sol";

contract NFTMarketplace {
    using Counters for Counters.Counter;
    Counters.Counter private _items;
    MyToken mytoken;
    address owner;
    uint minimumPrice = 0.001 ether;
    uint contractBalance;

    struct MarketplaceItem {
        uint nftId;
        uint price;
        address seller;
        address buyer;
        address contractAddress;
        bool sold;
    }

    mapping(uint256 => MarketplaceItem) private idToMarketplaceItem;

    event Mint(uint tokenId, uint price, address seller);
    event Buy(uint tokenId, uint price, address buyer);

    constructor() {
        mytoken = new MyToken(address(this));
        owner = msg.sender;
    }

    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external pure returns (bytes4){        
        return IERC721Receiver.onERC721Received.selector;
    }

    function getTokenAddress() public view returns (address) {
        return address(mytoken);
    }

    function mintToken(uint price, string memory uri) external{
        require(price >= minimumPrice, "The price must be greater than the minimumPrice 0.001 ether");
        
        uint nftId = mytoken.safeMint(address(this), uri);
        
        idToMarketplaceItem[_items.current()] = MarketplaceItem(
            nftId,
            price,
            msg.sender,
            address(0),
            getTokenAddress(),
            false
        );

        emit Mint(_items.current(), price, msg.sender);
        _items.increment();
    }

    function withdraw() external {
        require(msg.sender == owner, "You are not an owner");

        contractBalance = 0;

        payable(msg.sender).transfer(contractBalance);
    }

    function buy(uint id) external payable{
        require(msg.value == idToMarketplaceItem[id].price, "Price must be equal to listing price");

        idToMarketplaceItem[id].buyer = msg.sender;
        idToMarketplaceItem[id].sold = true;

        uint256 commission = msg.value * 5 / 100;
        uint256 sellerAmount = msg.value - commission;
        contractBalance += commission;

        payable(idToMarketplaceItem[id].seller).transfer(sellerAmount);
        mytoken.transferFrom(address(this), msg.sender, idToMarketplaceItem[id].nftId);

        emit Buy(id, msg.value, msg.sender);
    }

    function getUnsoldItems() external view returns(uint[] memory) {
        uint i = 0;
        uint[] memory unsoldIds = new uint[](_items.current());

        for(uint item = 0; item < _items.current(); item++){
            if(!idToMarketplaceItem[item].sold){
                unsoldIds[i] = item;
                i++;
            }
        }

        uint[] memory result = new uint[](i);
        for (uint j = 0; j < i; j++) {
            result[j] = unsoldIds[j];
        }

        return result;
    }

    function getItem(uint id) external view returns(MarketplaceItem memory) {
        return idToMarketplaceItem[id];
    }

    function getPrice(uint id) external view returns(uint) {
        return idToMarketplaceItem[id].price;
    }

    function getSellerAddress(uint id) external view returns(address) {
        return idToMarketplaceItem[id].seller;
    }

    function getBalanceOf(address _owner) external view returns(uint) {
        return mytoken.balanceOf(_owner);
    }

    function getName() external view returns(string memory) {
        return mytoken.name();
    }

    function getSymbol() external view returns(string memory) {
        return mytoken.symbol();
    }

    function getOwnerOf(uint tokenId) external view returns(address) {
        return mytoken.ownerOf(tokenId);
    }

    function getTokenURI(uint tokenId) external view returns(string memory) {
        return mytoken.tokenURI(tokenId);
    }

    
    function getUserItems(address user) public view returns (uint256[] memory) {
        uint i = 0;
        uint[] memory userIds = new uint[](_items.current());

        for(uint id = 0; id < _items.current(); id++){
            if(mytoken.ownerOf(id) == user) {
                userIds[i] = id;
                i++;
            }
        }

        uint[] memory result = new uint[](i);
        for (uint j = 0; j < i; j++) {
            result[j] = userIds[j];
        }

        return result;
    }
}

