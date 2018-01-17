const MutableImmutableLedger = artifacts.require("./MutableImmutableLedger.sol")
const assert = require('assert')
const { assertThrow, assertBalanceApprox, sleep } = require('./test-util.js')

const [RECORD_OWNER, RECORD_DATA, RECORD_MUTABLE] = [0,1,2]

contract('MutableImmutableLedger', accounts => {
  const [owner, other] = accounts

  it('should be deployable', async function() {
    await MutableImmutableLedger.new()
  })

  it('should add new data', async function() {
    const ledger = await MutableImmutableLedger.new()
    await ledger.addData(0x123, false, { from: owner })
  })

  it('should log DataAdded event', async function() {
    const ledger = await MutableImmutableLedger.new()
    const result = await ledger.addData(0x123, true, { from: owner })
    assert.equal(result.logs.length, 1)
    assert.equal(result.logs[0].event, 'DataAdded')
    assert.equal(result.logs[0].args.id.toNumber(), 0)
    assert.equal(result.logs[0].args.data, '0x1230000000000000000000000000000000000000000000000000000000000000')
    assert.equal(result.logs[0].args.mutable, true)
  })

  it('should get data', async function() {
    const ledger = await MutableImmutableLedger.new()
    await ledger.addData(0x123, true, { from: owner })
    const record = await ledger.records(0)
    assert.equal(record[RECORD_OWNER], owner)
    assert.equal(record[RECORD_DATA], '0x1230000000000000000000000000000000000000000000000000000000000000')
    assert.equal(record[RECORD_MUTABLE], true)
  })

  it('should autoincrement id', async function() {
    const ledger = await MutableImmutableLedger.new()
    await ledger.addData(0x1, false, { from: owner })
    await ledger.addData(0x2, false, { from: owner })
    await ledger.addData(0x3, false, { from: owner })
    const record = await ledger.records(2)
    assert.equal(record[RECORD_DATA], '0x3000000000000000000000000000000000000000000000000000000000000000')
  })

  it('should allow owner to change mutable data', async function() {
    const ledger = await MutableImmutableLedger.new()
    await ledger.addData(0x123, true, { from: owner })
    await ledger.changeData(0, 0x456, { from: owner })
    const record = await ledger.records(0)
    assert.equal(record[RECORD_DATA], '0x4560000000000000000000000000000000000000000000000000000000000000')
  })

  it('should log DataChanged event', async function() {
    const ledger = await MutableImmutableLedger.new()
    await ledger.addData(0x123, true, { from: owner })
    const result = await ledger.changeData(0, 0x456, { from: owner })
    assert.equal(result.logs.length, 1)
    assert.equal(result.logs[0].event, 'DataChanged')
    assert.equal(result.logs[0].args.id.toNumber(), 0)
    assert.equal(result.logs[0].args.oldData, '0x1230000000000000000000000000000000000000000000000000000000000000')
    assert.equal(result.logs[0].args.newData, '0x4560000000000000000000000000000000000000000000000000000000000000')
  })

  it('should not allow owner to change immutable data', async function() {
    const ledger = await MutableImmutableLedger.new()
    await ledger.addData(0x123, false, { from: owner })
    await assertThrow(ledger.changeData(0, 0x456, { from: owner }))
  })

  it('should not only allow non-owner to change data', async function() {
    const ledger = await MutableImmutableLedger.new()
    await ledger.addData(0x123, true, { from: owner })
    await assertThrow(ledger.changeData(0, 0x456, { from: other }))
  })

  it('should change an owner', async function() {
    const ledger = await MutableImmutableLedger.new()
    await ledger.addData(0x123, true, { from: owner })
    await ledger.changeOwner(0, other, { from: owner })
    const record = await ledger.records(0)
    assert.equal(record[RECORD_OWNER], other)
  })

  it('should log OwnerChanged event', async function() {
    const ledger = await MutableImmutableLedger.new()
    await ledger.addData(0x123, true, { from: owner })
    const result = await ledger.changeOwner(0, other, { from: owner })
    assert.equal(result.logs.length, 1)
    assert.equal(result.logs[0].event, 'OwnerChanged')
    assert.equal(result.logs[0].args.id.toNumber(), 0)
    assert.equal(result.logs[0].args.oldAddress, owner)
    assert.equal(result.logs[0].args.newAddress, other)
  })

  it('should not allow owner to change an immutable data', async function() {
    const ledger = await MutableImmutableLedger.new()
    await ledger.addData(0x123, false, { from: owner })
    await assertThrow(ledger.changeOwner(0, other, { from: owner }))
  })

  it('should not allow non-owner to change a mutable data', async function() {
    const ledger = await MutableImmutableLedger.new()
    await ledger.addData(0x123, true, { from: other })
    await assertThrow(ledger.changeOwner(0, other, { from: owner }))
  })
})
