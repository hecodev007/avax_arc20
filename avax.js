// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
//const hre = require("hardhat");
const {Web3} = require('web3');
var request = require('request');
var rp = require('request-promise');
var md5 = require('js-md5');
var axios = require('axios');
var {convertStringToHex, de, processSignature} = require('./utils.js')
var {z} = require('./constatns.js')
const ethSigUtil = require('eth-sig-util');
//var { sendTransaction, signTypedData } =require ('@wagmi/core')
const web3 = new Web3('https://rpc.ankr.com/avalanche');
//const web3 = new Web3('https://avalanche.public-rpc.com');
// // npx hardhat run   --network base_test scripts/deploy.js
// //npx hardhat run  scripts/avax.js
// // Your Ethereum wallet private key
const privateKey = '';

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add('0x' + privateKey);
web3.eth.accounts.wallet.add('')
const myWalletAddress = web3.eth.accounts.wallet[0].address;
const buyer = web3.eth.accounts.wallet[1].address;
//
// // Main Net Contract for cETH (the supply process is different for cERC20 tokens)
// const contractAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';

// const cEthContract = new web3.eth.Contract(abiJson, contractAddress);
//
// const ethDecimals = 18; // Ethereum has 18 decimal places

//npx hardhat run   --network heco_test scripts/Pay.js
//npx hardhat run   --network bsc_test scripts/get.js
// npx hardhat run   --network avax scripts/avax.js
//npx hardhat run  scripts/test.js


async function post(url, data) {
    let res
    await axios.post(url, data).then(response => {
        //  console.log('url', response.data)
        res = JSON.stringify(response.data)
        console.log(res)

    }, error => {
        console.log(error)
    })
    //  console.log(res)
    return res
}


const lo = (u) => '0x' + (typeof u == 'string' ? BigInt(u) : u).toString(16)
//撤单的逻辑
async function CancelOrder(tick,proxyAddr){
    orders = await getMyOrder(tick)
    //  console.log(orders)
    jsArry = eval(orders)
    input = JSON.parse(jsArry[0].input)
    console.log("input:", input)

    cancelResult= await cancelApi(input.order.listId)
    console.log(cancelResult)
    cancelInput =JSON.parse(cancelResult.input)
    cancelOrders = cancelInput.order
    console.log("cancelInput:",cancelOrders)
    inputs = {
        ...cancelOrders,
        amount:lo(cancelOrders.amount),
        price:lo(cancelOrders.price),
        v: cancelInput.v,
        r: cancelInput.r,
        s: cancelInput.s

    }
    console.log("inputs:", inputs)
    // return

    await cancelOrder(inputs, proxyAddr)
    return
}
async function List(tick,amount,price){
    listOp = `data:,{"p":"asc-20","op":"list","tick":"` + tick + `","amt":"` + amount + `"}`
    console.log(listOp)
    listHex = web3.utils.utf8ToHex(listOp)
    tx = await web3.eth.sendTransaction({
            from: myWalletAddress,
            to: proxyAddr,
            gasLimit: web3.utils.toHex(250000),
            gasPrice: web3.utils.toHex(90000000000),
            data: listHex
        }
    )
    console.log(tx.hash)
    listId = tx.hash
    let tm = Date.parse(new Date()) / 1000;
    let deadline = tm + 86400 * 30;

    order = {
        seller: myWalletAddress.toLowerCase(),
        creator: proxyAddr.toLowerCase(),
        listId: listId,
        ticker: tick,
        amount: web3.utils.toHex(amount),
        price: "0x" + BigInt(price * 10 ** 18).toString(16),
        nonce: "0",
        listingTime: tm,
        expirationTime: deadline,
        creatorFeeRate: 200,
        salt: parseInt(M(9)),
        extraParams: "0x00"
    }
    console.log("myaddress:", myWalletAddress)
    const {domain: N, types: l, message: h} = de(order, proxyAddr, z)


    typedData = {
        account: myWalletAddress,
        domain: N,
        message: h,
        primaryType: 'ASC20Order',
        types: l,
    }


    const privateKey1 = Buffer.from(privateKey, 'hex');
    // console.log(privateKey1)
    // 创建签名
    const signature = ethSigUtil.signTypedData_v4(privateKey1, {
        data: typedData
    });

    result = processSignature(signature)

    input = {
        order: order,
        ...result
    }
    inputs = {
        ...order,
        ...result
    }

    data = {
        listId: listId,
        input: input

    }
    console.log(data)
    await listApi(data)
    return inputs
}
//购买
async function Buy(buyer, price, amount, inputs) {

    reciept = buyer
    const value = "0x" + (BigInt(price * 10 ** 18) * BigInt(amount)).toString(16);
    console.log((BigInt(price * 10 ** 18) * BigInt(amount)).toString());
    bal = await web3.eth.getBalance(myWalletAddress);
    console.log("bal:", bal.toString())
    p = [inputs, reciept]

    fun1 = web3.eth.abi.encodeFunctionCall({
            "inputs": [{
                "components": [{
                    "internalType": "address",
                    "name": "seller",
                    "type": "address"
                }, {
                    "internalType": "address",
                    "name": "creator",
                    "type": "address"
                }, {
                    "internalType": "bytes32",
                    "name": "listId",
                    "type": "bytes32"
                }, {
                    "internalType": "string",
                    "name": "ticker",
                    "type": "string"
                }, {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }, {
                    "internalType": "uint256",
                    "name": "price",
                    "type": "uint256"
                }, {
                    "internalType": "uint256",
                    "name": "nonce",
                    "type": "uint256"
                }, {
                    "internalType": "uint64",
                    "name": "listingTime",
                    "type": "uint64"
                }, {
                    "internalType": "uint64",
                    "name": "expirationTime",
                    "type": "uint64"
                }, {
                    "internalType": "uint16",
                    "name": "creatorFeeRate",
                    "type": "uint16"
                }, {
                    "internalType": "uint32",
                    "name": "salt",
                    "type": "uint32"
                }, {
                    "internalType": "bytes",
                    "name": "extraParams",
                    "type": "bytes"
                }, {
                    "internalType": "uint8",
                    "name": "v",
                    "type": "uint8"
                }, {
                    "internalType": "bytes32",
                    "name": "r",
                    "type": "bytes32"
                }, {
                    "internalType": "bytes32",
                    "name": "s",
                    "type": "bytes32"
                }],
                "internalType": "struct ASC20Order",
                "name": "order",
                "type": "tuple"
            }, {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            }],
            "name": "executeOrder",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        }
        , p);
    console.log("fun:", fun1);


    await web3.eth.sendTransaction({
            from: buyer,
            to: proxyAddr,
            gasLimit: web3.utils.toHex(250000),
            gasPrice: web3.utils.toHex(90000000000),
            value: value,
            data: fun1
        }, function (err, transactionHash) {
            if (err) {
                console.log(err);
            } else {
                console.log("buy:", transactionHash);
            }
        }
    )
}


