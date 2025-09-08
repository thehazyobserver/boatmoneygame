// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
 * BoatNFT Game Router
 *
 * Purpose: Allow multiple game contracts (BoatGame, JointBoatGame) to safely
 * call a single BoatNFT that only accepts a single `game` (msg.sender) for
 * mint/burn/level changes.
 *
 * How it works:
 * - Set BoatNFT.game = this router's address (owner of BoatNFT must call setGame)
 * - Add both game contracts to `isGame` allowlist via addGame/removeGame
 * - Deploy BoatGame/JointBoatGame with the NFT constructor param pointing to this router address
 * - Games keep calling mintTo/gameBurn/gameSetLevel/ownerOf/levelOf/balanceOf like before;
 *   router authorizes the caller and forwards to the real NFT.
 *
 * Benefits:
 * - No need to redeploy the existing BoatNFT or migrate tokens
 * - Both games can run simultaneously
 */

interface IBoatNFTCore {
    function mintTo(address to, uint8 level) external returns (uint256 tokenId);
    function gameBurn(uint256 tokenId) external;
    function gameSetLevel(uint256 tokenId, uint8 newLevel) external;
    function levelOf(uint256 tokenId) external view returns (uint8);
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract BoatNftRouter {
    IBoatNFTCore public immutable NFT;
    address public owner;
    mapping(address => bool) public isGame;

    event OwnerSet(address indexed owner);
    event GameAllowed(address indexed game, bool allowed);

    modifier onlyOwner() { require(msg.sender == owner, "Router:not-owner"); _; }
    modifier onlyGame() { require(isGame[msg.sender], "Router:not-game"); _; }

    constructor(IBoatNFTCore realNft) {
        require(address(realNft) != address(0), "Router:zero-nft");
        NFT = realNft;
        owner = msg.sender;
        emit OwnerSet(msg.sender);
    }

    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Router:zero");
        owner = newOwner;
        emit OwnerSet(newOwner);
    }

    function addGame(address game) external onlyOwner {
        require(game != address(0), "Router:zero");
        isGame[game] = true;
        emit GameAllowed(game, true);
    }

    function removeGame(address game) external onlyOwner {
        isGame[game] = false;
        emit GameAllowed(game, false);
    }

    // ===== Mutating calls (restricted) =====
    function mintTo(address to, uint8 level) external onlyGame returns (uint256 tokenId) {
        tokenId = NFT.mintTo(to, level);
    }

    function gameBurn(uint256 tokenId) external onlyGame {
        NFT.gameBurn(tokenId);
    }

    function gameSetLevel(uint256 tokenId, uint8 newLevel) external onlyGame {
        NFT.gameSetLevel(tokenId, newLevel);
    }

    // ===== Views (open) =====
    function levelOf(uint256 tokenId) external view returns (uint8) {
        return NFT.levelOf(tokenId);
    }

    function balanceOf(address owner_) external view returns (uint256) {
        return NFT.balanceOf(owner_);
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return NFT.ownerOf(tokenId);
    }
}
