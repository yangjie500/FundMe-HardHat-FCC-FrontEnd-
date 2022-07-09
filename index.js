import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constant.js";

const connectButton = document.querySelector("[data-button='connect-button']");
const fundButton = document.querySelector("[data-button='fund-button']");
const getBalanceButton = document.querySelector(
  "[data-button='balance-button']"
);
const withdrawButton = document.querySelector(
  "[data-button='withdraw-button']"
);
const ethAmountInput = document.querySelector("#fund");

const connect = async () => {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.textContent = "Connected";
  } else {
    console.log("No Metamask!");
    connectButton.textContent = "Install Metamask";
  }
};

const fund = async () => {
  const ethAmount = ethAmountInput.value;
  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum !== "undefined") {
    // provider / connection to the blockchain
    // signer / wallet / someone with gas
    // contract that we are interating with
    // ABI & Address
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    // A contract that is connected to the signer
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // listen for tx to be mined:
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (e) {
      console.log(e);
    }
  }
};

function listenForTransactionMine(transactionRespone, provider) {
  console.log(`Mining ${transactionRespone.hash}...`);
  // Listen for this transaction to finish
  return new Promise((resolve, reject) => {
    provider.once(transactionRespone.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (e) {
      console.log(e);
    }
  }
}

connectButton.addEventListener("click", async () => {
  await connect();
});

fundButton.addEventListener("click", async (e) => {
  e.preventDefault();
  await fund();
});

getBalanceButton.addEventListener("click", async () => {
  await getBalance();
});

withdrawButton.addEventListener("click", async () => {
  await withdraw();
});
