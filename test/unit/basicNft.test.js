const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("basicNft Unit Tests", function () {
          let basicNft, signer

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              signer = accounts[0]
              await deployments.fixture(["all"])

              const basicNftDeployment = await deployments.get("BasicNft")
              basicNft = await ethers.getContractAt(
                  basicNftDeployment.abi,
                  basicNftDeployment.address,
                  signer,
              )
          })

          it("contract was deployed", async () => {
              assert(basicNft.target)
          })

          describe("Constructor", function () {
              it("NFT is initialized with the correct name and symbol", async () => {
                  const name = await basicNft.name()
                  assert.equal(name, "Pug the Pug")

                  const symbol = await basicNft.symbol()
                  assert.equal(symbol, "PUG")
              })
              it("Token counter is correctly initialized", async () => {
                  const tokenCounter = await basicNft.getTokenCounter()
                  assert.equal(tokenCounter, "0")
              })
          })

          describe("MintNFT ", function () {
              beforeEach(async () => {
                  const txResponse = await basicNft.mintNft()
                  txResponse.wait(1)
              })
              it("Allows users to mint an NFT, and updates appropriately", async () => {
                  const tokenURI = await basicNft.tokenURI(0)
                  const updatedTokenCounter = await basicNft.getTokenCounter()

                  assert.equal(tokenURI, await basicNft.TOKEN_URI())
                  assert.equal(updatedTokenCounter, "1")
              })
              it("shows the correct balance and owner of an NFT", async () => {
                  const deployerAddress = await signer.address
                  const deployerBalance = await basicNft.balanceOf(deployerAddress)
                  const owner = await basicNft.ownerOf("0")

                  assert.equal(deployerBalance, "1")
                  assert.equal(owner, deployerAddress)
              })
          })
      })

// PUT BACK FORK IN CONFIG???
