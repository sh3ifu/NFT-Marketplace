import jsonData from "./deployedContractsAddresses.json";
import Sad from '../assets/sad.png';
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import { Dropdown, Button, Space, Input, message } from "antd";
import { debounce } from 'lodash';
import axios from 'axios';
import './MainArea.css';
import Block from './Block';
import { ethers } from "ethers";
import { useState, useEffect, useCallback } from 'react';
import { DownOutlined} from '@ant-design/icons';

const nftMarketplaceAddress = jsonData.NFTMarketplaceAddress;
const deploymentPrivateKey = process.env.REACT_APP_DEPLOYMENT_PRIVATE_KEY;
// const deploymentPrivateKey = 'f7e4ffaa0952bd30ae920007618c6aa3bdef186446d9778087cb2b08f09c4d32';

function MainArea({ view, newNftAdded }) {
    const [nfts, setNfts] = useState([]);
    const [searchText, setSearchText] = useState("");
    
    const fetchData = useCallback(async () => {
        console.log('fetchData called');
        
        let provider;
        let wallet;
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            wallet = new ethers.Wallet(deploymentPrivateKey, provider);
        } catch(err) {
            alert('Please connect to Metamask network Sepolia');
            console.log(err);
            return;
        }
        const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, wallet);
    
        let nftIds = [];
        if (view === 'Market') {
            try {
                nftIds = await getUnsoldNftIds(wallet);
            } catch(err) {
                alert('Switch network to Sepolia');
                console.log(err);
                return;
            }
        } else if (view === 'My NFT') {
            let signer = null;
            try {
                signer = await provider.getSigner();
            } catch (err) {
                alert('Error connecting to Metamask');
                console.log(err);
                return;
            }
            try{
                nftIds = await contract.getUserItems(signer.address);
            } catch(err) {
                alert('Switch network to Sepolia');
                console.log(err);
                return;
            }
        }
    
        // console.log('NFT IDs:', nftIds);
    
        const nftData = [];
    
        for (let id of nftIds) {
            const tokenID = id;
            const tokenURI = await contract.getTokenURI(tokenID);
            const price = await contract.getPrice(tokenID);
            const sellerAddress = await contract.getSellerAddress(tokenID);
            
            let response = '';
            try {
                response = await axios.get(tokenURI);
            } catch(err) {
                alert('Error loading NFT. Please disable your ad blocker and refresh page.');                
                console.log(err);
                return;
            }
            const jsonData = response.data;
            const imageUrl = jsonData.image;
            const name = jsonData.name;
            const description = jsonData.description;
    
            if(name.toLowerCase().includes(searchText.toLowerCase()) || searchText.length === 0) {
                nftData.push({
                    name: name,
                    imageUrl: imageUrl,
                    description: description,
                    sellerAddress: sellerAddress.slice(0, 4) + '...' + sellerAddress.slice(-4),
                    tokenID: tokenID.toString(),
                    price: ethers.formatEther(String(price))
                });
            }
        }
    
        console.log('Fetched NFTs:', nftData);
        setNfts(nftData);
    }, [view, newNftAdded, searchText]);

    const debouncedFetchData = useCallback(debounce(fetchData, 300), [fetchData]);

    useEffect(() => {
        debouncedFetchData();
        console.log('MainArea useEffect triggered with newNftAdded:', newNftAdded);
    }, [view, newNftAdded, debouncedFetchData]);

    useEffect(() => {
        let provider;
        let wallet;
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            wallet = new ethers.Wallet(deploymentPrivateKey, provider);
        } catch(err) {
            alert('Please connect to Metamask network Sepolia');
            console.log(err);
            return;
        }
        const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, wallet);

        const handleMint = (tokenId, price, seller) => {
            console.log(`Mint event detected: tokenId=${tokenId}, price=${price}, seller=${seller}`);
            fetchData();  // Call fetchData to update the NFT list
        };

        const handleBuy = (tokenId, price, buyer) => {
            console.log(`Buy event detected: tokenId=${tokenId}, price=${price}, buyer=${buyer}`);
            fetchData();  // Call fetchData to update the NFT list
        };

        contract.on("Mint", handleMint);
        contract.on("Buy", handleBuy);

        // Cleanup function to remove event listeners
        return () => {
            contract.off("Mint", handleMint);
            contract.off("Buy", handleBuy);
        };
    }, [fetchData]);

    async function getUnsoldNftIds(wallet) {
        let nftIds = [];
        try {
            const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, wallet);
            nftIds = await contract.getUnsoldItems();
            nftIds = Array.from(nftIds).map(item => parseInt(item));
            return nftIds;
        } catch(err) {
            console.log(err);
            alert('Please connect to Metamask network Sepolia');
            return;
        }        
    }

    const handleMenuClick = (e) => {
        let sortedNfts = [...nfts];
        if (e.key === '1') {
            sortedNfts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            message.info({content: 'Sorted by price high to low', className: 'custom-message',});
        } else {
            sortedNfts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            message.info({content: 'Sorted by price low to high', className: 'custom-message',});
        }
        setNfts(sortedNfts);
    };
      
    const items = [
        {
          label: 'Price high to low',
          key: '1',
        },
        {
          label: 'Price low to high',
          key: '2',
        },
    ];

    const menuProps = {
        items,
        onClick: handleMenuClick,
    };

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
        fetchData();
    };

    return(
        <div className="mainArea">
             <div className="topArea">
                {((nfts.length > 0 && view === 'My NFT') || (view === 'Market')) && (
                    <Input placeholder="token name" onChange={handleSearchChange} className="search-input"/>    
                )}
                {(nfts.length > 0) && (
                    <Dropdown menu={menuProps} overlayClassName="custom-dropdown">
                        <Button className="sorting-button">
                            <Space>
                                Sorting
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>
                )}
            </div>            

            <div className="bottomArea">
                {nfts.length === 0 && (
                    <div className="no-nfts">
                        <p>Nothing here</p>
                        <img src={Sad} alt="No NFTs" />
                    </div>
                )}

                {nfts.map((nft, index) => (
                    <Block onUpdateNfts={fetchData} key={index} imageUrl={nft.imageUrl} tokenID={nft.tokenID} price={nft.price} name={nft.name} description={nft.description} sellerAddress={nft.sellerAddress} view={view} />
                ))}
            </div>
        </div>
    );    
}

export default MainArea;
