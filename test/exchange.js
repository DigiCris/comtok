const EXCHANGEjson = artifacts.require('EXCHANGE');
const SECURITYjson = artifacts.require('SECURITY');
const MinimalForwarderjson = artifacts.require('MinimalForwarder');
const expect = require('chai').expect;

var TokenSWF;
var _name = "SWF";
var _symbol = "SWF";
var _supply = "100000";
var _IPFS = "IPFS";
var _contentHash = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB482e9Eb0cE3606eB482e9Eb0b1";
var _PPM = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB482e9Eb0cE3606eB482e9Eb0b0";
var _TermCondition = "TermCondition SWF";
//////////////
var TokenMDF;
var _name2 = "MDF";
var _symbol2 = "MDF";


var DEFAULT_ADMIN_ROLE='0x0000000000000000000000000000000000000000000000000000000000000000';
var PAUSER_ROLE='0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a';
var EXCHANGER_ROLE='0xb9c595dd714e8ed8568b5dd4315ea8b709bbd3d27ae09ef7290c5ae7b976fb93';
var WHITELISTER_ROLE='0x8619cecd8b9e095ab43867f5b69d492180450fe862e6b50bfbfb24b75dd84c8a';
var PROJECTCREATOR_ROLE = '0x021c73170b6ee67d18900edd1d18b4647810aae53143ba4e3a3d55e62b23be89';

var AMOUNT_WHITELISTED='5000';


