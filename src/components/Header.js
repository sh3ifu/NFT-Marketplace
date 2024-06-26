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
    const defaultImageURL = 'https://crimson-cheerful-eagle-290.mypinata.cloud/ipfs/QmWmUTrHfE3nuCVczSrn1kfZ1gcNLWnmUYgWAJewE7HKqn';
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenProcessModal, setIsOpenProcessModal] = useState(false);
    const [isOpenFailedModal, setIsOpenFailedModal] = useState(false);
    const [isOpenCompletedModal, setIsOpenCompletedModal] = useState(false);
    const [file, setFile] = useState(defaultImageURL);
    const [filePreview, setFilePreview] = useState(defaultImageURL);
    const [price, setPrice] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    
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
    const handleNameChange = (e) => setName(e.target.value);
    const handleDescriptionChange = (e) => setDescription(e.target.value);


    useEffect(() => {
        if(checkMetamask()) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);            
        }

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

    async function uploadJSON(name, description, image) {
        try {
            const jsonData = {
                name: name,
                description: description,
                image: image
            };
    
            const jsonBlob = new Blob([JSON.stringify(jsonData)], { type: "application/json" });
    
            const formData = new FormData();
            formData.append("file", jsonBlob, name + '.json');
    
            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
                    pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY
                }
            });
    
            const jsonUrl = "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash;
            return jsonUrl;
        } catch (error) {
            console.error("Error uploading JSON to IPFS:", error);
        }
    }

    async function mintNft() {
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
            setIsUploading(true);
            setIsOpenProcessModal(true);
            const imageUrl = await uploadImage();
            const metadataURL = await uploadJSON(name, description, imageUrl);
            setIsUploading(false);
            setIsOpen(false);
            await contract.mintToken(convertedPrice, metadataURL);
            onNewNft();
            setIsOpenProcessModal(false);
            setIsOpenCompletedModal(true);
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

    function handleAccountsChanged(accounts) {
        try {
            const shortAddress = accounts[0].slice(0, 4) + '...' + accounts[0].slice(-3);
            setAccount(shortAddress);
        } catch(err) {
            setAccount('Connect');
            console.log(err);
        }
    }

    function checkMetamask() {
        if (typeof window.ethereum !== 'undefined') return true;
        else return false;
    }

    function openModal() {        
        setName('');
        setDescription('');
        setPrice('');
        setFilePreview(defaultImageURL);
        setFile(defaultImageURL);
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
                <div className="inputName">
                    <label>Name:</label>
                    <input id="inputName" value={name} placeholder="Token name" onChange={handleNameChange} />
                </div>
                <div className="inputDescription">
                    <label>Description:</label>
                    <textarea id="inputDescription" value={description} placeholder="Description" maxLength="600" onChange={handleDescriptionChange} />
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
                <p id="processMessage">{isUploading ? 'Uploading to IPFS...' : 'Initializing transaction...'}</p>
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
