// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
 * BOAT MONEY - BoatNFT (Multi-Game)
 *
 * ERC721Enumerable with per-token "level" (1..4).
 * Supports multiple authorized game contracts via allowlist, so BOAT, JOINT,
 * and future games can all mint/burn/change levels concurrently.
 *
 * Notes:
 * - Owner manages allowed games with addGame/removeGame.
 * - Existing function signatures preserved (mintTo, gameBurn, gameSetLevel, levelOf).
 * - Base URI per level retained.
 * - Pausable behavior retained.
 * - Migration: Redeploy this contract and redeploy game contracts pointing to
 *   this NFT address; then owner addGame() for each game.
 */

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC721/IERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/utils/Strings.sol";

contract BoatNFTMulti is ERC721Enumerable, Ownable {
    using Strings for uint256;
    using SafeERC20 for IERC20;

    // ===== Levels & Supply =====
    mapping(uint256 => uint8) private _levelOf;
    uint256 public nextId = 1;

    // ===== Pause =====
    bool private _paused;
    event Paused(address account);
    event Unpaused(address account);
    modifier whenNotPaused() { require(!_paused, "BoatNFT:paused"); _; }
    modifier whenPaused() { require(_paused, "BoatNFT:not-paused"); _; }

    // ===== Game Allowlist =====
    mapping(address => bool) public isGame; // multiple game contracts supported
    event GameAllowed(address indexed game, bool allowed);

    // Backwards-compat optional single-game setter (marks allowed=true)
    event GameSet(address indexed game);

    // ===== Metadata =====
    mapping(uint8 => string) public baseURIForLevel; // 1..4 => base URI
    event BaseURISet(uint8 indexed level, string uri);
    event LevelSet(uint256 indexed tokenId, uint8 level);

    // ===== Modifiers =====
    modifier onlyGame() { require(isGame[msg.sender], "BoatNFT:not-game"); _; }

    constructor() ERC721("BOAT MONEY", "BOATNFT") {}

    // ===== Admin =====
    function pause() external onlyOwner whenNotPaused { _paused = true; emit Paused(msg.sender); }
    function unpause() external onlyOwner whenPaused { _paused = false; emit Unpaused(msg.sender); }

    /// Allow a game contract
    function addGame(address game) external onlyOwner {
        require(game != address(0), "BoatNFT:zero");
        isGame[game] = true;
        emit GameAllowed(game, true);
    }

    /// Remove a game contract
    function removeGame(address game) external onlyOwner {
        isGame[game] = false;
        emit GameAllowed(game, false);
    }

    /// Backwards-compat: set a single game (alias to addGame)
    function setGame(address game) external onlyOwner {
        require(game != address(0), "BoatNFT:zero");
        isGame[game] = true;
        emit GameSet(game);
        emit GameAllowed(game, true);
    }

    function setBaseURIForLevel(uint8 level, string calldata uri) external onlyOwner {
        require(level >= 1 && level <= 4, "BoatNFT:bad-level");
        baseURIForLevel[level] = uri;
        emit BaseURISet(level, uri);
    }

    // ===== Game-only mint/burn/level =====
    function mintTo(address to, uint8 level) external onlyGame whenNotPaused returns (uint256 tokenId) {
        require(level >= 1 && level <= 4, "BoatNFT:level");
        tokenId = nextId++;
        _safeMint(to, tokenId);
        _levelOf[tokenId] = level;
        emit LevelSet(tokenId, level);
    }

    function gameBurn(uint256 tokenId) external onlyGame whenNotPaused {
        _burn(tokenId);
        delete _levelOf[tokenId];
    }

    function gameSetLevel(uint256 tokenId, uint8 newLevel) external onlyGame whenNotPaused {
        require(_exists(tokenId), "BoatNFT:!exists");
        require(newLevel >= 1 && newLevel <= 4, "BoatNFT:range");
        _levelOf[tokenId] = newLevel;
        emit LevelSet(tokenId, newLevel);
    }

    // ===== Views =====
    function levelOf(uint256 tokenId) external view returns (uint8) {
        require(_exists(tokenId), "BoatNFT:!exists");
        return _levelOf[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "BoatNFT:!exists");
        uint8 lvl = _levelOf[tokenId];
        string memory base = baseURIForLevel[lvl];
        if (bytes(base).length == 0) return "";
        return string(abi.encodePacked(base, tokenId.toString(), ".json"));
    }

    // ===== Emergency withdraws (only when paused) =====
    function rescueERC20(address token, uint256 amount, address to) external onlyOwner whenPaused {
        require(to != address(0), "BoatNFT:zero");
        IERC20(token).safeTransfer(to, amount);
    }
    function rescueERC721(address nft, uint256 tokenId, address to) external onlyOwner whenPaused {
        require(to != address(0), "BoatNFT:zero");
        IERC721(nft).safeTransferFrom(address(this), to, tokenId);
    }

    /// @dev Register my contract on Sonic FeeM
    function registerMe() external {
        (bool _success,) = address(0xDC2B0D2Dd2b7759D97D50db4eabDC36973110830).call(
            abi.encodeWithSignature("selfRegister(uint256)", 92)
        );
        require(_success, "FeeM registration failed");
    }
}
