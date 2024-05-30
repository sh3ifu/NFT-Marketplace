import jsonData from "./deployedContractsAddresses.json";
import './MainArea.css';
import Block from './Block';
import { ethers } from "ethers";
import { useState, useEffect } from 'react';
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

const nftMarketplaceAddress = jsonData.NFTMarketplaceAddress;
const deploymentPrivateKey = jsonData.deploymentPrivateKey;

function MainArea({ newNftAdded }) {
    const [nfts, setNfts] = useState([]);
    
    async function fetchData() {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const wallet = new ethers.Wallet(deploymentPrivateKey, provider);

        const nftIds = await getUnsoldNftIds(wallet);
        const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, wallet);
        
        const nftData = [];

        for (let id of nftIds) {
            const tokenID = id;
            const tokenURI = await contract.getTokenURI(tokenID);
            const price = await contract.getPrice(tokenID);

            nftData.push({
                imageUrl: tokenURI,
                tokenID: tokenID.toString(),
                price: ethers.formatEther(String(price))
            });
        }

        setNfts(nftData);
    }

    useEffect(() => {
        fetchData();
    }, [newNftAdded]);

    async function getUnsoldNftIds(wallet) {
        const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, wallet);
        let nftIds = await contract.getUnsoldItems();
        nftIds = Array.from(nftIds).map(item => parseInt(item));
        return nftIds;
    }

    return(
        <div className="mainArea">
            {nfts.map((nft, index) => (
                <Block key={index} imageUrl={nft.imageUrl} tokenID={nft.tokenID} price={nft.price} onUpdateNfts={fetchData} />
            ))}
        </div>
    );    
}

export default MainArea;
