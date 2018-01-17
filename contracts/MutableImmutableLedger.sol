pragma solidity ^0.4.15;

contract MutableImmutableLedger {

  /***********************************************************
   * EVENTS
   ***********************************************************/

  event DataAdded(uint id, address owner, bytes32 data, bool mutable);
  event DataChanged(uint id, bytes32 oldData, bytes32 newData);
  event OwnerChanged(uint id, address oldAddress, address newAddress);

  /***********************************************************
   * DATA
   ***********************************************************/

  // Internal type (not allowed for public state variables)
  struct Record {
    address owner; // the creator of the data
    bytes32 data;
    bool mutable; // if true, the owner can change the data
  }

  /***********************************************************
   * MEMBERS
   ***********************************************************/

  Record[] public records;

  /***********************************************************
   * MODIFIERS
   ***********************************************************/

  modifier onlyOwner(uint id) { require(msg.sender == records[id].owner); _; }
  modifier onlyMutable(uint id) { require(records[id].mutable); _; }

  /***********************************************************
   * NON-CONSTANT PUBLIC FUNCTIONS
   ***********************************************************/

  function addData(bytes32 data, bool mutable) public returns(uint) {

    // autoincrement
    uint id = records.length;

    // add data
    records.push(Record(msg.sender, data, mutable));
    DataAdded(id, msg.sender, data, mutable);

    return id;
  }

  function changeData(uint id, bytes32 data) public onlyOwner(id) onlyMutable(id) {
    DataChanged(id, records[id].data, data); // fire event first before data is overwritte
    records[id].data = data;
  }

  function changeOwner(uint id, address newAddress) public onlyOwner(id) onlyMutable(id) {
    OwnerChanged(id, records[id].owner, newAddress); // fire event first before owner is overwritten
    records[id].owner = newAddress;
  }
}
