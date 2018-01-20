const MutableImmutableLedger = artifacts.require("./MutableImmutableLedger.sol")

module.exports = function(deployer) {
  deployer.deploy(MutableImmutableLedger)
}
