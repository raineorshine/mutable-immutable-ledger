const HashLedger = artifacts.require("./HashLedger.sol")

module.exports = function(deployer) {
  deployer.deploy(HashLedger)
}
