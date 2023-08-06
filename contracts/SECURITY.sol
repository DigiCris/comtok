//SPDX-License-Identifier: MIT 
pragma solidity ^0.8.9;

import "./UTILITY.sol";
import "./ERC1066.sol";

//5095785 * 53GW = 0.27Matic * 0.6651 dolar/matic= 0.22 dolares por creacion token
//186870  * 53GW = 0.01Matic * 0.6651 dolar/matic= 0.007dolar  // por transferencia directa
//61088   * 53GW = 0.0021 dolar// por segunda transaccion

/// @custom:security-contact soporte@comunyt.com
contract SECURITY is ERC1066, UTILITY {

/////////////////////////////// Extension ERC1462 for compliance ////////////////////////////////////////////

    event DecumentAdded(bytes32 indexed _name, bytes32 _contentHash, uint256 _timeStamp);
    event Whitelisted(address indexed _addr, uint256 _amount, uint256 _timeStamp);

    struct Document {
        uint256 timeStamp;
        bytes32 name;
        bytes32 contentHash;
        string uri;
    }

    struct PPM {
        Document contrato;
        string TermCondition;
    }

    mapping (bytes32 => Document) public documents;
    mapping (address => uint256) public whiteList;
    PPM public ppm;
    uint256 public maxMint;
    bytes32 public constant WHITELISTER_ROLE = keccak256("WHITELISTER_ROLE");
    bytes32 public constant EXCHANGE_ROLE = keccak256("EXCHANGE_ROLE");
    bytes32[] public document_names;
    

    constructor(string memory _name, string memory _symbol, uint256 _supply, string memory _IPFS, bytes32 _contentHash, bytes32 _PPM, string memory _TermCondition) UTILITY(_name, _symbol) payable {
        uint256 _time = block.timestamp;
        ppm.contrato = Document(_time,_PPM, _contentHash, _IPFS);
        ppm.TermCondition = _TermCondition;//"Unirse a la whitelist es aceptar el ppm";
        documents[_PPM] = Document(_time,_PPM, _contentHash, _IPFS);
        document_names.push(_PPM);
        uint256 _ScaledSuply = _supply * 10 ** decimals();
        _mint(_msgSender(), _ScaledSuply);
        _grantRole(WHITELISTER_ROLE, _msgSender());
        _grantRole(EXCHANGE_ROLE, _msgSender());
        maxMint = _ScaledSuply;
        emit DecumentAdded(_PPM, _contentHash, _time);
    }

    
    function whiteListSelf(address _person, uint256 _amount) external virtual whenNotPaused onlyRole(WHITELISTER_ROLE) returns (uint256 max) {
        whiteList[_person] = _amount;
        emit Whitelisted(_person, _amount, block.timestamp);
        return _amount;
    }

    function whiteListBach(address[] calldata _people, uint256 _amount) external virtual whenNotPaused onlyRole(WHITELISTER_ROLE) returns (uint256 max) {
        uint256 _size = _people.length;
        uint256 _time = block.timestamp;
        address _addr;
        while(_size != 0) {
            unchecked {
                _size--;
            }
            _addr = _people[_size];
            whiteList[_addr] = _amount;
            emit Whitelisted(_addr, _amount, _time);
        }
        return _amount;
    }
    

    function attachDocument(bytes32 _name, bytes32 _contentHash, string calldata _uri) external onlyRole(DEFAULT_ADMIN_ROLE){
        require(_name.length != 0, "name must not be empty");
        require(_contentHash.length != 0, "Missing hash, SHA-1 recomended");
        require(bytes(_uri).length != 0, "external URI must not be empty");
        require(documents[_name].timeStamp == 0, "Name already exists");
        uint256 _time = block.timestamp;
        documents[_name] = Document(_time, _name, _contentHash, _uri);
        document_names.push(_name);
        emit DecumentAdded(_name, _contentHash, _time);
    }
   
    function lookupDocument(bytes32 _name) external view returns (string memory, bytes32) {
        Document storage _doc = documents[_name];
        return (_doc.uri, _doc.contentHash);
    }


    function transfer(address _to, uint256 _value) public virtual  override returns (bool) {
        require(checkTransferAllowed(_msgSender(), _to, _value) == STATUS_ALLOWED, "transfer not allowed");
        return ERC20.transfer(_to, _value);
    }

    function approve(address _spender, uint256 _amount) public virtual override whenNotPaused returns (bool) {
        return ERC20.approve(_spender, _amount);
    }    

    function transferFrom(address _from, address _to, uint256 _value) public virtual  override returns (bool) {
        require(checkTransferFromAllowed(_from, _to, _value) == STATUS_ALLOWED, "transfer not allowed");
        if( hasRole(EXCHANGE_ROLE, _msgSender()) ) {
            ERC20._burn(_from, _value);
            ERC20._mint(_to, _value);
            return true;
        }
        return ERC20.transferFrom(_from, _to, _value);
    }

    function mint(address _to, uint256 _amount) public virtual onlyRole(EXCHANGE_ROLE) {
        require(checkMintAllowed(_to, _amount) == STATUS_ALLOWED, "mint not allowed");
        ERC20._mint(_to, _amount);
    }

    function burn(address _account, uint256 _amount) public virtual onlyRole(EXCHANGE_ROLE) {
        require(checkBurnAllowed(_account, _amount) == STATUS_ALLOWED, "burn not allowed");
        ERC20._burn(_account, _amount);
    }

    function checkTransferAllowed(address /*_from*/, address _to, uint256 _quantity) public virtual view returns (bytes1) {
        address _spender=_msgSender();
        //Si el spender no tiene rol de exchange
        if(!hasRole(EXCHANGE_ROLE, _spender)) {
            // verifico si esta pausado... sino sigo 
            _requireNotPaused(); 
        }        
        
        //  verifico whitelist para ver si quien recibe puede hacerlo y no excede el monto que tiene permitido
        // no verifico todo lo que el ERC20 ya verifica para ahorrar gas y código
        if(balanceOf(_to) + _quantity <= (whiteList[_to])) {
            return STATUS_ALLOWED ;
        }
        return STATUS_DISALLOWED ;
    }
   
    function checkTransferFromAllowed(address /*_from*/, address _to, uint256 _quantity) public virtual view returns (bytes1) {
        address _spender=_msgSender();
        //Si el spender no tiene rol de exchange
        if(!hasRole(EXCHANGE_ROLE, _spender)) {
            // verifico si esta pausado
            _requireNotPaused(); 
        }
        // y luego Verifico que se pueda transferir. Si tiene el rol, aunque esté pausado puede seguir
        // es igual a checkTransferAllowed. Pero no lo llamo para ahorrarme el jump a la funcion
        if(balanceOf(_to) + _quantity <= (whiteList[_to])) {
            return STATUS_ALLOWED ;
        }
        return STATUS_DISALLOWED ;
    }
   
    function checkMintAllowed(address _to, uint256 _quantity) public virtual view returns (bytes1) {
        //  verifico whitelist para ver si quien recibe puede hacerlo y no excede el monto que tiene permitido
        if(balanceOf(_to) + _quantity <= (whiteList[_to])) {
            // y le doy permiso
            if(totalSupply() + _quantity > maxMint) {
                return STATUS_DISALLOWED;
            }
            return STATUS_ALLOWED ;
        }
        return STATUS_DISALLOWED;
    }
   
    function checkBurnAllowed(address /*_from*/, uint256 /*_quantity*/) public virtual view returns (bytes1) {
        return STATUS_ALLOWED;
    }

}