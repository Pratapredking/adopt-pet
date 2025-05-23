// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;
// import "hardhat/console.sol";

contract PetAdoption {
  address public owner;
  uint public petIndex = 0;

   mapping(uint => address) public petIdxToOwnerAddress;
   mapping(address => uint[]) public ownerAddressToPetList;

  uint[] public allAdoptedPets;

  constructor(uint initialPetIndex) {
    owner = msg.sender;
    petIndex = initialPetIndex;
  }

  function addPet() public {

    require(msg.sender == owner, "Only a contract owner can add a new pet!");
     petIndex++;

  }

 
  function adoptPet(uint adoptIdx) public {
     require(adoptIdx < petIndex, "Pet index out of bound!");
     require(petIdxToOwnerAddress[adoptIdx] == address(0), "Pet is already adopted");

   
 
     petIdxToOwnerAddress[adoptIdx] = msg.sender;

    

     ownerAddressToPetList[msg.sender].push(adoptIdx);
     allAdoptedPets.push(adoptIdx);
     
   }
 
   function getOwner() public view returns(address) {
     return owner;
   }

    function getAllAdoptedPetsByOnwer() public view returns(uint[] memory) {
     return ownerAddressToPetList[msg.sender];
   }
 
   function getAllAdoptedPets() public view returns(uint[] memory) {
     return allAdoptedPets;
   }
  
}
