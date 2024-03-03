import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import contractABI from './contractABI.json';
import BigNumber from 'bignumber.js';
const contractAddress = '0x479F69405682FeDA9aad88763432DB1ade4cb67D';

function App() {
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [totalSupply, setTotalSupply] = useState('');
  const [tokenDetails, setTokenDetails] = useState({ name: '', symbol: '', address: '' });
  const [connected, setConnected] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      alert('Please enter a valid address and amount.');
      return;
    }
  
    try {
      const decimals = await contract.methods.decimals().call();
      const amountToSend = new BigNumber(transferAmount).multipliedBy(new BigNumber(10).pow(decimals));
      
      await contract.methods.transfer(transferTo, amountToSend.toFixed(0)).send({ from: accounts[0] });
      alert('Transfer successful');
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed: ' + error.message);
    }
  };
  
  

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      await provider.request({ method: 'eth_requestAccounts' });
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
      const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
      setContract(contractInstance);
      const accounts = await web3Instance.eth.getAccounts();
      setAccounts(accounts);
      setConnected(true);
      // Fetching token details
      const name = await contractInstance.methods.name().call();
      const symbol = await contractInstance.methods.symbol().call();
      setTokenDetails({ name, symbol, address: contractAddress });
    } else {
      alert('Please install MetaMask!');
    }
  };

  useEffect(() => {
    const init = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);
        const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
        setContract(contractInstance);
        const accounts = await web3Instance.eth.getAccounts();
        setAccounts(accounts);
      } else {
        alert('Please install MetaMask!');
      }
    };

    init();
  }, []);

  const getTotalSupply = async () => {
    try {
      const supply = await contract.methods.totalSupply().call();
      const decimals = await contract.methods.decimals().call();
      const adjustedSupply = new BigNumber(supply).dividedBy(new BigNumber(10).pow(decimals));
      setTotalSupply(adjustedSupply.toString());
      const symbol = await contract.methods.symbol().call();
      setTokenSymbol(symbol);
    } catch (error) {
      console.error('Error in getTotalSupply:', error);
      alert('Failed to fetch total supply');
    }
  };
  
  
 
  return (
       <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {!connected ? (
        <button onClick={connectWallet}>Connect to MetaMask</button>
      ) : (
        <div>
         <h2>Token Details</h2>
          <p>Name: {tokenDetails.name}</p>
          <p>Symbol: {tokenDetails.symbol}</p>
          <p>Contract Address: {tokenDetails.address}</p>
          <button onClick={getTotalSupply}>Total Supply</button>
          <div>
            Total Supply: {totalSupply} {tokenSymbol}
          </div>
          <h3>Transfer Tokens</h3>
          <input
            type="text"
            placeholder="Recipient Address"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <button onClick={handleTransfer}>Transfer</button>
        </div>
      )}
    </div>
  );
}

export default App;
