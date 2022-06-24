import { ethers } from "./ethers-5.6.esm.min.js"

import { abi, contractAddress } from "./constants.js"

let provider, signer, contract

const connectBtn = document.getElementById("connect-btn")
const fundBtn = document.getElementById("fund-btn")
const getBalanceBtn = document.getElementById("get-balance-btn")

const withdrawBtn = document.getElementById("withdraw-btn")

connectBtn.onclick = connect
fundBtn.onclick = fund
getBalanceBtn.onclick = getBalance
withdrawBtn.onclick = withdraw

const init = async () => {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum)
        signer = provider.getSigner()

        contract = new ethers.Contract(contractAddress, abi, signer)
    }
}

async function connect() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({
                method: "eth_requestAccounts",
            })
            console.log("connected")
            init()
        } catch (error) {
            console.log(error)
        }
    }
}

async function getBalance() {
    try {
        const balance = await provider.getBalance(contractAddress)
        console.log(`Balance: ${ethers.utils.formatEther(balance)}`)
    } catch (error) {
        console.log(error)
    }
}

async function fund() {
    let ethAmount = document.getElementById("eth-amount").value
    if (window.ethereum) {
        try {
            console.log(`Funding with ${ethAmount}`)

            console.log(contract)

            const txResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount.toString()),
            })

            await listenForTxMine(txResponse.hash, provider)

            console.log("Completed!")
        } catch (error) {
            console.log(error)
        }
    }
}

async function withdraw() {
    if (window.ethereum) {
        console.log("Withdrawing")

        try {
            const txResponse = await contract.withdraw()
            await listenForTxMine(txResponse.hash, provider)
            console.log("Completed!")
            await getBalance()
        } catch (error) {
            console.log(error)
        }
    }
}

// utils
const listenForTxMine = (txHash, provider) => {
    console.log(`Listening for tx ${txHash} to mine`)

    return new Promise((resolve, reject) => {
        provider.once(txHash, (txReceipt) => {
            console.log(`Mined with ${txReceipt.confirmations} confirmations`)
            resolve()
        })
    })
}
