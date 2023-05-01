// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ETHDaddy is ERC721{
    uint256 public totalSupply;
    uint256 public maxSupply;
    address public owner;

    struct Domain {
        string name;
        uint256 cost;
        bool isOwned;
    }

    mapping(uint => Domain) public domains;

    modifier onlyOwner () {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(string memory _name, string memory _symbol) 
    ERC721(_name, _symbol)
    {
        owner = msg.sender;
    }

    function list(string memory _name, uint256 _cost) public onlyOwner {
        maxSupply++;
        domains[maxSupply] = Domain(_name, _cost, false);
    }

    function getDomain (uint256 _id) public view returns (Domain memory) {
        return domains[_id];
    }

    function mint (uint256 _id) public payable {
        require(_id != 0, "Not a zero");
        require(_id <= maxSupply, "Less than max supply");
        require(domains[_id].isOwned == false, "Is not owned");
        require(msg.value >= domains[_id].cost, "Send more money");

        domains[_id].isOwned = true;
        totalSupply++;

        _safeMint(msg.sender, _id);
    }

    function getBalance () public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Has to be successfull");
    }
}
