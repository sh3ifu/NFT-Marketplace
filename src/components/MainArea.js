import jsonData from "./deployedContractsAddresses.json";
import axios from 'axios';
import './MainArea.css';
import Block from './Block';
import { ethers } from "ethers";
import { useState, useEffect } from 'react';
import { DownOutlined} from '@ant-design/icons';
import { Dropdown, Button, Space, message } from "antd";
import Sad from '../assets/sad.png';
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

const nftMarketplaceAddress = jsonData.NFTMarketplaceAddress;
const deploymentPrivateKey = jsonData.deploymentPrivateKey;

function MainArea({ view, newNftAdded }) {
    const [nfts, setNfts] = useState([]);
    
    async function fetchData() {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const wallet = new ethers.Wallet(deploymentPrivateKey, provider);

        const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, wallet);
        
        let nftIds = [];
        if (view === 'Market') {
            nftIds = await getUnsoldNftIds(wallet);
        } else if (view === 'My NFT') {
            let signer = null;
            try {
                signer = await provider.getSigner();
            } catch(err) {
                alert('Error connecting to Metamask');
                console.log(err);
                return;
            }
            nftIds = await contract.getUserItems(signer.address);
        }

        const nftData = [];

        for (let id of nftIds) {
            const tokenID = id;
            const tokenURI = await contract.getTokenURI(tokenID);
            const price = await contract.getPrice(tokenID);
            
            const response = await axios.get(tokenURI);
            const jsonData = response.data;
            const imageUrl = jsonData.image;
            const name = jsonData.name;
            const description = jsonData.description;

            nftData.push({
                name: name,
                imageUrl: imageUrl,
                description: description,
                tokenID: tokenID.toString(),
                price: ethers.formatEther(String(price))
            });
        }

        setNfts(nftData);
    }

    useEffect(() => {
        fetchData();
    }, [view, newNftAdded]);

    async function getUnsoldNftIds(wallet) {
        const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, wallet);
        let nftIds = await contract.getUnsoldItems();
        nftIds = Array.from(nftIds).map(item => parseInt(item));
        return nftIds;
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

    return(
        <div className="mainArea">
             <div className="topArea">
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
                    <Block key={index} imageUrl={nft.imageUrl} tokenID={nft.tokenID} price={nft.price} name={nft.name} description={nft.description} view={view} onUpdateNfts={fetchData} />
                ))}
            </div>
        </div>
    );    
}

export default MainArea;
