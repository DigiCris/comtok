const SECURITYjson = artifacts.require('SECURITY');
const expect = require('chai').expect;

var _name = "name";
var _symbol = "symbol";
var _supply = "1000";
var _IPFS = "IPFS";
var _contentHash = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB482e9Eb0cE3606eB482e9Eb0b1";
var _PPM = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB482e9Eb0cE3606eB482e9Eb0b0";
var _TermCondition = "TermCondition";

var DEFAULT_ADMIN_ROLE='0x0000000000000000000000000000000000000000000000000000000000000000';
var PAUSER_ROLE='0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a';
var EXCHANGER_ROLE='0x28d62fc77014de57a1bbaa8212ff0979fa61ab00d377b4b8d9762048fb419961';
var WHITELISTER_ROLE='0x8619cecd8b9e095ab43867f5b69d492180450fe862e6b50bfbfb24b75dd84c8a';

var AMOUNT_WHITELISTED='5000';

/*

Pruebas:

1) constructor
	a)Probar los valores que se graban (listo)
2) Grant roll whitelist
	a) que cualquiera intente de dar
	b) que admin de whitelist rol
	c) que el nuevo intente dar whitelist (listo)
3) Dar Roles
	a) dar Pause
	b) dar exchange
	c) dar Default admin (listo)
4) transferir
	a) Intentar transferencia directa a alguien sin whitelist
	b) Agregar a la whitelist
	c) transferir
	d) probar limite de transferencia (listo)
5) Pausar contrato
	a) intentar todo 3c de nuevo (listo)
6) transferFrom
	a) intentar de aprobar a alguien sin rol para moverte los tokens
	b) intentarlo desde ese alguien sin rol hacia alguien con whitelist
	c) intentarlo de alguien con rol hacia alguien sin whitelist
	d) Hacerlo de alguien con rol hacia alguien con whitelist pero sin aprobar. (listo)
7) burn
	a) intentar quemar desde alguien sin exchange
	b) quemar desde alguien con exchange.           (listo)
8) mint
	a) intentar mint desde no exchange a alquien con whitelist
	b) intentar mint desde exchange a alguien sin whitelist
	c) Mint desde exchange a alguien con whitelist
	d) intentar de pasarme en el valor a mintear a c)
	e) intentar de mintear más que el maximo posible con todas las demás condiciones bien. (listo)
9) Despausar contrato
	6) transferFrom
		a) aprobar a alguien sin rol para moverte los tokens
		b) mover desde ese alguien sin rol hacia alguien con whitelist
		c) intentarlo de alguien con rol hacia alguien sin whitelist
		d) Hacerlo de alguien con rol hacia alguien con whitelist pero sin aprobar.
	7) burn
		a) intentar quemar desde alguien sin exchange
		b) quemar desde alguien con exchange.
	8) mint
		a) intentar mint desde no exchange a alquien con whitelist
		b) intentar mint desde exchange a alguien sin whitelist
		c) Mint desde exchange a alguien con whitelist
10) Documents
	a) intentar attach Document por alguien sin admin role
	b) Atach document por admin (varios)
	c) document_name
	d) documentos()

*/





