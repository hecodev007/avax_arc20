 const z = {
  name: 'ASC20Order',
  fields: [
    { name: 'seller', type: 'address' },
    { name: 'creator', type: 'address' },
    { name: 'listId', type: 'bytes32' },
    { name: 'ticker', type: 'string' },
    { name: 'amount', type: 'uint256' },
    { name: 'price', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'listingTime', type: 'uint64' },
    { name: 'expirationTime', type: 'uint64' },
    { name: 'creatorFeeRate', type: 'uint16' },
    { name: 'salt', type: 'uint32' },
    { name: 'extraParams', type: 'bytes' },
  ],
}

 module.exports = { z}
