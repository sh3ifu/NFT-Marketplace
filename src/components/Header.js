import jsonData from "./deployedContractsAddresses.json";
import axios from 'axios';
import { Modal, Flex, Radio } from "antd";
import { ethers } from "ethers";
import { useState, useEffect } from 'react';
import './Header.css';
import './Modal.css';
import Failed from "../assets/failed.png";
import Loading from "../assets/loading.png";
import Completed from "../assets/completed.png";
import Nft from "../assets/nft.png";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

const FormData = require("form-data");

const nftMarketplaceAddress = jsonData.NFTMarketplaceAddress;


function Header({ onNewNft, setView }) {
    const defaultImageURL = 'https://crimson-cheerful-eagle-290.mypinata.cloud/ipfs/bafybeiddt7fzfxjgort2s7tpue576p2fogr3a5aiu7qfjbdllaqajjprhu';
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenProcessModal, setIsOpenProcessModal] = useState(false);
    const [isOpenFailedModal, setIsOpenFailedModal] = useState(false);
    const [isOpenCompletedModal, setIsOpenCompletedModal] = useState(false);
    const [file, setFile] = useState(defaultImageURL);
    const [filePreview, setFilePreview] = useState(defaultImageURL);
    const [price, setPrice] = useState('');
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFilePreview(selectedFile);
        setFile(selectedFile);
    
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        if (selectedFile) {
          reader.readAsDataURL(selectedFile);
        }
    };
    const handlePriceChange = (e) => setPrice(e.target.value);

    useEffect(() => {
        if(checkMetamask()) 
            window.ethereum.on('accountsChanged', handleAccountsChanged);        

        return () => {
            // Remove the event handler when the component is unmounted
            if (checkMetamask())
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);            
        };
    }, []);

    async function uploadImage() {
        try {
            const fileData = new FormData();
            fileData.append('file', file);

            const responseData = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: fileData,
                headers: {
                    pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
                    pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
                    "Content-Type": "multipart/form-data",
                }
            });
            const fileUrl = "https://gateway.pinata.cloud/ipfs/" + responseData.data.IpfsHash;
            return fileUrl;
        } catch(err) {
            console.log(err);
        }
    }

    async function mintNft() {
        const fileUrl = await uploadImage();
        let signer = null;

        // Try to connect metamask
        try {
            signer = await provider.getSigner();
        } catch(err) {
            alert('Please connect to Metamask');            
            console.log(err);
            setIsOpen(false);
            return;
        }

        // Try to convert price into BigInt
        let convertedPrice = ethers.parseEther('0.001');
        try {
            convertedPrice = ethers.parseEther(price);            
        } catch(err) {
            console.log(err);
            alert('Incorrect price!');
            return;
        }

        const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, signer);
        
        // Try to mint a token
        try {
            setIsOpenProcessModal(true);
            setIsOpen(false);
            await contract.mintToken(convertedPrice, fileUrl);
            setIsOpenProcessModal(false);
            setIsOpenCompletedModal(true);
            onNewNft();
        } catch(err) {
            setIsOpen(false);
            setIsOpenProcessModal(false);
            setIsOpenFailedModal(true);
            console.log(err);
        }
    }

    async function requestAccount() {
        if (!checkMetamask()) {
            alert('Metamask is not installed');
            return;
        }

        try {
            setProvider(new ethers.BrowserProvider(window.ethereum));
            const accounts = await provider.send('eth_requestAccounts', []);
            const shortAddress = accounts[0].slice(0, 4) + '...' + accounts[0].slice(-3);
            setAccount(shortAddress);
        } catch (error) {
            alert('Error connecting to MetaMask');
        }
    }

    // Account change event handler
    function handleAccountsChanged(accounts) {
        const shortAddress = accounts[0].slice(0, 4) + '...' + accounts[0].slice(-3);
        setAccount(shortAddress);
    }

    function checkMetamask() {
        if (typeof window.ethereum !== 'undefined') return true;
        else return false;
    }

    function openModal() {        
        setIsOpen(true);
    }

    return (
        <>
        <Modal open={isOpen} footer={null} onCancel={() => setIsOpen(false)} title="Create NFT" className="create-modal">
            <div className="modal">
                <img className="previewImg" src={filePreview} />
                <div className="fileUpload">
                    <label>Upload File:</label>
                    <input className="selectFile" type="file" onChange={handleFileChange} accept=".png, .jpg, .jpeg, .webp, .gif"/>
                </div>
                <div className="inputPrice">
                    <label>Price (ETH):</label>
                    <input id="inputPrice" value={price} placeholder=">= 0.001" onChange={handlePriceChange} />
                </div>
                <button className="mintBtn" onClick={mintNft}>Mint</button>
            </div>
        </Modal>

        <Modal open={isOpenProcessModal} footer={null} onCancel={() => setIsOpen(setIsOpenProcessModal)} className="processing-modal">
            <div className="processing">
                <div id="processing">
                    <img id="loadingImg" src={Loading}></img>
                    <p>Processing...</p>
                </div>
                <p id="processMessage">Initializing transaction...</p>
            </div>
        </Modal>
        <Modal open={isOpenFailedModal} footer={null} onCancel={() => setIsOpen(setIsOpenFailedModal)} className="failed-modal">
            <div className="failed">
                <img id="failedImg" src={Failed}></img>
                <p id="failedMessage">Minting failed...</p>
            </div>
        </Modal>
        <Modal open={isOpenCompletedModal} footer={null} onCancel={() => setIsOpen(setIsOpenCompletedModal)} className="completed-modal">
            <div className="completed">
                <img id="completedImg" src={Completed}></img>
                <p id="completedMessage">Minting completed</p>
            </div>
        </Modal>

        <div className="header">
            <div className="leftBlock">
                <img src={Nft}></img>
                <h1>NFT Marketplace</h1>
            </div>
            <div className="middleBlock">
                <Flex vertical gap="middle">
                    <Radio.Group defaultValue="a" buttonStyle="solid">
                        <Radio.Button value="a" onClick={() => setView('Market')}>Market</Radio.Button>
                        <Radio.Button value="b" onClick={() => setView('My NFT')}>My NFT</Radio.Button>                        
                    </Radio.Group>
                </Flex>
            </div>
            <div className="rightButtons">
                <button className="connectBtn" onClick={() => openModal(1)}>Create</button>                
                <button className="connectBtn" onClick={requestAccount}>{account ? account : 'Connect'}</button>
            </div>
        </div>
        </>
    );
}

export default Header;
