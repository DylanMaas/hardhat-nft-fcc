const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const accounts = await ethers.getSigners()
    signer = accounts[0]

    // // Basic NFT
    // const basicNftDeployment = await deployments.get("BasicNft")
    // basicNft = await ethers.getContractAt(
    //     basicNftDeployment.abi,
    //     basicNftDeployment.address,
    //     signer,
    // )
    // const basicMintTx = await basicNft.mintNft()
    // await basicMintTx.wait(1)
    // console.log(`Basic NFT with index 0 has tokenURI: ${await basicNft.tokenURI(0)}`)

    // // Random IPFS NFT
    // const randomIpfsNftDeployment = await deployments.get("RandomIpfsNft")
    // randomIpfsNft = await ethers.getContractAt(
    //     randomIpfsNftDeployment.abi,
    //     randomIpfsNftDeployment.address,
    //     signer,
    // )
    // const mintFee = await randomIpfsNft.getMintFee()
    // const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
    // const randomIpfsNftMintTxReceipt = randomIpfsNftMintTx.wait(1)

    // // Need to listen for response
    // await new Promise(async (resolve, reject) => {
    //     setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 600000) // 10 minutes
    //     // setup listener for our event
    //     randomIpfsNft.once("NftMinted", async () => {
    //         console.log(
    //             `Random IPFS NFT with index 0 has tokenURI: ${await randomIpfsNft.tokenURI(0)}`,
    //         )
    //         resolve()
    //     })

    //     if (developmentChains.includes(network.name)) {
    //         requestId = 1 // const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId
    //         const vrfCoordinatorV2MockDeployment = await deployments.get("VRFCoordinatorV2Mock")
    //         vrfCoordinatorV2Mock = await ethers.getContractAt(
    //             vrfCoordinatorV2MockDeployment.abi,
    //             vrfCoordinatorV2MockDeployment.address,
    //             signer,
    //         )
    //         await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.target)
    //     }
    // })

    // Dynamic SVG NFT
    const highValue = ethers.parseEther("1") // 4000 dollar = high value
    const dynamicSvgNftDeployment = await deployments.get("DynamicSvgNft")
    dynamicSvgNft = await ethers.getContractAt(
        dynamicSvgNftDeployment.abi,
        dynamicSvgNftDeployment.address,
        signer,
    )

    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT with index 3 has tokenURI: ${await dynamicSvgNft.tokenURI(3)}`)
}

module.exports.tags = ["all", "mint"]