contract("exchange.js", accounts => {

    [DEFAULT_ADMIN, PAUSER, WHITELISTER, EXCHANGER, WHITELISTED_USER1,PROJECTCREATOR, WHITELISTED_USER2, LINK_USER1, LINK_USER2, HACKER]= accounts;

    var CROWDFOUNDING1 = "0x38Efc3676Fa3c2DBDf2Bb9d6d731E025327487a0";
    var CROWDFOUNDING2 = "0x4090293f98Ccc827824cEb314cb208a89462A310";

    before( async () => {
        Forwarder = await MinimalForwarderjson.new({from:DEFAULT_ADMIN});
        Exchange = await EXCHANGEjson.new(Forwarder.address,{from:DEFAULT_ADMIN});
    });

    describe("1) constructor",async ()=>{
        it("Trusted forwarder", async ()=>{
            var res = await Exchange.isTrustedForwarder(Forwarder.address)
            expect(res).to.equal(true);
        });
        it("It should be anpaused", async ()=>{
            var res= await Exchange.paused();
            expect(res).to.equal(false);
        });
    });

    describe("2) Create SWF token",async ()=>{
        it("name = "+_name, async ()=>{
            TokenSWF = await SECURITYjson.new(_name,_symbol,_supply,_IPFS,_contentHash,_PPM,_TermCondition,{from:DEFAULT_ADMIN});
            const res= await TokenSWF.name();
            expect(res).to.equal(_name);
        });
    });

    describe("3) Create MDF token",async ()=>{
        it("name = "+_name, async ()=>{
            TokenMDF = await SECURITYjson.new(_name2,_symbol2,_supply,_IPFS,_contentHash,_PPM,_TermCondition,{from:DEFAULT_ADMIN});
            const res= await TokenMDF.name();
            expect(res).to.equal(_name2);
        });
    });





    describe("4) Grant Roles",async ()=>{
        it("Anyone tries to give the pauser role", async ()=>{
            var res= await Exchange.hasRole(PAUSER_ROLE, PAUSER);
            expect(res).to.equal(false);
            try {
                res= await Exchange.grantRole(PAUSER_ROLE, PAUSER,{from:WHITELISTED_USER1});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
            res= await Exchange.hasRole(PAUSER_ROLE, PAUSER);
            expect(res).to.equal(false);
        });
        it("Admin gives the pauser role", async ()=>{
            var res= await Exchange.hasRole(PAUSER_ROLE, PAUSER);
            expect(res).to.equal(false);
            try {
                res= await Exchange.grantRole(PAUSER_ROLE, PAUSER,{from:DEFAULT_ADMIN});
                res= await Exchange.hasRole(PAUSER_ROLE, PAUSER);
                expect(res).to.equal(true);             
            } catch (error) {
                expect(error.hijackedStack).to.include('Debia poder darse el rol');
            }
        });
        it("Pauser tries to give the pauser role", async ()=>{
            var res= await Exchange.hasRole(PAUSER_ROLE, WHITELISTED_USER1);
            expect(res).to.equal(false);
            try {
                res= await Exchange.grantRole(PAUSER_ROLE, WHITELISTED_USER1,{from:PAUSER});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
            res= await Exchange.hasRole(PAUSER_ROLE, WHITELISTED_USER1);
            expect(res).to.equal(false);
        });

        it("Anyone tries to give the EXCHANGER role", async ()=>{
            var res= await Exchange.hasRole(EXCHANGER_ROLE, EXCHANGER);
            expect(res).to.equal(false);
            try {
                res= await Exchange.grantRole(EXCHANGER_ROLE, EXCHANGER,{from:PAUSER});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
            res= await Exchange.hasRole(EXCHANGER_ROLE, EXCHANGER);
            expect(res).to.equal(false);
        });

        it("Anyone tries to give the DEFAULT_ADMIN role", async ()=>{
            var res= await Exchange.hasRole(DEFAULT_ADMIN_ROLE, EXCHANGER);
            expect(res).to.equal(false);
            try {
                res= await Exchange.grantRole(DEFAULT_ADMIN_ROLE, EXCHANGER,{from:PAUSER});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
            res= await Exchange.hasRole(DEFAULT_ADMIN_ROLE, EXCHANGER);
            expect(res).to.equal(false);
        });
        it("Admin gives the EXCHANGER role", async ()=>{
            var res= await Exchange.hasRole(EXCHANGER_ROLE, EXCHANGER);
            expect(res).to.equal(false);
            try {
                res= await Exchange.grantRole(EXCHANGER_ROLE, EXCHANGER,{from:DEFAULT_ADMIN});
                res= await Exchange.hasRole(EXCHANGER_ROLE, EXCHANGER);
                expect(res).to.equal(true);             
            } catch (error) {
                expect(error.hijackedStack).to.include('Debia poder darse el rol');
            }
        });
        it("EXCHANGER tries to give the EXCHANGER role", async ()=>{
            var res= await Exchange.hasRole(EXCHANGER_ROLE, WHITELISTED_USER1);
            expect(res).to.equal(false);
            try {
                res= await Exchange.grantRole(EXCHANGER_ROLE, WHITELISTED_USER1,{from:EXCHANGER});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
            res= await Exchange.hasRole(EXCHANGER_ROLE, WHITELISTED_USER1);
            expect(res).to.equal(false);
        });
        it("Admin grants the project creator role", async ()=>{
            var res= await Exchange.hasRole(PROJECTCREATOR_ROLE, PROJECTCREATOR);
            expect(res).to.equal(false);
            try {
                res= await Exchange.grantRole(PROJECTCREATOR_ROLE, PROJECTCREATOR,{from:DEFAULT_ADMIN});
                res= await Exchange.hasRole(PROJECTCREATOR_ROLE, PROJECTCREATOR);
                expect(res).to.equal(true);             
            } catch (error) {
                expect(error.hijackedStack).to.include('Debia poder darse el rol');
            }
        });
        it("Admin grants the whitelist role", async ()=>{
            var res= await Exchange.hasRole(WHITELISTER_ROLE, WHITELISTER);
            expect(res).to.equal(false);
            try {
                res= await Exchange.grantRole(WHITELISTER_ROLE, WHITELISTER,{from:DEFAULT_ADMIN});
                res= await Exchange.hasRole(WHITELISTER_ROLE, WHITELISTER);
                expect(res).to.equal(true);             
            } catch (error) {
                expect(error.hijackedStack).to.include('Debia poder darse el rol');
            }
        });
    });




    describe("5) add projects",async ()=>{
        it("pauser tries to set a project and should fail", async ()=>{
            try {
                var res= await Exchange.setSecurity(_name,TokenSWF.address, CROWDFOUNDING1,6,{from:PAUSER});
                expect(res).to.equal("No debe estar aca. Tiene que fallar.");             
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("PROJECTCREATOR set a project and should succeed", async ()=>{
            try {
                var res= await Exchange.setSecurity(_name,TokenSWF.address, CROWDFOUNDING1,'6',{from:PROJECTCREATOR});
                var res= await Exchange.security(_name);
                expect(res.toString()).to.equal(TokenSWF.address.toString());             
            } catch (error) {
                expect(error.hijackedStack).to.include('Debio haberlo seteado al proyecto y no entrar aca.');
            }
        });
    });

    

    describe("6) Pause contract",async ()=>{
        it("It should be anpaused", async ()=>{
            var res= await Exchange.paused();
            expect(res).to.equal(false);
        });
        it("Exchanger try to pause the contract", async ()=>{
            var res;
            try {
                res= await Exchange.pause({from:EXCHANGER});
                var res= await Token.paused();
                expect(res).to.equal(false);           
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("Pauser pauses the contract", async ()=>{
            var res;
            try {
                res= await Exchange.pause({from:PAUSER});
                var res= await Exchange.paused();
                expect(res).to.equal(true);           
            } catch (error) {
                expect(error.hijackedStack).to.include('Debio pausarlo y no entrar aca');
            }
        });   
    });  

    describe("7) Whitelisting",async ()=>{
        it("Pauser tries to whitelist", async ()=>{
            try {
                var res= await Exchange.setLinkManual(WHITELISTED_USER1, LINK_USER1,{from:PAUSER});
                expect("pauser no puede dar whitelist").to.equal("debio revertir");           
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });   
        it("whitelister whitelists 1st user", async ()=>{
            try {
                var res= await Exchange.setLinkManual(WHITELISTED_USER1, LINK_USER1,{from:WHITELISTER});
                res = await Exchange.link(LINK_USER1);
                console.log("res"+res);
                expect(res.toLowerCase().toString()).to.equal(WHITELISTED_USER1.toLowerCase().toString());           
            } catch (error) {
                console.log("error"+error);
                expect(error.hijackedStack).to.include('Debio agregarlo a la whitelist y no entrar aca');
            }
        });  
        it("tries auto whitelist. fail due to forwarder not a whitelister", async ()=>{
            try {
                var res= await Exchange.setLink(WHITELISTED_USER2,{from:Forwarder.address});
                res = await Exchange.link(Forwarder.address);
                console.log("res"+res);
                expect("forwared no es whitelister").to.equal("debio saltar el error.");           
            } catch (error) {
                console.log("error"+error);
                expect(error.hijackedStack).to.include('revert');
            }
        });   
        it("Auto whitelist from whitelister", async ()=>{
            try {
                var res= await Exchange.setLink(WHITELISTED_USER2,{from:WHITELISTER});
                res = await Exchange.link(WHITELISTER);
                console.log("res"+res);
                expect(res.toLowerCase().toString()).to.equal(WHITELISTED_USER2.toLowerCase().toString());           
            } catch (error) {
                console.log("error"+error);
                expect(error.hijackedStack).to.include('Debio agregarlo a la whitelist y no entrar aca');
            }
        });  
    });


// crear usdc
// cargar usdc
// cargar BT (bonus token)
// comprar swf
//intentar de comprar fallidamente mdf
// cargar mdf
//comprar mdf


});