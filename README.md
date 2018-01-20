An Ethereum smart contract that allows anyone to store mutable or immutable data.

## Usage

Add data:

```js
// immutable data is not modifiable
await ledger.addData(0x123, false, { from: web3.eth.accounts[0] })
```

```js
// mutable data can be changed by the owner
await ledger.addData(0x123, true, { from: web3.eth.accounts[0] })
```
Change mutable data:

```js
const result = await ledger.addData(0x123, true, { from: owner })
const id = result.logs[0].args.id
await ledger.changeData(id, 0x123, { from: web3.eth.accounts[0] })
```

Change owner of mutable data:
```js
const result = await ledger.addData(0x123, true, { from: owner })
const id = result.logs[0].args.id
await ledger.changeOwner(id, web3.eth.accounts[1], { from: web3.eth.accounts[0] })
```

## Events

```js
event DataAdded(uint indexed id, address indexed owner, bytes32 data, bool mutable);
event DataChanged(uint indexed id, bytes32 oldData, bytes32 newData);
event OwnerChanged(uint indexed id, address oldAddress, address newAddress);
```

## Build

```
testrpc
truffle compile
truffle migrate --reset
truffle test
```
