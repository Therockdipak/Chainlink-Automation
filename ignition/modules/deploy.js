// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("LockModule", (m) => {

  const interval = 60;
  const lock = m.contract("DBank", [interval]);
   
  return { lock };
});

// 0x5FbDB2315678afecb367f032d93F642f64180aa3 hardhat node
// 0x648932de455313BF9603dcCC57BDebf059d8f8B9 sepolia