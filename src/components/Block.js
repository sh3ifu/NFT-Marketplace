import './Block.css';

function Block(props) {
    return(
        <div className="block">            
            <img src={props.imageUrl}></img>
            <div className='nftInfo'>
                <p>Token ID #{props.tokenID}</p>
                {/* <h3>{props.name}</h3> */}
                <p>Price {props.price} eth</p>
            </div>            
            <button className='buyButton'>Buy</button>
        </div>
    );    
}

export default Block;