const HashLedger = artifacts.require("./HashLedger.sol")
const assert = require('assert')
const { assertThrow, assertBalanceApprox, sleep } = require('./test-util.js')

const [RECORD_OWNER, RECORD_HASH, RECORD_MUTABLE] = [0,1,2]

contract('HashLedger', accounts => {
  const [owner, other] = accounts

  it('should be deployable', async function() {
    await HashLedger.new()
  })

  it('should add a new hash', async function() {
    const hashLedger = await HashLedger.new()
    await hashLedger.addHash(0x123, false, { from: owner })
  })

  it('should log HashAdded event', async function() {
    const hashLedger = await HashLedger.new()
    const result = await hashLedger.addHash(0x123, true, { from: owner })
    assert.equal(result.logs.length, 1)
    assert.equal(result.logs[0].event, 'HashAdded')
    assert.equal(result.logs[0].args.id.toNumber(), 0)
    assert.equal(result.logs[0].args.hash, '0x1230000000000000000000000000000000000000000000000000000000000000')
    assert.equal(result.logs[0].args.mutable, true)
  })

  it('should get hash', async function() {
    const hashLedger = await HashLedger.new()
    await hashLedger.addHash(0x123, true, { from: owner })
    const hashRecord = await hashLedger.hashes(0)
    assert.equal(hashRecord[RECORD_OWNER], owner)
    assert.equal(hashRecord[RECORD_HASH], '0x1230000000000000000000000000000000000000000000000000000000000000')
    assert.equal(hashRecord[RECORD_MUTABLE], true)
  })

  it('should autoincrement id', async function() {
    const hashLedger = await HashLedger.new()
    await hashLedger.addHash(0x1, false, { from: owner })
    await hashLedger.addHash(0x2, false, { from: owner })
    await hashLedger.addHash(0x3, false, { from: owner })
    const hashRecord = await hashLedger.hashes(2)
    assert.equal(hashRecord[RECORD_HASH], '0x3000000000000000000000000000000000000000000000000000000000000000')
  })

  it('should allow owner to change mutable hash', async function() {
    const hashLedger = await HashLedger.new()
    await hashLedger.addHash(0x123, true, { from: owner })
    await hashLedger.changeHash(0, 0x456, { from: owner })
    const hashRecord = await hashLedger.hashes(0)
    assert.equal(hashRecord[RECORD_HASH], '0x4560000000000000000000000000000000000000000000000000000000000000')
  })

  it('should log HashChanged event', async function() {
    const hashLedger = await HashLedger.new()
    await hashLedger.addHash(0x123, true, { from: owner })
    const result = await hashLedger.changeHash(0, 0x456, { from: owner })
    assert.equal(result.logs.length, 1)
    assert.equal(result.logs[0].event, 'HashChanged')
    assert.equal(result.logs[0].args.id.toNumber(), 0)
    assert.equal(result.logs[0].args.oldHash, '0x1230000000000000000000000000000000000000000000000000000000000000')
    assert.equal(result.logs[0].args.newHash, '0x4560000000000000000000000000000000000000000000000000000000000000')
  })

  it('should not allow owner to change immutable hash', async function() {
    const hashLedger = await HashLedger.new()
    await hashLedger.addHash(0x123, false, { from: owner })
    await assertThrow(hashLedger.changeHash(0, 0x456, { from: owner }))
  })

  it('should not only allow non-owner to change a hash', async function() {
    const hashLedger = await HashLedger.new()
    await hashLedger.addHash(0x123, true, { from: owner })
    await assertThrow(hashLedger.changeHash(0, 0x456, { from: other }))
  })

  it('should change an owner', async function() {
    const hashLedger = await HashLedger.new()
    await hashLedger.addHash(0x123, true, { from: owner })
    await hashLedger.changeOwner(0, other, { from: owner })
    const hashRecord = await hashLedger.hashes(0)
    assert.equal(hashRecord[RECORD_OWNER], other)
  })

  it('should log OwnerChanged event', async function() {
    const hashLedger = await HashLedger.new()
    await hashLedger.addHash(0x123, true, { from: owner })
    const result = await hashLedger.changeOwner(0, other, { from: owner })
    assert.equal(result.logs.length, 1)
    assert.equal(result.logs[0].event, 'OwnerChanged')
    assert.equal(result.logs[0].args.id.toNumber(), 0)
    assert.equal(result.logs[0].args.oldAddress, owner)
    assert.equal(result.logs[0].args.newAddress, other)
  })

  it('should not allow owner to change an immutable hash', async function() {
    const hashLedger = await HashLedger.new()
    await hashLedger.addHash(0x123, false, { from: owner })
    await assertThrow(hashLedger.changeOwner(0, other, { from: owner }))
  })

  it('should not allow non-owner to change a mutable hash', async function() {
    const hashLedger = await HashLedger.new()
    await hashLedger.addHash(0x123, true, { from: other })
    await assertThrow(hashLedger.changeOwner(0, other, { from: owner }))
  })
})
