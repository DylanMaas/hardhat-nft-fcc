const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("randomIpfsNft Unit Tests", function () {
          let randomIpfsNft, signer, vrfCoordinatorV2Mock

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              signer = accounts[0]
              await deployments.fixture(["all"])

              const randomIpfsNftDeployment = await deployments.get("RandomIpfsNft")
              randomIpfsNft = await ethers.getContractAt(
                  randomIpfsNftDeployment.abi,
                  randomIpfsNftDeployment.address,
                  signer,
              )
              const vrfCoordinatorV2MockDeployment = await deployments.get("VRFCoordinatorV2Mock")
              vrfCoordinatorV2Mock = await ethers.getContractAt(
                  vrfCoordinatorV2MockDeployment.abi,
                  vrfCoordinatorV2MockDeployment.address,
                  signer,
              )
          })
          it("contract was deployed", async () => {
              assert(randomIpfsNft.target)
          })

          describe("constructor", function () {
              it("sets starting values correctly", async () => {
                  const dogTokenUrizero = await randomIpfsNft.getDogTokenUris(0)
                  assert(dogTokenUrizero.includes("ipfs://"))
              })
          })

          describe("requestNft", function () {
              it("fails if payment isn't sent with the request", async () => {
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "RandomIpfsNft__NeedMoreETHSent",
                  )
              })

              //   it("fails if payment amount is less than the mintfee", async () => {
              //       const fee = await randomIpfsNft.getMintFee()
              //       await expect(
              //           randomIpfsNft.requestNft({ value: fee.sub(ethers.parseEther("0.001")) }),
              //       ).to.be.revertedWithCustomError(randomIpfsNft, "RandomIpfsNft__NeedMoreETHSent")
              //   })

              it("emits an event and kicks off a random word request", async () => {
                  const fee = await randomIpfsNft.getMintFee()
                  expect(randomIpfsNft.requestNft({ value: fee.toString() })).to.emit(
                      randomIpfsNft,
                      "NftRequested",
                  )
              })

              it("mints an NFT after random number is returned", async () => {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          console.log("Found the event)")
                          try {
                              const tokenUri = await randomIpfsNft.tokenUri(tokenId.toString())
                              const s_tokenCounter = await randomIpfsNft.getTokenCounter()
                              const dogUri = await randomIpfsNft.getDogTokenUris(breed.toString())
                              assert.equal(tokenUri.toString().includes("ipfs://"), true)
                              assert.equal(dogUri.toString(), tokenUri.toString())
                              assert.equal(+s_tokenCounter.toString(), +tokenId.toString() + 1)
                              assert.equal(minter, deployer.address)
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          const fee = await randomIpfsNft.getMintFee()
                          const requestNftResponse = await randomIpfsNft.requestNft({
                              value: fee.toString(),
                          })
                          const requestNftReceipt = await requestNftResponse.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomwords(
                              await vrfCoordinatorV2Mock.fulfillRandomWords(
                                  requestNftReceipt.events[1].args.requestId,
                                  randomIpfsNft.target,
                              ),
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })
      })
