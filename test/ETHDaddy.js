const { expect } = require("chai")
const { ethers } = require('hardhat')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("ETHDaddy", () => {
  let ETHDaddy;
  let ethDaddy;
  
  let deployer, owner;

  const NAME = "ETH Daddy";
  const SYMBOL = "ETHD";

  beforeEach(async() => {
    [deployer, owner] = await ethers.getSigners();

    // Deploy a contract
    ETHDaddy = await ethers.getContractFactory('ETHDaddy');
    ethDaddy = await ETHDaddy.deploy(NAME, SYMBOL)

    // list a domain
    const transaction = await ethDaddy.connect(deployer).list("jack.eth", tokens(10));
    await transaction.wait()
  });

  describe("deployment", () => {
    it("has a name", async () => {
      const result = await ethDaddy.name();
      expect(result).to.equal(NAME)
    })
    
    it("has a symbol", async () => {
      const symbol = await ethDaddy.symbol();
      expect(symbol).to.equal(SYMBOL)
    })

    it("sets the owner", async () => {
      const result = await ethDaddy.owner();
      expect(result).to.equal(deployer.address)
    })

    it("returns the maxSupply", async () => {
      const result = await ethDaddy.maxSupply();
      expect(result).to.equal(1);
    })

    it("returns the totalSupply", async () => {
      const result = await ethDaddy.totalSupply();
      expect(result).to.equal(0);
    })
  })

  describe("domain", () => {
    it("returns domain attributes", async () => {
      let domain = await ethDaddy.getDomain(1);

      expect(domain.name).to.be.equal("jack.eth")
      expect(domain.cost).to.be.equal(tokens(10))
      expect(domain.isOwned).to.be.equal(false)
    })
  })

  describe("minting", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseEther("10", 'ether')

    beforeEach(async () => {
      const transaction = await ethDaddy.connect(owner).mint(ID, { value: AMOUNT })
      await transaction.wait()
    })

  it("updates the owner", async () => {
    let domainOwner = await ethDaddy.ownerOf(ID);

    expect(domainOwner).to.be.equal(owner.address)
  })

  it("should be owned", async () => {
    let result = await ethDaddy.getDomain(ID);

    expect(result.isOwned).to.be.equal(true)
  })

  it("should update balance", async () => {
    let result = await ethDaddy.getBalance();

    expect(result).to.be.equal(AMOUNT)
  })

  it("returns the totalSupply", async () => {
    const result = await ethDaddy.totalSupply();
    expect(result).to.equal(1);
  })
})

describe("Withdrawing", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseEther("10", 'ether')
    let balanceBefore

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      let transaction = await ethDaddy.connect(owner).mint(ID, { value: AMOUNT })
      await transaction.wait()

      transaction = await ethDaddy.connect(deployer).withdraw()
      await transaction.wait()
    })

  it("updates the owner balance ", async () => {
    const balanceAfter = await ethers.provider.getBalance(deployer.address)
    expect(balanceAfter).to.be.greaterThan(balanceBefore)
  })

  it("Updates contract balance", async () => {
    const result = await ethDaddy.getBalance();
    expect(result).to.equal(0);
  })
})

})