async function main() {

    proxyAddr = "0x24e24277e2FF8828d5d2e278764CA258C22BD497"
    tick = "bull"
    amount = 1000
    price = 0.0003;
    console.log("price:", price)
    inputs = await List(tick,amount,price)
    Buy(buyer,price,amount,inputs)

    CancelOrder(tick,proxyAddr)

}

async function handleSign(order) {
    const {domain: N, types: l, message: h} = de(order, '0x24e24277e2ff8828d5d2e278764ca258c22bd497', z)


    typedData = {
        account: myWalletAddress,
        domain: N,
        message: h,
        primaryType: 'ASC20Order',
        types: l,
    }


    const privateKey1 = Buffer.from(privateKey, 'hex');
    // console.log(privateKey1)
    // 创建签名
    const signature = ethSigUtil.signTypedData_v4(privateKey1, {
        data: typedData
    });

    return processSignature(signature)

}

async function getMyOrder(tick) {
    req = {
        owner: myWalletAddress,
        page: 1,
        pageSize: 15,
        status: [2],
        tick: tick
    }
    res = await post(" https://avascriptions.com/api/order/list", req)
    // console.log("myorder:",res)
    return JSON.parse(res).data.list
}

//https://avascriptions.com/api/order/cancel
async function cancelOrder(inputs, proxyAddr) {
    fun = web3.eth.abi.encodeFunctionCall({
        inputs: [{
            components: [{
                internalType: "address",
                name: "seller",
                type: "address"
            }, {
                internalType: "address",
                name: "creator",
                type: "address"
            }, {
                internalType: "bytes32",
                name: "listId",
                type: "bytes32"
            }, {
                internalType: "string",
                name: "ticker",
                type: "string"
            }, {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }, {
                internalType: "uint256",
                name: "price",
                type: "uint256"
            }, {
                internalType: "uint256",
                name: "nonce",
                type: "uint256"
            }, {
                internalType: "uint64",
                name: "listingTime",
                type: "uint64"
            }, {
                internalType: "uint64",
                name: "expirationTime",
                type: "uint64"
            }, {
                internalType: "uint16",
                name: "creatorFeeRate",
                type: "uint16"
            }, {
                internalType: "uint32",
                name: "salt",
                type: "uint32"
            }, {
                internalType: "bytes",
                name: "extraParams",
                type: "bytes"
            }, {
                internalType: "uint8",
                name: "v",
                type: "uint8"
            }, {
                internalType: "bytes32",
                name: "r",
                type: "bytes32"
            }, {
                internalType: "bytes32",
                name: "s",
                type: "bytes32"
            }],
            internalType: "struct ASC20Order",
            name: "order",
            type: "tuple"
        }],
        name: "cancelOrder",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, [inputs]);

    // fun= fun.substring(0,fun.length-128)+fun.substring(fun.length-64,fun.length)
    // fun = "0xa3e37b4f"+ fun.substring(10,fun.length)
    console.log(fun)
    await web3.eth.sendTransaction({
            from: myWalletAddress,
            to: proxyAddr,
            gasLimit: web3.utils.toHex(250000),
            gasPrice: web3.utils.toHex(90000000000),
            data: fun
        }, function (err, transactionHash) {
            if (err) {
                console.log(err);
            } else {
                console.log("cancel:", transactionHash);
            }
        }
    )
}

async function cancelApi(listId) {
    data = {
        "address": myWalletAddress.toLowerCase(),
        "listId": listId,
        "token": md5(myWalletAddress.toLowerCase() + listId)
    }
    result = await post('https://avascriptions.com/api/order/cancel', data)
    return JSON.parse(result).data
}

async function listApi(data) {
    await post('https://avascriptions.com/api/order/create', data)
}



const M = (u) => {
    if (u <= 0) return "";
    const p = "0123456789";
    let f = "";
    for (let x = 0; x < u; x++) {
        const v = p.charAt(Math.floor(Math.random() * p.length));
        x === 0 && v === "0" ? x-- : (f += v);
    }
    return f;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main()

