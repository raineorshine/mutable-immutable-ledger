pragma solidity ^0.4.15;

contract HashLedger {

  /***********************************************************
   * EVENTS
   ***********************************************************/

  event HashAdded(uint id, address owner, bytes32 hash, bool mutable);
  event HashChanged(uint id, bytes32 oldHash, bytes32 newHash);
  event OwnerChanged(uint id, address oldAddress, address newAddress);

  /***********************************************************
   * DATA
   ***********************************************************/

  // Internal type (not allowed for public state variables)
  struct HashRecord {
    address owner; // the creator of the hash
    bytes32 hash;
    bool mutable; // if true, the owner can change the hash
  }

  /***********************************************************
   * MEMBERS
   ***********************************************************/

  HashRecord[] public hashes;

  /***********************************************************
   * MODIFIERS
   ***********************************************************/

  modifier onlyOwner(uint id) { require(msg.sender == hashes[id].owner); _; }
  modifier onlyMutable(uint id) { require(hashes[id].mutable); _; }

  /***********************************************************
   * NON-CONSTANT PUBLIC FUNCTIONS
   ***********************************************************/


  function addHash(bytes32 hash, bool mutable) public returns(uint) {

    // autoincrement
    uint id = hashes.length;

    // add hash
    hashes.push(HashRecord(msg.sender, hash, mutable));
    HashAdded(id, msg.sender, hash, mutable);

    return id;
  }

  function changeHash(uint id, bytes32 newHash) public onlyOwner(id) onlyMutable(id) {
    HashChanged(id, hashes[id].hash, newHash); // fire event first before hash is overwritte
    hashes[id].hash = newHash;
  }

  function changeOwner(uint id, address newAddress) public onlyOwner(id) onlyMutable(id) {
    OwnerChanged(id, hashes[id].owner, newAddress); // fire event first before owner is overwritten
    hashes[id].owner = newAddress;
  }
}
