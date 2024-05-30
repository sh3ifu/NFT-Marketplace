import './MainArea.css';
import Block from './Block';

function MainArea() {
    return(
        <div className="mainArea">
            <Block imageUrl='https://cdn.mos.cms.futurecdn.net/mpGh6USjRkE3dPQnF8tXRC-1024-80.jpg.webp' tokenID='7' price='1'/>
            <Block imageUrl='https://www.techopedia.com/wp-content/uploads/2024/01/2-1.jpg' tokenID='11' price='5'/>
        </div>
    );    
}

export default MainArea;