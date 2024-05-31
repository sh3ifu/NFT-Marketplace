import './App.css';
import Header from './components/Header';
import MainArea from './components/MainArea';
import { useState} from 'react';
import GitHub from './assets/github.png';
import LinkedIn from './assets/linkedin.png';

function App() {
  const [newNftAdded, setNewNftAdded] = useState(false);
  const [view, setView] = useState('Market');

  const handleNewNft = () => {
    setNewNftAdded(!newNftAdded); // Toggle state to trigger re-render
  };

  return (
    <div className="App">
      <Header onNewNft={handleNewNft} setView={setView}/>
      <MainArea newNftAdded={newNftAdded} view={view}/>

      <footer>
        <h3 className="creator">Created by Denys Datskov</h3>
        <div className="social_icons">
        <a href="https://github.com/sh3ifu/NFT-Marketplace" target="_blank" rel="noopener noreferrer">
          <img src={GitHub} className="git_ico"/>
        </a>
        <a href="https://www.linkedin.com/in/denys-datskov/" target="_blank" rel="noopener noreferrer">
          <img src={LinkedIn} className="linkedin_ico"/>
        </a>          
        </div>
      </footer>
    </div>
  );
}

export default App;
