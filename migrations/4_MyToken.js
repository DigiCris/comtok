var MyContract = artifacts.require('SECURITY');

var _name = "name";
var _symbol = "symbol";
var _supply = "1000";
var _IPFS = "IPFS";//
var _contentHash = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB482e9Eb0cE3606eB482e9Eb0b1";
var _PPM = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB482e9Eb0cE3606eB482e9Eb0b0";
var _TermCondition = "TermCondition";

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(MyContract, _name,_symbol,_supply,_IPFS,_contentHash,_PPM,_TermCondition);
};