contract("security.js", accounts => {

    [DEFAULT_ADMIN, PAUSER, WHITELISTER, EXCHANGER, WHITELISTED_USER1, WHITELISTED_USER2, NON_WHITELISTED_USER, HACKER, DEFAULT_ADMIN2]= accounts;

    before( async () => {
        Token = await SECURITYjson.new(_name,_symbol,_supply,_IPFS,_contentHash,_PPM,_TermCondition,{from:DEFAULT_ADMIN});
    });

    describe("1) constructor",async ()=>{
        it("name = "+_name, async ()=>{
            const res= await Token.name();
            expect(res).to.equal(_name);
        });
        it("symbol = "+_symbol, async ()=>{
            const res= await Token.symbol();
            expect(res).to.equal(_symbol);
        });
        it("balance owner "+_supply+"000000", async ()=>{
            const res= await Token.balanceOf(DEFAULT_ADMIN);
            const res2='1000000000';
            expect(res.toString()).to.eql(res2);
        });
        it("IPFS = "+_IPFS, async ()=>{
            const res= await Token.ppm();
            expect(res.contrato.uri).to.equal(_IPFS);
        });
        it("contentHash = "+_contentHash, async ()=>{
            const res= await Token.ppm();
            expect(res.contrato.contentHash.toLowerCase()).to.eql(_contentHash.toLowerCase());
        });
        it("TermCondition = "+_TermCondition, async ()=>{
            const res= await Token.ppm();
            expect(res.TermCondition.toLowerCase()).to.eql(_TermCondition.toLowerCase());
        });
        it("max supply = "+_supply+"000000", async ()=>{
            const res= await Token.maxMint();
            const res2= await Token.totalSupply();
            console.log("maximo a mintear = " + res);
            expect(res.toString()).to.eql(res2.toString());
        });
    });

    describe("2) Grant Role Whitelist",async ()=>{
        it("Anyone tries to give the role", async ()=>{
            var res= await Token.hasRole(WHITELISTER_ROLE, WHITELISTER);
            expect(res).to.equal(false);
            //res= await Token.grantRole(WHITELISTER_ROLE, WHITELISTER,{from:PAUSER});
            try {
                res= await Token.grantRole(WHITELISTER_ROLE, WHITELISTER,{from:PAUSER});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
            res= await Token.hasRole(WHITELISTER_ROLE, WHITELISTER);
            expect(res).to.equal(false);
        });
        it("Admin gives the role", async ()=>{
            var res= await Token.hasRole(WHITELISTER_ROLE, WHITELISTER);
            expect(res).to.equal(false);
            //res= await Token.grantRole(WHITELISTER_ROLE, WHITELISTER,{from:PAUSER});
            try {
                res= await Token.grantRole(WHITELISTER_ROLE, WHITELISTER,{from:DEFAULT_ADMIN});
                res= await Token.hasRole(WHITELISTER_ROLE, WHITELISTER);
                expect(res).to.equal(true);             
            } catch (error) {
                expect(error.hijackedStack).to.include('Debia poder darse el rol');
            }
        });
        it("Whitelister tries to give the whitelist role", async ()=>{
            var res= await Token.hasRole(WHITELISTER_ROLE, PAUSER);
            expect(res).to.equal(false);
            //res= await Token.grantRole(WHITELISTER_ROLE, WHITELISTER,{from:PAUSER});
            try {
                res= await Token.grantRole(WHITELISTER_ROLE, PAUSER,{from:WHITELISTER});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
            res= await Token.hasRole(WHITELISTER_ROLE, PAUSER);
            expect(res).to.equal(false);
        });

    });

    describe("3) Give Roles",async ()=>{
        it("Anyone tries to give the pauser role", async ()=>{
            var res= await Token.hasRole(PAUSER_ROLE, PAUSER);
            expect(res).to.equal(false);
            try {
                res= await Token.grantRole(PAUSER_ROLE, PAUSER,{from:WHITELISTED_USER1});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
            res= await Token.hasRole(PAUSER_ROLE, PAUSER);
            expect(res).to.equal(false);
        });
        it("Admin gives the pauser role", async ()=>{
            var res= await Token.hasRole(PAUSER_ROLE, PAUSER);
            expect(res).to.equal(false);
            //res= await Token.grantRole(WHITELISTER_ROLE, WHITELISTER,{from:PAUSER});
            try {
                res= await Token.grantRole(PAUSER_ROLE, PAUSER,{from:DEFAULT_ADMIN});
                res= await Token.hasRole(PAUSER_ROLE, PAUSER);
                expect(res).to.equal(true);             
            } catch (error) {
                expect(error.hijackedStack).to.include('Debia poder darse el rol');
            }
        });
        it("Pauser tries to give the pauser role", async ()=>{
            var res= await Token.hasRole(PAUSER_ROLE, WHITELISTED_USER1);
            expect(res).to.equal(false);
            //res= await Token.grantRole(WHITELISTER_ROLE, WHITELISTER,{from:PAUSER});
            try {
                res= await Token.grantRole(PAUSER_ROLE, WHITELISTED_USER1,{from:PAUSER});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
            res= await Token.hasRole(PAUSER_ROLE, WHITELISTED_USER1);
            expect(res).to.equal(false);
        });

        it("Anyone tries to give the EXCHANGER role", async ()=>{
            var res= await Token.hasRole(EXCHANGER_ROLE, EXCHANGER);
            expect(res).to.equal(false);
            try {
                res= await Token.grantRole(EXCHANGER_ROLE, EXCHANGER,{from:DEFAULT_ADMIN2});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
            res= await Token.hasRole(EXCHANGER_ROLE, EXCHANGER);
            expect(res).to.equal(false);
        });

        it("Anyone tries to give the DEFAULT_ADMIN role", async ()=>{
            var res= await Token.hasRole(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN2);
            expect(res).to.equal(false);
            try {
                res= await Token.grantRole(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN2,{from:PAUSER});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
            res= await Token.hasRole(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN2);
            expect(res).to.equal(false);
        });
        it("Admin gives the DEFAULT_ADMIN role to admin2", async ()=>{
            var res= await Token.hasRole(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN2);
            expect(res).to.equal(false);
            try {
                res= await Token.grantRole(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN2,{from:DEFAULT_ADMIN});
                res= await Token.hasRole(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN2);
                expect(res).to.equal(true);             
            } catch (error) {
                expect(error.hijackedStack).to.include('Debia poder darse el rol');
            }
        });

        it("Admin2 gives the EXCHANGER role", async ()=>{
            var res= await Token.hasRole(EXCHANGER_ROLE, EXCHANGER);
            expect(res).to.equal(false);
            try {
                res= await Token.grantRole(EXCHANGER_ROLE, EXCHANGER,{from:DEFAULT_ADMIN2});
                res= await Token.hasRole(EXCHANGER_ROLE, EXCHANGER);
                expect(res).to.equal(true);             
            } catch (error) {
                expect(error.hijackedStack).to.include('Debia poder darse el rol');
            }
        });
        it("EXCHANGER tries to give the EXCHANGER role", async ()=>{
            var res= await Token.hasRole(EXCHANGER_ROLE, WHITELISTED_USER1);
            expect(res).to.equal(false);
            try {
                res= await Token.grantRole(EXCHANGER_ROLE, WHITELISTED_USER1,{from:EXCHANGER});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
            res= await Token.hasRole(EXCHANGER_ROLE, WHITELISTED_USER1);
            expect(res).to.equal(false);
        });
    });

    describe("4) transfer",async ()=>{

        it("PAUSER tries to whitelist user", async ()=>{
            try {
                var res= await Token.whiteListSelf(WHITELISTED_USER1, AMOUNT_WHITELISTED,{from:PAUSER});
                expect("admin no puede whitelistear").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });

        it("WHITELISTER whitelists user", async ()=>{
            try {
                var res= await Token.whiteListSelf(WHITELISTED_USER1, AMOUNT_WHITELISTED,{from:WHITELISTER});//whiteList
                res= await Token.whiteList(WHITELISTED_USER1);
                expect(res.toString()).to.equal(AMOUNT_WHITELISTED.toString());                
            } catch (error) {
                expect(error.hijackedStack).to.include('Debía poder whitelistearlo');
            }
        });

        it("Direct transfer to a non whitelisted user", async ()=>{
            try {
                var res= await Token.transfer(WHITELISTED_USER2, '1',{from:DEFAULT_ADMIN});
                expect("transfer failed").to.equal('No debí entrar aca');                
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });     
        
        it("Direct transfer to a whitelisted user", async ()=>{
            var res= await Token.balanceOf(WHITELISTED_USER1);
            var cero='0';
            var uno='1';
            expect(res.toString()).to.equal(cero.toString()); 
            try {
                res= await Token.transfer(WHITELISTED_USER1, uno ,{from:DEFAULT_ADMIN});
                res= await Token.balanceOf(WHITELISTED_USER1);
                expect(res.toString()).to.equal(uno.toString());              
            } catch (error) {
                expect(error.hijackedStack).to.include('Debio transferirse y no entrar aca');
            }
        });     

        it("Tries Direct transfer to a whitelisted user passing the limit", async ()=>{
            var res= await Token.balanceOf(WHITELISTED_USER1);
            var cincomil=5000;
            var uno=1;
            try {
                res= await Token.transfer(WHITELISTED_USER1, cincomil ,{from:DEFAULT_ADMIN});
                res= await Token.balanceOf(WHITELISTED_USER1);
                expect(res.toString()).to.equal((uno).toString());              
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });  

        it("Direct transfer to a whitelisted user to the limit", async ()=>{
            var res= await Token.balanceOf(WHITELISTED_USER1);
            var cincomilmenos1=4999;
            try {
                res= await Token.transfer(WHITELISTED_USER1, cincomilmenos1 ,{from:DEFAULT_ADMIN});
                res= await Token.balanceOf(WHITELISTED_USER1);
                expect(res.toString()).to.equal((cincomilmenos1+1).toString());              
            } catch (error) {
                expect(error.hijackedStack).to.include('debio hacer el envío');
            }
        });   


        it("WHITELISTER whitelists user2", async ()=>{
            try {
                var res= await Token.whiteListSelf(WHITELISTED_USER2, AMOUNT_WHITELISTED,{from:WHITELISTER});//whiteList
                res= await Token.whiteList(WHITELISTED_USER2);
                expect(res.toString()).to.equal(AMOUNT_WHITELISTED.toString());                
            } catch (error) {
                expect(error.hijackedStack).to.include('Debía poder whitelistearlo');
            }
        });

        it("WHITELISTER whitelists exchanger", async ()=>{
            try {
                var res= await Token.whiteListSelf(EXCHANGER, AMOUNT_WHITELISTED,{from:WHITELISTER});//whiteList
                res= await Token.whiteList(EXCHANGER);
                expect(res.toString()).to.equal(AMOUNT_WHITELISTED.toString());                
            } catch (error) {
                expect(error.hijackedStack).to.include('Debía poder whitelistearlo');
            }
        });

        it("Direct transfer between whitelisted users", async ()=>{
            var res1= await Token.balanceOf(WHITELISTED_USER2);
            var mil=1000;
            try {
                var res= await Token.transfer(WHITELISTED_USER2, mil ,{from:WHITELISTED_USER1});
                var res2= await Token.balanceOf(WHITELISTED_USER2);
                res = res2 - res1;
                expect(res.toString()).to.equal((mil).toString());              
            } catch (error) {
                expect(error.hijackedStack).to.include('debio hacer el envío');
            }
        });   

    });


    describe("5) Pause contract",async ()=>{
        it("It should be anpaused", async ()=>{
            var res= await Token.paused();
            expect(res).to.equal(false);
        });

        it("approve someone with no role befor pausing should be ok"+_name, async ()=>{
            try {
                var res= await Token.approve(WHITELISTED_USER2,AMOUNT_WHITELISTED,{from:WHITELISTED_USER1});
                res= await Token.allowance(WHITELISTED_USER1,WHITELISTED_USER2);
                expect(res.toString()).to.equal(AMOUNT_WHITELISTED.toString());              
            } catch (error) {
                expect(error.hijackedStack).to.include('No debe entrar aca, tiene que poder aprobar');
            }
        });
        it("Exchanger try to pause the contract", async ()=>{
            var res;
            try {
                res= await Token.pause({from:EXCHANGER});
                var res= await Token.paused();
                expect(res).to.equal(false);           
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("Pauser pauses the contract", async ()=>{
            var res;
            try {
                res= await Token.pause({from:PAUSER});
                var res= await Token.paused();
                expect(res).to.equal(true);           
            } catch (error) {
                expect(error.hijackedStack).to.include('Debio pausarlo y no entrar aca');
            }
        });
        it("Tries Direct transfer between whitelisted users after pausing", async ()=>{
            var res1= await Token.balanceOf(WHITELISTED_USER2);
            var mil=1000;
            try {
                var res= await Token.transfer(WHITELISTED_USER2, mil ,{from:WHITELISTED_USER1});
                var res2= await Token.balanceOf(WHITELISTED_USER2);
                res = res2 - res1;
                expect(res.toString()).to.equal("this must fail: (mil).toString()");              
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });   
        it("Direct transfer from admin to EXCHANGER", async ()=>{
            var res1= await Token.balanceOf(EXCHANGER);
            var mil=1000;
            try {
                var res= await Token.transfer(EXCHANGER, mil ,{from:DEFAULT_ADMIN});
                var res2= await Token.balanceOf(EXCHANGER);
                res = res2 - res1;
                expect(res.toString()).to.equal((mil).toString());              
            } catch (error) {
                expect(error.hijackedStack).to.include('debio hacerse e envio');
            }
        }); 
        
        it("Direct transfer from EXCHANGER to Whitelisted user", async ()=>{
            var res1= await Token.balanceOf(WHITELISTED_USER1);
            var quienentos=500;
            try {
                var res= await Token.transfer(WHITELISTED_USER1, quienentos ,{from:EXCHANGER});
                var res2= await Token.balanceOf(WHITELISTED_USER1);
                res = res2 - res1;
                console.log("posta: " + res + " = " + quienentos);
                expect(res.toString()).to.equal((quienentos).toString());              
            } catch (error) {
                console.log(error);
                expect(error.hijackedStack).to.include('debio hacerse e envio');
            }
        });         

    });






    describe("6) transferFrom",async ()=>{
        it("a) Try to approve someone with no role", async ()=>{
            try {
                var res= await Token.approve(WHITELISTED_USER2,AMOUNT_WHITELISTED,{from:WHITELISTED_USER1});
                expect(res.toString()).to.equal("No debio poder aprobarse");              
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("b) Try to transfer someone's tokens when I'm approved with no role and contract paused", async ()=>{
            var uno=1;
            try {
                var res= await Token.transferFrom(WHITELISTED_USER1, WHITELISTED_USER2, uno,{from:WHITELISTED_USER2});
                expect(res.toString()).to.equal("No debio poder trasnferirse");              
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("c) Try someone with role to someone with no whitelist", async ()=>{
            var uno=1;
            try {
                var res= await Token.transferFrom(WHITELISTED_USER1, HACKER, uno,{from:EXCHANGER});
                expect(res.toString()).to.equal("No debio poder trasnferirse");              
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("d) transfer from someone with role to someone in the whitelist (no approve needed)", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(WHITELISTED_USER2);
            console.log("balance antes= "+bal)
            try {
                var res= await Token.transferFrom(WHITELISTED_USER1, WHITELISTED_USER2, uno,{from:EXCHANGER});
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("balance despues= "+bala)
                res=bala-bal;
                expect(res.toString()).to.equal(uno.toString());              
            } catch (error) {
                expect(error.hijackedStack).to.include('Debio poder transferirse y no entrar aca');
            }
        });

    });





    describe("7) Burn",async ()=>{
        it("a) Try to burn someone with no role", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(WHITELISTED_USER2);
            console.log("balance antes= "+bal)
            try {
                var res= await Token.burn(WHITELISTED_USER2,uno,{from:WHITELISTED_USER1});
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("balance despues sin error= "+bala)
                res=bal-bala;
                expect(res.toString()).to.equal(uno.toString()+"no debio quemar nada");            
            } catch (error) {
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("balance despues con error= "+bala)
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("b) burn from someone with role", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(WHITELISTED_USER2);
            console.log("balance antes= "+bal)
            try {
                var res= await Token.burn(WHITELISTED_USER2,uno,{from:EXCHANGER});
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("balance despues= "+bala)
                res=bal-bala;
                expect(res.toString()).to.equal(uno.toString());            
            } catch (error) {
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("balance despues con error= "+bala)
                expect(error.hijackedStack).to.include('debio poder quemarse y no entrar aca');
            }
        });
        it("c) for burning supply reduced in 1 ", async ()=>{
            var res= await Token.maxMint();
            var res2= await Token.totalSupply();
            console.log("maximo a mintear = " + res);
            console.log("lo que hay minteado = " + res2);
            var uno=1;
            res = res - uno;
            expect(res.toString()).to.eql(res2.toString());
        });
    });


    describe("8) Mint",async ()=>{
        it("a) Try to mint someone with no role", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(WHITELISTED_USER2);
            console.log("8.a)balance antes= "+bal)
            try {
                var res= await Token.mint(WHITELISTED_USER2,uno,{from:WHITELISTED_USER1});
                expect(res.toString()).to.equal(uno.toString()+"no debio poder mintear nada");            
            } catch (error) {
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("8.a)balance despues con error= "+bala)
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("b) Try to mint someone with role but beneficiary not whitelisted", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(HACKER);
            console.log("8.b)balance antes= "+bal)
            try {
                var res= await Token.mint(HACKER,uno,{from:EXCHANGER});
                expect(res.toString()).to.equal(uno.toString()+"no debio poder mintear nada");            
            } catch (error) {
                var bala= await Token.balanceOf(HACKER);
                console.log("8.b)balance despues con error= "+bala)
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("c) mint from someone with role to whitelisted user", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(WHITELISTED_USER2);
            console.log("8.c) balance antes= "+bal)
            try {
                var res= await Token.mint(WHITELISTED_USER2,uno,{from:EXCHANGER});
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("8.c) balance despues= "+bala)
                res=bala-bal;
                expect(res.toString()).to.equal(uno.toString());            
            } catch (error) {
                expect(error.hijackedStack).to.include('debio poder mintear y no entrar aca');
            }
        });
        it("d) for minting... supply is max again ", async ()=>{
            var res= await Token.maxMint();
            var res2= await Token.totalSupply();
            console.log("maximo a mintear = " + res);
            console.log("lo que hay minteado = " + res2);
            expect(res.toString()).to.eql(res2.toString());
        });
        it("e) Try to mint someone with role exceding max", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(WHITELISTED_USER2);
            console.log("8.e)balance antes= "+bal)
            try {
                var res= await Token.mint(WHITELISTED_USER2,uno,{from:EXCHANGER});
                expect(res.toString()).to.equal(uno.toString()+"no debio poder mintear nada");            
            } catch (error) {
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("8.e)balance despues con error= "+bala)
                expect(error.hijackedStack).to.include('revert');
            }
        });
    });




















    describe("9) UNPause contract",async ()=>{
        it("It should be paused", async ()=>{
            var res= await Token.paused();
            expect(res).to.equal(true);
        });
        it("Exchanger try to unpause the contract", async ()=>{
            var res;
            try {
                res= await Token.unpause({from:EXCHANGER});
                var res= await Token.paused();
                expect(res).to.equal(true);           
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("Pauser pauses the contract", async ()=>{
            var res;
            try {
                res= await Token.unpause({from:PAUSER});
                var res= await Token.paused();
                expect(res).to.equal(false);           
            } catch (error) {
                expect(error.hijackedStack).to.include('Debio despausarlo y no entrar aca');
            }
        });
    });












    

    describe("9.6) transferFrom",async ()=>{
        it("a) Try to approve someone with no role", async ()=>{
            try {
                var res= await Token.approve(WHITELISTED_USER2,(AMOUNT_WHITELISTED-10),{from:WHITELISTED_USER1});
                res= await Token.allowance(WHITELISTED_USER1,WHITELISTED_USER2);
                expect(res.toString()).to.equal((AMOUNT_WHITELISTED-10).toString());              
            } catch (error) {
                expect(error.hijackedStack).to.include('Debio poder aprobarlo');
            }
        });
        it("b) Try to transfer someone's tokens when I'm approved with no role and contract unpaused", async ()=>{
            var uno=1;
            var bal1_in= await Token.balanceOf(WHITELISTED_USER1);
            var bal2_in= await Token.balanceOf(WHITELISTED_USER2);
            try {
                var res= await Token.transferFrom(WHITELISTED_USER1, WHITELISTED_USER2, uno,{from:WHITELISTED_USER2});
                var bal1_fin= await Token.balanceOf(WHITELISTED_USER1);
                var bal2_fin= await Token.balanceOf(WHITELISTED_USER2);
                var bal1 = bal1_in - bal1_fin;
                var bal2 = bal2_fin - bal2_in;
                console.log("lo transferido en 9.6.b) = " + bal2);
                expect(bal1.toString()).to.equal(bal2.toString());              
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("c) Try someone with role to someone with no whitelist", async ()=>{
            var uno=1;
            try {
                var res= await Token.transferFrom(WHITELISTED_USER1, HACKER, uno,{from:EXCHANGER});
                expect(res.toString()).to.equal("No debio poder trasnferirse");              
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("d) transfer from someone with role to someone in the whitelist (no approve needed)", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(WHITELISTED_USER2);
            console.log("balance antes= "+bal)
            try {
                var res= await Token.transferFrom(WHITELISTED_USER1, WHITELISTED_USER2, uno,{from:EXCHANGER});
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("balance despues= "+bala)
                res=bala-bal;
                expect(res.toString()).to.equal(uno.toString());              
            } catch (error) {
                expect(error.hijackedStack).to.include('Debio poder transferirse y no entrar aca');
            }
        });
    });


    describe("9.7) Burn",async ()=>{
        it("a) Try to burn someone with no role", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(WHITELISTED_USER2);
            console.log("balance antes= "+bal)
            try {
                var res= await Token.burn(WHITELISTED_USER2,uno,{from:WHITELISTED_USER1});
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("balance despues sin error= "+bala)
                res=bal-bala;
                expect(res.toString()).to.equal(uno.toString()+"no debio quemar nada");            
            } catch (error) {
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("balance despues con error= "+bala)
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("b) burn from someone with role", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(WHITELISTED_USER2);
            console.log("balance antes= "+bal)
            try {
                var res= await Token.burn(WHITELISTED_USER2,uno,{from:EXCHANGER});
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("balance despues= "+bala)
                res=bal-bala;
                expect(res.toString()).to.equal(uno.toString());            
            } catch (error) {
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("balance despues con error= "+bala)
                expect(error.hijackedStack).to.include('debio poder quemarse y no entrar aca');
            }
        });
        it("c) for burning supply reduced in 1 ", async ()=>{
            var res= await Token.maxMint();
            var res2= await Token.totalSupply();
            console.log("maximo a mintear = " + res);
            console.log("lo que hay minteado = " + res2);
            var uno=1;
            res = res - uno;
            expect(res.toString()).to.eql(res2.toString());
        });
    });

    describe("9.8) Mint",async ()=>{
        it("a) Try to mint someone with no role", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(WHITELISTED_USER2);
            console.log("8.a)balance antes= "+bal)
            try {
                var res= await Token.mint(WHITELISTED_USER2,uno,{from:WHITELISTED_USER1});
                expect(res.toString()).to.equal(uno.toString()+"no debio poder mintear nada");            
            } catch (error) {
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("8.a)balance despues con error= "+bala)
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("b) Try to mint someone with role but beneficiary not whitelisted", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(HACKER);
            console.log("8.b)balance antes= "+bal)
            try {
                var res= await Token.mint(HACKER,uno,{from:EXCHANGER});
                expect(res.toString()).to.equal(uno.toString()+"no debio poder mintear nada");            
            } catch (error) {
                var bala= await Token.balanceOf(HACKER);
                console.log("8.b)balance despues con error= "+bala)
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("c) mint from someone with role to whitelisted user", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(WHITELISTED_USER2);
            console.log("8.c) balance antes= "+bal)
            try {
                var res= await Token.mint(WHITELISTED_USER2,uno,{from:EXCHANGER});
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("8.c) balance despues= "+bala)
                res=bala-bal;
                expect(res.toString()).to.equal(uno.toString());            
            } catch (error) {
                expect(error.hijackedStack).to.include('debio poder mintear y no entrar aca');
            }
        });
        it("d) for minting... supply is max again ", async ()=>{
            var res= await Token.maxMint();
            var res2= await Token.totalSupply();
            console.log("maximo a mintear = " + res);
            console.log("lo que hay minteado = " + res2);
            expect(res.toString()).to.eql(res2.toString());
        });
        it("e) Try to mint someone with role exceding max", async ()=>{
            var uno=1;
            var bal= await Token.balanceOf(WHITELISTED_USER2);
            console.log("8.e)balance antes= "+bal)
            try {
                var res= await Token.mint(WHITELISTED_USER2,uno,{from:EXCHANGER});
                expect(res.toString()).to.equal(uno.toString()+"no debio poder mintear nada");            
            } catch (error) {
                var bala= await Token.balanceOf(WHITELISTED_USER2);
                console.log("8.e)balance despues con error= "+bala)
                expect(error.hijackedStack).to.include('revert');
            }
        });
    });





/*
	a) intentar attach Document por alguien sin admin role
	b) Atach document por admin (varios)
	c) document_name
	d) documentos()
*/

var DOC1_NAME = web3.utils.asciiToHex("name1")+'000000000000000000000000000000000000000000000000000000';
var DOC1_HASH = "0x9b46b0dd3a8083c070c3b9953bb5f3f95c5ab4da000000000000000000000000";
var DOC1_URI = "http://www.sha1-online.com?name=1";

var DOC2_NAME = web3.utils.asciiToHex("name2")+'000000000000000000000000000000000000000000000000000000';
var DOC2_HASH = "0x39ea84acf1fef629fef18a9c6f5799bba32ecc25000000000000000000000000";
var DOC2_URI = "http://www.sha1-online.com?name=2";

var DOC3_NAME = web3.utils.asciiToHex("name3")+'000000000000000000000000000000000000000000000000000000';
var DOC3_HASH = "0x1aefcd1b0f39da45fa1fd7236f683c907c15ef82000000000000000000000000";
var DOC3_URI = "http://www.sha1-online.com?name=3";

var name1;
var name2;
var name3;

    describe("9) Documents",async ()=>{
        it("Exchanger try to attach documents", async ()=>{
            var res;
            try {
                res= await Token.attachDocument(DOC1_NAME,DOC1_HASH,DOC1_URI,{from:EXCHANGER});
                console.log(DOC1_NAME + " = " + DOC1_HASH + " = " + DOC1_URI);
                expect(res).to.equal("no debio poder attachar por falta de permisos");           
            } catch (error) {
                console.log(DOC1_NAME + " = " + DOC1_HASH + " = " + DOC1_URI);
                expect(error.hijackedStack).to.include('revert');
            }
        });

        it("DEFAULT_ADMIN attach document 1", async ()=>{
            var res;
            try {
                res= await Token.attachDocument(DOC1_NAME,DOC1_HASH,DOC1_URI,{from:DEFAULT_ADMIN});
                res= await Token.lookupDocument(DOC1_NAME);
                console.log(res[1]);
                expect(res[1].toString()).to.equal(DOC1_HASH.toString());           
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("DEFAULT_ADMIN attach document 2", async ()=>{
            var res;
            try {
                res= await Token.attachDocument(DOC2_NAME,DOC2_HASH,DOC2_URI,{from:DEFAULT_ADMIN});
                res= await Token.lookupDocument(DOC2_NAME);
                console.log(res[1]);
                expect(res[1].toString()).to.equal(DOC2_HASH.toString());           
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("DEFAULT_ADMIN attach document 3", async ()=>{
            var res;
            try {
                res= await Token.attachDocument(DOC3_NAME,DOC3_HASH,DOC3_URI,{from:DEFAULT_ADMIN});
                res= await Token.lookupDocument(DOC3_NAME,{from:HACKER});
                console.log(res[1]);
                expect(res[1].toString()).to.equal(DOC3_HASH.toString());           
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("DEFAULT_ADMIN tries to modify document 3", async ()=>{
            var res;
            try {
                res= await Token.attachDocument(DOC3_NAME,DOC2_HASH,DOC2_URI,{from:DEFAULT_ADMIN});
                expect("esto no se hace").to.equal("no debio entrar aca");           
            } catch (error) {
                expect(error.hijackedStack).to.include('revert');
            }
        });
        it("anyone reads documents name. they can then search it like in the previous tests", async ()=>{
            name1= await Token.document_names(1, {from: HACKER}); //_PPM
            name2= await Token.document_names(2);
            name3= await Token.document_names(3);
            var namePPM= await Token.document_names(0);
            expect(name1).to.equal(DOC1_NAME);  
            expect(name2).to.equal(DOC2_NAME);  
            expect(name3).to.equal(DOC3_NAME);  
            expect(namePPM.toLowerCase()).to.equal(_PPM.toLowerCase());  
        });
        it("Anyone trying to read document 2 ERC1462", async ()=>{
            try {
                res= await Token.lookupDocument(name2,{from:HACKER});
                expect(res[1].toString()).to.equal(DOC2_HASH.toString());           
            } catch (error) {
                expect(error.hijackedStack).to.include('No deberia revertir');
            }
        });
        it("Anyone trying to read document 2 complete (documents)", async ()=>{
            try {
                res= await Token.documents(name2,{from:HACKER});
                expect(res.contentHash.toString()).to.equal(DOC2_HASH.toString()); 
                expect(res.name.toString()).to.equal(DOC2_NAME.toString()); 
                expect(res.uri.toString()).to.equal(DOC2_URI.toString());           
            } catch (error) {
                expect(error.hijackedStack).to.include('No deberia revertir');
            }
        });

    });






});