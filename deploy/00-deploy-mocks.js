const { developmentChains } = require("../helper-hardhat-config")

const BASE_FEE = ethers.parseEther("0.25") // 0.25 is the LINK premium, which is the cost per request
const GAS_PRICE_LINK = 1e9 // calculated value based on the gasprice of the chain, which fluctuates based on the price of the actual chain
const DECIMALS = "18"
const INITIAL_PRICE = ethers.parseEther("2000")

// This is because Chainlink Nodes actually call the functions and thus pay the gas fees to give us randomness & do external execution
// So they price requests based on the price of gas

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        // deploy a mock vrfCoordinatorV2
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("Mocks deployed")
        log("-----------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
