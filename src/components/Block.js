import jsonData from "./deployedContractsAddresses.json";
import { ethers } from "ethers";
import './Block.css';
import './Modal.css';
import { Modal } from "antd";
import { useState } from 'react';
import Failed from "../assets/failed.png";
import Loading from "../assets/loading.png";
import Completed from "../assets/completed.png";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

const nftMarketplaceAddress = jsonData.NFTMarketplaceAddress;

function Block(props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenProcessModal, setIsOpenProcessModal] = useState(false);
    const [isOpenFailedModal, setIsOpenFailedModal] = useState(false);
    const [isOpenCompletedModal, setIsOpenCompletedModal] = useState(false);

    async function buy() {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, signer);

        try{
            setIsOpenProcessModal(true);
            await contract.buy(props.tokenID, {value: ethers.parseEther(props.price)});
            setIsOpenCompletedModal(true);
            setIsOpenProcessModal(false);
            props.onUpdateNfts();
        } catch(err) {
            setIsOpenProcessModal(false);
            setIsOpenFailedModal(true);
            console.log(err);
        }
    }

    return(
        <>
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
                <p id="failedMessage">Buying failed...</p>
            </div>
        </Modal>
        <Modal open={isOpenCompletedModal} footer={null} onCancel={() => setIsOpen(setIsOpenCompletedModal)} className="completed-modal">
            <div className="completed">
                <img id="completedImg" src={Completed}></img>
                <p id="completedMessage">Buying completed</p>
            </div>
        </Modal>
        
        <div className="block">            
            <img src={props.imageUrl}></img>
            <div className='nftInfo'>
                <p>Token ID #{props.tokenID}</p>
                <p id='nftPrice'>{props.price} ETH</p>
            </div>            
            <button className='buyButton' onClick={buy}>Buy</button>
        </div>
        </>
    );    
}

export default Block;