import './App.css';
import Header from './components/Header';
import MainArea from './components/MainArea';
import { useState} from 'react';


function App() {
  const [newNftAdded, setNewNftAdded] = useState(false);
  const handleNewNft = () => {
    setNewNftAdded(!newNftAdded); // Toggle state to trigger re-render
  };

  return (
    <div className="App">
      <Header onNewNft={handleNewNft}/>
      <MainArea newNftAdded={newNftAdded}/>
    </div>
  );
}

export default App;
