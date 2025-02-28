import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "./contract/DBank.json"; // Ensure ABI is added in your frontend project
import "./App.css";
const contractAddress = "0x648932de455313BF9603dcCC57BDebf059d8f8B9";

export default function App() {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [balance, setBalance] = useState("0");
    const [amount, setAmount] = useState("0");
    const [recipient, setRecipient] = useState("");

    useEffect(() => {
        const initProvider = async () => {
            if (window.ethereum) {
                const web3Provider = new ethers.BrowserProvider(window.ethereum);
                setProvider(web3Provider);
                const signer = await web3Provider.getSigner();
                setAccount(await signer.getAddress());
                const contractInstance = new ethers.Contract(contractAddress, contractABI.abi, signer);
                setContract(contractInstance);
            }
        };
        initProvider();
    }, []);

    const createAccount = async () => {
        if (!contract) return;
        const tx = await contract.createAccount();
        await tx.wait();
        alert("Account created!");
    };

    const deposit = async () => {
        if (!contract) return;
        const tx = await contract.deposit({ value: ethers.parseEther(amount) });
        await tx.wait();
        alert("Deposit successful!");
    };

    const withdraw = async () => {
        if (!contract) return;
        const tx = await contract.withdraw(ethers.parseEther(amount));
        await tx.wait();
        alert("Withdrawal successful!");
    };

    const transfer = async () => {
        if (!contract) return;
        const tx = await contract.transfer(recipient, ethers.parseEther(amount));
        await tx.wait();
        alert("Transfer successful!");
    };

    const checkBalance = async () => {
        if (!contract) return;
        const bal = await contract.getAccountBalance(account);
        setBalance(ethers.formatEther(bal));
    };

    const checkUpkeep = async () => {
        if (!contract) return;
        const [upkeepNeeded, performData] = await contract.checkUpkeep("0x");
        alert(`Upkeep Needed: ${upkeepNeeded}, Perform Data: ${performData}`);
    };

    const performUpkeep = async () => {
        if (!contract) return;
        const tx = await contract.performUpkeep("0x");
        await tx.wait();
        alert("Auto-withdraw executed!");
    };

    return (
        <div style={{ padding: "20px" }}>
            <br></br>
            <h1>Decentralised Bank DApp</h1>
            <p>Connected Account: {account || "Not Connected"}</p>
            <p>Balance: {balance} ETH</p>
            <button onClick={createAccount}>Create Account</button>
            <br /><br />
            <input type="text" placeholder="Amount in ETH" onChange={(e) => setAmount(e.target.value)} />
            <br></br>
            <button onClick={deposit}>Deposit</button>
            <button onClick={withdraw}>Withdraw</button>
            <br /><br />
            <input type="text" placeholder="Recipient Address" onChange={(e) => setRecipient(e.target.value)} />
            <br></br>
            <button onClick={transfer}>Transfer</button>
            <br /><br />
            <button onClick={checkBalance}>Check Balance</button>
            <br /><br />
            <button onClick={checkUpkeep}>Check Upkeep (Automation)</button>
            <button onClick={performUpkeep}>Perform Upkeep (Automation)</button>
        </div>
    );
}
