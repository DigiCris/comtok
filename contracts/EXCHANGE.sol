// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

abstract contract Pausable is ERC2771Context {
    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    bool private _paused;

    /**
     * @dev Initializes the contract in unpaused state.
     */
    constructor() {
        _paused = false;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        require(!paused(), "Pausable: paused");
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        require(paused(), "Pausable: not paused");
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

/**
 * @dev Contract module that allows children to implement role-based access
 * control mechanisms. This is a lightweight version that doesn't allow enumerating role
 * members except through off-chain means by accessing the contract event logs. Some
 * applications may benefit from on-chain enumerability, for those cases see
 * {AccessControlEnumerable}.
 *
 * Roles are referred to by their `bytes32` identifier. These should be exposed
 * in the external API and be unique. The best way to achieve this is by
 * using `public constant` hash digests:
 *
 * ```solidity
 * bytes32 public constant MY_ROLE = keccak256("MY_ROLE");
 * ```
 *
 * Roles can be used to represent a set of permissions. To restrict access to a
 * function call, use {hasRole}:
 *
 * ```solidity
 * function foo() public {
 *     require(hasRole(MY_ROLE, msg.sender));
 *     ...
 * }
 * ```
 *
 * Roles can be granted and revoked dynamically via the {grantRole} and
 * {revokeRole} functions. Each role has an associated admin role, and only
 * accounts that have a role's admin role can call {grantRole} and {revokeRole}.
 *
 * By default, the admin role for all roles is `DEFAULT_ADMIN_ROLE`, which means
 * that only accounts with this role will be able to grant or revoke other
 * roles. More complex role relationships can be created by using
 * {_setRoleAdmin}.
 *
 * WARNING: The `DEFAULT_ADMIN_ROLE` is also its own admin: it has permission to
 * grant and revoke this role. Extra precautions should be taken to secure
 * accounts that have been granted it. We recommend using {AccessControlDefaultAdminRules}
 * to enforce additional security measures for this role.
 */
abstract contract AccessControl is ERC2771Context, IAccessControl, ERC165 {
    struct RoleData {
        mapping(address => bool) members;
        bytes32 adminRole;
    }

    mapping(bytes32 => RoleData) private _roles;

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    /**
     * @dev Modifier that checks that an account has a specific role. Reverts
     * with a standardized message including the required role.
     *
     * The format of the revert reason is given by the following regular expression:
     *
     *  /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/
     *
     * _Available since v4.1._
     */
    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) public view virtual override returns (bool) {
        return _roles[role].members[account];
    }

    /**
     * @dev Revert with a standard message if `_msgSender()` is missing `role`.
     * Overriding this function changes the behavior of the {onlyRole} modifier.
     *
     * Format of the revert message is described in {_checkRole}.
     *
     * _Available since v4.6._
     */
    function _checkRole(bytes32 role) internal view virtual {
        _checkRole(role, _msgSender());
    }

    /**
     * @dev Revert with a standard message if `account` is missing `role`.
     *
     * The format of the revert reason is given by the following regular expression:
     *
     *  /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/
     */
    function _checkRole(bytes32 role, address account) internal view virtual {
        if (!hasRole(role, account)) {
            revert(
                string(
                    abi.encodePacked(
                        "AccessControl: account ",
                        Strings.toHexString(account),
                        " is missing role ",
                        Strings.toHexString(uint256(role), 32)
                    )
                )
            );
        }
    }

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) public view virtual override returns (bytes32) {
        return _roles[role].adminRole;
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     *
     * May emit a {RoleGranted} event.
     */
    function grantRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     *
     * May emit a {RoleRevoked} event.
     */
    function revokeRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
    }

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been revoked `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `account`.
     *
     * May emit a {RoleRevoked} event.
     */
    function renounceRole(bytes32 role, address account) public virtual override {
        require(account == _msgSender(), "AccessControl: can only renounce roles for self");

        _revokeRole(role, account);
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event. Note that unlike {grantRole}, this function doesn't perform any
     * checks on the calling account.
     *
     * May emit a {RoleGranted} event.
     *
     * [WARNING]
     * ====
     * This function should only be called from the constructor when setting
     * up the initial roles for the system.
     *
     * Using this function in any other way is effectively circumventing the admin
     * system imposed by {AccessControl}.
     * ====
     *
     * NOTE: This function is deprecated in favor of {_grantRole}.
     */
    function _setupRole(bytes32 role, address account) internal virtual {
        _grantRole(role, account);
    }

    /**
     * @dev Sets `adminRole` as ``role``'s admin role.
     *
     * Emits a {RoleAdminChanged} event.
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        bytes32 previousAdminRole = getRoleAdmin(role);
        _roles[role].adminRole = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * Internal function without access restriction.
     *
     * May emit a {RoleGranted} event.
     */
    function _grantRole(bytes32 role, address account) internal virtual {
        if (!hasRole(role, account)) {
            _roles[role].members[account] = true;
            emit RoleGranted(role, account, _msgSender());
        }
    }

    /**
     * @dev Revokes `role` from `account`.
     *
     * Internal function without access restriction.
     *
     * May emit a {RoleRevoked} event.
     */
    function _revokeRole(bytes32 role, address account) internal virtual {
        if (hasRole(role, account)) {
            _roles[role].members[account] = false;
            emit RoleRevoked(role, account, _msgSender());
        }
    }
}


//registry=0x4A53338c6A1D5C5Afd6Af1cF6fb3351CeB0b98c4
//forwarder=0x7292dCdE3915525981014787138A372cBdB8Cd4F

/// @custom:security-contact soporte@comunyt.com
contract EXCHANGE is  Pausable, AccessControl, MinimalForwarder {

    mapping (string => IERC20) public currency; // solo estables
    mapping (string => IERC20) public security; // solo propiedades
    // las anteriore van a cambio de estas dos
    IERC20 public propiedad;
    IERC20 public usdc;
    //////////

    mapping (string => uint8) decimals;

    mapping (string => address) public crowdfounding;// el addres a la que está ligado el security para recibir el dinero
    string[] securitiesListed;
    mapping (address => address) public link; // los address que van a estar linkeados cuando le damos a la whitelist

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant WHITELISTER_ROLE = keccak256("WHITELISTER_ROLE");
    bytes32 public constant PROJECTCREATOR_ROLE = keccak256("PROJECTCREATOR_ROLE");
    bytes32 public constant EXCHANGER_ROLE = keccak256("EXCHANGER_ROLE"); // se lo saque a compra() y ya no lo uso


    event ProjectAdded(address indexed whoAdded, address indexed security, uint256 indexed timestamp, string curName, address funds);
    event CurrencyAdded(address indexed whoAdded, address indexed currency, uint256 indexed timestamp, string curName);
    event Trade(address indexed curSender, address indexed secReceiver, uint256 indexed timestamp, uint256 quantity);
    event whiteListed(address indexed curAddr, address indexed secAddr, uint256 indexed timestamp, address whoAdded);

    constructor(MinimalForwarder forwarder) ERC2771Context(address(forwarder)) payable{
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(WHITELISTER_ROLE, msg.sender);
        _grantRole(PROJECTCREATOR_ROLE, msg.sender);
        _grantRole(EXCHANGER_ROLE, msg.sender);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setSecurity(string calldata _name, address _propiedad, address _funds, uint8 _decimals) external onlyRole(PROJECTCREATOR_ROLE) {
        security[_name] = IERC20(_propiedad);
        crowdfounding[_name] = _funds;
        securitiesListed.push(_name);
        decimals[_name] = _decimals;
        emit ProjectAdded(msg.sender, _propiedad, block.timestamp, _name, _funds);
    }
    function setCurrency(string calldata _name, address _addr, uint8 _decimals) external onlyRole(PROJECTCREATOR_ROLE) {
        currency[_name] = IERC20(_addr);
        usdc=IERC20(_addr);// esto de acá no iría
        decimals[_name] = _decimals;
        emit CurrencyAdded(msg.sender, _addr, block.timestamp, _name);
    }

    // para hacer un whitelist, la persona añade su _link custodio en donde tiene sus usdc
    //_owner es la semicustodial que firma y manda al relayer.
    // el relayer tiene whitelister_role
    function setLink(address _link) external {
        require(link[_link]==address(0x0),"already registered");
        address _owner = _msgSender();
        link[_owner]=_link;
        link[_link]=_owner;// no debería hacer falta pero para probar ya que no me tomaba el linkeo
        emit whiteListed(_link, _owner, block.timestamp, _owner);
    }

    // Misma solucion anterior pero en caso de tener que hacerlo manual
    function setLinkManual(address _link, address _linksemi) external onlyRole(WHITELISTER_ROLE) {
        link[_linksemi]=_link;
        link[_link]=_linksemi;// no debería hacer falta pero para probar ya que no me tomaba el linkeo
        emit whiteListed(_link, _linksemi, block.timestamp, _msgSender());
    }    

    // moneda=usdc, bonus token, securiry=swf, mdf, cantidad=10, 100 etc.
    // la cantidad mandaarlo en valor de la moneda (currency=Z usdc por ejemplo)
    function comprar(string calldata _currency, string calldata _security, uint256 _amount) external whenNotPaused  returns(bool _success) {
        uint8 decCur = decimals[_currency];
        uint8 decSec = decimals[_security];
        if(decCur == decSec) {
            currency[_currency].transferFrom(link[_msgSender()], crowdfounding[_security], _amount);
            security[_security].transfer(_msgSender(), _amount);
            emit Trade(link[_msgSender()], _msgSender(), block.timestamp, _amount);
            return true;        
        }
        uint8 difDec;
        if(decCur > decSec) {
        //  currency = USDC
        // security = SWF
        // para comprar mando => 1000000 USDC (1 dolar)
        // como => 6 > 2
        // tengo que dar => 1 dolar de swf
        // 1 dolar swf = 100 swf
            difDec = decimals[_currency] - decimals[_security];
            currency[_currency].transferFrom(link[_msgSender()], crowdfounding[_security], _amount);
            _amount = _amount / (10 ** difDec);
            security[_security].transfer(_msgSender(), _amount);      
        } else {
        //  currency = USDC
        // security = SWF
        // para comprar mando => 1000000 USDC (1 dolar)
        // como => 6 < 9
        // tengo que dar => 1 dolar de swf
        // 1 dolar swf = 1000000000 swf
            difDec = decimals[_security] - decimals[_currency];
            currency[_currency].transferFrom(link[_msgSender()], crowdfounding[_security], _amount);
            _amount = _amount * (10 ** difDec);
            security[_security].transfer(_msgSender(), _amount);
        }
        emit Trade(link[_msgSender()], _msgSender(), block.timestamp, _amount);
        return true; 
    }



}
