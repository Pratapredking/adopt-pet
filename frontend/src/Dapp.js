import { useState, useEffect } from "react";

import { Navbar } from "./components/Navbar";
import { PetItem } from "./components/PetItem";
import { TxError } from "./components/TxError";
import { WalletNotDetected } from "./components/WalletNotDetected";
import { ConnectWallet } from "./components/ConnectWallet";
import { ethers } from "ethers";

import contractAddress from "./contracts/contract-address-localhost.json";
import PetAdoptionArtifact from "./contracts/PetAdoption.json";
import { TxInfo } from "./components/TxInfo";


const HARDHAT_NETWORK_ID = Number(process.env.REACT_APP_NETWORK_ID);



function Dapp() {
  const [pets, setPets] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [adoptedPets, setAdoptedPets] = useState([]);
  const [txError, setTxError] = useState(undefined);
  const [txInfo, setTxInfo] = useState(undefined);


  useEffect(() => {
    async function fetchPets() {
      const res = await fetch("/pets.json");
      const data = await res.json();
      setPets(data);
    }

    fetchPets();
  }, []);


  async function connectWallet() {
    try {
      const [address] = await window.ethereum.request({ method: "eth_requestAccounts" });

      await checkNetwork();

      initiliazeDapp(address);

      window.ethereum.on("accountsChanged", ([newAddress]) => {

        if (newAddress === undefined) {
          setAdoptedPets([]);
          setSelectedAddress(undefined);
          setContract(undefined);
          setTxError(undefined);
          setTxInfo(undefined);
          return;
        }

        initiliazeDapp(newAddress);
        // connection to SC
        // getting owned pets
      });

    } catch (e) {
      console.error(e.message);
    }
  }

  async function initiliazeDapp(address) {
    setSelectedAddress(address);
    const contract = await initContract();

    getAdoptedPets(contract);
  }

  async function initContract() {
    // alert("I should init the contract!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(
      contractAddress.PetAdoption,
      PetAdoptionArtifact.abi,
      signer
    );

    setContract(contract);
    return contract;
  }

  async function getAdoptedPets(contract) {
    try {
      const adoptedPets = await contract.getAllAdoptedPets();

      if (adoptedPets.length > 0) {
        console.log(adoptedPets);
        setAdoptedPets(adoptedPets.map(petIdx => Number(petIdx)));
      } else {
        setAdoptedPets([]);
      }
    } catch (e) {
      console.error("Hello Error" + e.message);
    }
  }

  async function adoptPet(id) {
    try {
      const tx = await contract.adoptPet(id);
      setTxInfo(tx.hash);

      const receipt = await tx.wait();

      await new Promise((res) => setTimeout(res, 2000));

      if (receipt.status === 0) {
        throw new Error("Transaction failed!");
      }

      alert(`Pet with id: ${id} has been adopted!`);
      setAdoptedPets([...adoptedPets, id]);
    } catch (e) {
      console.error(e.reason);
      setTxError(e?.reason);
    } finally {
      setTxInfo(undefined);
    }
  }

  async function switchNetwork() {
    const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`;

    return await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }]
    });
  }

  async function checkNetwork() {

    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID.toString()) {
      return switchNetwork();
    }

    // alert("Correct Network. Don't switch!")
    return null;
  }

  if (window.ethereum === undefined) {
    return <WalletNotDetected />
  }

  if (!selectedAddress) {
    return <ConnectWallet connect={connectWallet} />
  }

  return (
    <div className="container">
      {txInfo &&
        <TxInfo
          message={txInfo}
        />
      }
      {txError &&
        <TxError message={txError} dismiss={() => setTxError(undefined)} />
      }
      {JSON.stringify(adoptedPets)}
      <br />

      <Navbar address={selectedAddress} />



      <div className="items">
        {
          pets.map((pet) =>
            <PetItem
              key={pet.id}
              pet={pet}
              disabled={adoptedPets.includes(pet.id)}
              adoptPet={() => adoptPet(pet.id)}
            />
          )}
      </div>

    </div>
  );
}

export default Dapp;