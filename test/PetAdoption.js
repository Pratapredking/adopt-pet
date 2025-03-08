const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PetAdoption", function() {

  async function deployContractFixture() {
    const [owner] = await ethers.getSigners();
    const PetAdoption = await ethers.getContractFactory("PetAdoption");
    const contract = await PetAdoption.deploy();

  

    return { owner, contract };
  }

  describe("Deployment", function() {
    it("Should set the right owner", async function() {


        const { owner, contract } = await loadFixture(deployContractFixture);
        
        const contractOwner = await contract.owner();
 
       expect(contractOwner).to.equal(owner.address);

      
    });
    it("Should get the right owner", async function() {


      const { owner, contract } = await loadFixture(deployContractFixture);
      
      const contractOwner = await contract.getOwner();

     expect(contractOwner).to.equal(owner.address);

    
  });
  });

  describe("Add Pet", function() {
    it("Should revert with the right error in case of other account", async function() {
      const { owner, contract, account2 } = await loadFixture(deployContractFixture);

      await expect(contract.connect(account2).addPet()).to.be.revertedWith("Only a contract owner can add a new pet!");
    })
  })

});

// npx hardhat test --network localhost