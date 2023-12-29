//  const convertStringToHex = (e) => {
//   let t = ''
//   for (let r = 0; r < e.length; r++) t += e.charCodeAt(r).toString(16)
//   return '0x' + t
// }

 const convertStringToHex = function (e) {
  return (
    '0x' +
    Array.from(e)
      .map((o) =>
        o.charCodeAt(0) < 128 ? o.charCodeAt(0).toString(16) : encodeURIComponent(o).replace(/\%/g, '').toLowerCase(),
      )
      .join('')
  )
}

 const Q = (a) => '0x' + (typeof a == 'string' ? BigInt(a) : a).toString(16)

 const ze = (a) => ({
  name: 'ASC20Market',
  version: '1.0',
  chainId: 43114,
  verifyingContract: a,
})

 const de = (a, o, z) => {
  const n = {}
  return (
    Object.assign(n, a),
    (n.amount = Q(a.amount)),
    (n.price = Q(a.price)),
    (n.nonce = Q(a.nonce)),
    {
      types: { EIP712Domain: [
         { name: "name", type: "string" },
         { name: "version", type: "string" },
         { name: "chainId", type: "uint256" },
         { name: "verifyingContract", type: "address" }
     ],[z.name]: z.fields },
      primaryType: 'ASC20Order',
      domain: ze(o),
      message: n,
    }
  )
}

 const processSignature = (signature) => {
  // 拆分签名
  const r = signature.slice(0, 66)
  const s = '0x' + signature.slice(66, 130)
  const v = '0x' + signature.slice(130, 132)
  const vDecimal = parseInt(v, 16)

  // 构建返回对象
  return { r, s, v: vDecimal }
}


module.exports = { de ,convertStringToHex, processSignature}