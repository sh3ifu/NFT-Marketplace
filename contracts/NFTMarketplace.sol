// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./MyToken.sol";

contract NFTMarketplace {
    using Counters for Counters.Counter;
    Counters.Counter private _items;
    MyToken mytoken;
    address owner;
    uint minimumPrice = 0.001 ether;

    struct MarketplaceItem {
        uint nftId;
        uint price;
        address seller;
        address buyer;
        address contractAddress;
        bool sold;
    }

    mapping(uint256 => MarketplaceItem) private idToMarketplaceItem;


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

        _items.increment();
    }

    function buy(uint id) external payable{
        require(msg.value == idToMarketplaceItem[id].price, "Price must be equal to listing price");

        idToMarketplaceItem[id].buyer = msg.sender;
        idToMarketplaceItem[id].sold = true;

        mytoken.transferFrom(address(this), msg.sender, idToMarketplaceItem[id].nftId);
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


    // Fucking Metamask!!!
    fallback() external payable {
        // console.log("----- fallback:", msg.value);
    }

    receive() external payable {
        // console.log("----- receive:", msg.value);
    }

    function supportsInterface(bytes4 interfaceID) external pure returns (bool) {
        return interfaceID == type(IERC721).interfaceId;
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }
}

