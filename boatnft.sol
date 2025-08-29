// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
 * BOAT MONEY - BoatNFT
 * ERC721Enumerable with a "level" per token:
 *   1 = Raft, 2 = Dinghy, 3 = Speedboat, 4 = Yacht
 * Only the configured game contract can mint/burn/change levels.
 *
 * Pinned OpenZeppelin v4.8.3 imports.
 */

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC721/IERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/utils/Strings.sol";

contract BoatNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;
    using SafeERC20 for IERC20;

    mapping(uint256 => uint8) private _levelOf;
    uint256 public nextId = 1;

    bool private _paused;
    event Paused(address account);
    event Unpaused(address account);

    modifier whenNotPaused() { require(!_paused, "BoatNFT:paused"); _; }
    modifier whenPaused() { require(_paused, "BoatNFT:not-paused"); _; }

    address public game;
    mapping(uint8 => string) public baseURIForLevel;

    event GameSet(address indexed game);
    event BaseURISet(uint8 indexed level, string uri);
    event LevelSet(uint256 indexed tokenId, uint8 level);

    modifier onlyGame() { require(msg.sender == game, "BoatNFT:not-game"); _; }

    constructor() ERC721("BOAT MONEY", "BOATNFT") {}

    function pause() external onlyOwner whenNotPaused { _paused = true; emit Paused(msg.sender); }
    function unpause() external onlyOwner whenPaused { _paused = false; emit Unpaused(msg.sender); }

    function setGame(address _game) external onlyOwner {
        require(_game != address(0), "BoatNFT:zero");
        game = _game;
        emit GameSet(_game);
    }

    function setBaseURIForLevel(uint8 level, string calldata uri) external onlyOwner {
        require(level >= 1 && level <= 4, "BoatNFT:bad-level");
        baseURIForLevel[level] = uri;
        emit BaseURISet(level, uri);
    }

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

    // Emergency withdraws (only when paused)
    function rescueERC20(address token, uint256 amount, address to) external onlyOwner whenPaused {
        require(to != address(0), "BoatNFT:zero");
        IERC20(token).safeTransfer(to, amount);
    }
    function rescueERC721(address nft, uint256 tokenId, address to) external onlyOwner whenPaused {
        require(to != address(0), "BoatNFT:zero");
        IERC721(nft).safeTransferFrom(address(this), to, tokenId);
    }
}
