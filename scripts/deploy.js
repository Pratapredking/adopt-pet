
const hre = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Deployment started!");

  const [deployer] = await ethers.getSigners();
  const address = await deployer.getAddress();
  console.log(`Deploying the contract with the account: ${address}`);

  const PETS_COUNT = 3;
  const PetAdoption = await hre.ethers.getContractFactory("PetAdoption");
  const contract = await PetAdoption.deploy(PETS_COUNT);

  await contract.waitForDeployment();
  console.log(`PetAdoption deployed to ${await contract.getAddress()}`);

  saveContractFiles(contract);

}

async function saveContractFiles(contract) {

  address = await contract.getAddress();

  const contractDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir);
  }

  fs.writeFileSync(
    path.join(contractDir, `contract-address-${network.name}.json`),
    JSON.stringify({ PetAdoption: address }, null, 2)
  );

  const PetAdoptionArtifact = artifacts.readArtifactSync("PetAdoption");

  fs.writeFileSync(
    path.join(contractDir, "PetAdoption.json"),
    JSON.stringify(PetAdoptionArtifact, null, 2)
  );
}

main().catch(error => {
  console.log(error);
  process.exitCode = 1;
});


// npx hardhat run scripts/deploy.js --network localhost