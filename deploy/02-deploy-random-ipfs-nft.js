const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

const VRF_SUB_FUND_AMOUNT = ethers.parseEther("2")
const imagesLocation = "./images/randomNft/"
let tokenUris = [
    "ipfs://QmNddFsneWThscVTyaTPWoiYAe5X462TSq27Bg2NX6HeWh",
    "ipfs://QmNqYUNjjRDXU4KN1cLA5pUgJ3V4cEVR7VWwDtCh8Awwue",
    "ipfs://Qme7UtrSEuizrnR2wjf2wCmh7YradDvsFicn5ozMrxzc6M",
]
// ^^ got the IPFS hashes of our images and pasted them here, was before just let tokenUris. .env upload to pinate is set to false now (instead of first time true)

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    // 1. with our own IPFS Node (check IPFS documentation)
    // 2. Pinata
    // 3. NFT storage

    let vrfCoordinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        // --> this means: IF the currently used network name is in de development chains array (i.e., if we are on a development chain:)
        const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", deployer)
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.target

        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)

        subscriptionId = 1 // txReceipt.events[0].args.subId --> Not sure why
        // subscriptionId = 1 // txReceipt.events[0].args.subId --> Not sure why
        // Now, we need to fund the subscription, for which we usually need the link token (on a real network)
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    log("-------------------------------------------------")

    await storeImages(imagesLocation)

    // constructor variables

    // const dogTokenUris = networkConfig[chainId]["dogTokenUris"]

    const args = [
        vrfCoordinatorV2Address,
        networkConfig[chainId]["gasLane"],
        subscriptionId,
        networkConfig[chainId]["callbackGasLimit"],
        tokenUris,
        networkConfig[chainId]["mintFee"],
    ]

    async function handleTokenUris() {
        tokenUris = []
        // store the image in IPFS
        const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
        for (imageUploadResponseIndex in imageUploadResponses) {
            // create metadata
            // upload metadata
            let tokenUriMetadata = { ...metadataTemplate }
            tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "") // we just drop the extension for the name
            tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name}`
            tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
            console.log(`Uploading ${tokenUriMetadata.name}...`)
            // store the JSON to Pinata / IPFS
            const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
            tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
        }
        console.log("Token URIs Uploaded! They are:")
        console.log(tokenUris)
        return tokenUris
    }

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("------------------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomIpfsNft.address, args)
    }
    log("------------------------------------------------")
}

module.exports.tags = ["all", "randomipfs", "main"]
