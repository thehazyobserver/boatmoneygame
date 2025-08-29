// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
 * BOAT MONEY - BoatGame (Smugglers MVP + Leaderboard Stats)
 * Core loop: Buy ➜ Upgrade ➜ Run ➜ Rewards Pool
 *
 * Pinned OpenZeppelin v4.8.3 imports to keep Solidity 0.8.19 compatibility.
 */

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/security/ReentrancyGuard.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/security/Pausable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/access/Ownable.sol";

interface IBoatNFT {
    function mintTo(address to, uint8 level) external returns (uint256 tokenId);
    function gameBurn(uint256 tokenId) external;
    function gameSetLevel(uint256 tokenId, uint8 newLevel) external;
    function levelOf(uint256 tokenId) external view returns (uint8);
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract BoatGame is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable BOAT;
    IBoatNFT public immutable NFT;

    enum FailureMode { Burn, DowngradeOne, None }

    struct LevelParams {
        uint256 runFee;
        uint256 reward;
        uint16  successBps; // e.g. 7000 = 70%
        FailureMode fail;
    }

    mapping(uint8 => LevelParams) public params;
    mapping(uint8 => uint256) public upgradeCost;
    uint256 public buyRaftCost;

    uint16 public yachtSpawnRaftBps = 1500; // 15%
    uint256 public runCooldown = 10 minutes;

    address public treasury;
    uint16  public treasuryBps = 0;

    struct Stats {
        uint64 runsStarted;
        uint64 runsWon;
        uint64 boatsLost;
        uint64 boatsOwnedMax;
    }
    mapping(address => Stats) public stats;
    mapping(uint256 => uint256) public nonceOf;
    mapping(uint256 => uint256) public lastRunAt;

    event RaftBought(address indexed user, uint256 indexed tokenId, uint256 cost);
    event Upgraded(address indexed user, uint256 indexed tokenId, uint8 fromLevel, uint8 toLevel, uint256 cost);
    event RunResult(address indexed user, uint256 indexed tokenId, uint8 level, bool success, uint256 rewardPaid);
    event BoatBurned(uint256 indexed tokenId, uint8 level);
    event BoatDowngraded(uint256 indexed tokenId, uint8 fromLevel, uint8 toLevel);
    event RaftSpawned(address indexed to, uint256 indexed tokenId);
    event Seeded(uint256 amount);

    constructor(IERC20 boatToken, IBoatNFT boatNft) {
        BOAT = boatToken;
        NFT = boatNft;

        buyRaftCost    = 100_000 ether;
        upgradeCost[1] = 150_000 ether;
        upgradeCost[2] = 300_000 ether;
        upgradeCost[3] = 600_000 ether;

        params[1] = LevelParams(10_000 ether, 15_000 ether, 7000, FailureMode.Burn);
        params[2] = LevelParams(15_000 ether, 30_000 ether, 6500, FailureMode.Burn);
        params[3] = LevelParams(25_000 ether, 60_000 ether, 6000, FailureMode.Burn);
        params[4] = LevelParams(40_000 ether, 120_000 ether, 5500, FailureMode.DowngradeOne);
    }

    // ===== Core =====

    function buyRaft() external whenNotPaused nonReentrant returns (uint256 tokenId) {
        _collect(msg.sender, buyRaftCost);
        tokenId = NFT.mintTo(msg.sender, 1);
        _bumpBoatsOwnedMax(msg.sender);
        emit RaftBought(msg.sender, tokenId, buyRaftCost);
    }

    function upgrade(uint256 tokenId) external whenNotPaused nonReentrant {
        require(NFT.ownerOf(tokenId) == msg.sender, "not owner");
        uint8 lvl = NFT.levelOf(tokenId);
        require(lvl >= 1 && lvl <= 3, "at max");
        uint256 cost = upgradeCost[lvl];
        _collect(msg.sender, cost);
        NFT.gameSetLevel(tokenId, lvl + 1);
        emit Upgraded(msg.sender, tokenId, lvl, lvl + 1, cost);
    }

    function run(uint256 tokenId) external whenNotPaused nonReentrant {
        require(NFT.ownerOf(tokenId) == msg.sender, "not owner");
        uint8 lvl = NFT.levelOf(tokenId);
        require(block.timestamp >= lastRunAt[tokenId] + runCooldown, "cooldown");
        lastRunAt[tokenId] = block.timestamp;

        LevelParams memory p = params[lvl];
        _collect(msg.sender, p.runFee);
        stats[msg.sender].runsStarted++;

        uint256 roll = _rng(tokenId) % 10_000;
        bool success = roll < p.successBps;
        uint256 rewardPaid = 0;

        if (success) {
            rewardPaid = p.reward;
            require(BOAT.balanceOf(address(this)) >= rewardPaid, "pool low");
            BOAT.safeTransfer(msg.sender, rewardPaid);
            stats[msg.sender].runsWon++;
        } else {
            if (p.fail == FailureMode.Burn) {
                NFT.gameBurn(tokenId);
                stats[msg.sender].boatsLost++;
                emit BoatBurned(tokenId, lvl);
            } else if (p.fail == FailureMode.DowngradeOne) {
                NFT.gameSetLevel(tokenId, lvl - 1);
                emit BoatDowngraded(tokenId, lvl, lvl - 1);
            }
        }

        emit RunResult(msg.sender, tokenId, lvl, success, rewardPaid);

        if (lvl == 4 && _chance(yachtSpawnRaftBps, tokenId)) {
            uint256 newId = NFT.mintTo(msg.sender, 1);
            _bumpBoatsOwnedMax(msg.sender);
            emit RaftSpawned(msg.sender, newId);
        }
    }

    // ===== Admin =====
    function seedRewards(uint256 amount) external onlyOwner {
        BOAT.safeTransferFrom(msg.sender, address(this), amount);
        emit Seeded(amount);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ===== Internal helpers =====
    function _collect(address from, uint256 amount) internal {
        BOAT.safeTransferFrom(from, address(this), amount);
    }

    function _rng(uint256 tokenId) internal returns (uint256) {
        nonceOf[tokenId]++;
        return uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            msg.sender,
            tokenId,
            nonceOf[tokenId]
        )));
    }

    function _chance(uint16 bps, uint256 tokenId) internal returns (bool) {
        return _rng(tokenId) % 10_000 < bps;
    }

    function _bumpBoatsOwnedMax(address user) internal {
        uint256 bal = NFT.balanceOf(user);
        if (bal > stats[user].boatsOwnedMax) {
            stats[user].boatsOwnedMax = uint64(bal);
        }
    }

        // ===== Emergency Withdraw =====
        function rescueERC20(address token, uint256 amount, address to) external onlyOwner {
            require(to != address(0), "BoatGame:zero");
            IERC20(token).safeTransfer(to, amount);
        }

        function rescueERC721(address nft, uint256 tokenId, address to) external onlyOwner {
            require(to != address(0), "BoatGame:zero");
            IERC721(nft).transferFrom(address(this), to, tokenId);
        }

            /// @dev Register my contract on Sonic FeeM
            function registerMe() external {
                (bool _success,) = address(0xDC2B0D2Dd2b7759D97D50db4eabDC36973110830).call(
                    abi.encodeWithSignature("selfRegister(uint256)", 92)
                );
                require(_success, "FeeM registration failed");
            }
}
