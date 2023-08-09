
var MyContract = artifacts.require('SECURITY');
var ForwarderContract = artifacts.require('MinimalForwarder');
var ExchangeContract = artifacts.require('EXCHANGE');

var _name = "Southwest Florida";
var _symbol = "SWF";
var _supply = "100000";
var _IPFS = "https://rose-hard-cardinal-950.mypinata.cloud/ipfs/QmYsX2y2FDWS73BvfC1WRGCFTyvhjG7j3snRQAgzsGJZ6w";
var _contentHash = "0xC62767AC948166611404202EA25E9DDA60F2AD2C000000000000000000000000";
var _PPM =         "0x50726f6a6563742050726976617465204d656d6f72616e64756d000000000000";
var _TermCondition = "https://rose-hard-cardinal-950.mypinata.cloud/ipfs/QmQqm8CY6NCAn94pHL6JEeyZA46ouNMRcXyv1Pp5Hf9dtB";


module.exports = async function(deployer) {
  // deployment steps
  var token = await deployer.deploy(MyContract, _name,_symbol,_supply,_IPFS,_contentHash,_PPM,_TermCondition);
  var forwarder = await deployer.deploy(ForwarderContract);
  var addr = await forwarder.address;
  var Exchange = await deployer.deploy(ExchangeContract, addr);
/*
  var balance = await token.balanceOf(addr);

  await console.log("address = "+addr);
  await console.log("Balance = "+balance);
*/
};
