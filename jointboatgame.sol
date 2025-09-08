// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
 * JOINT BOAT GAME - Play with $JOINT tokens using existing BoatNFTs
 *
 * - Use existing BoatNFTs from the main BoatGame
 * - Run with $JOINT stakes (20k–420k range)
 * - Same odds and multipliers as BoatGame
 * - Same NFT burn/downgrade on failure as BoatGame
 * - Upgrades still done through original BoatGame with $BOAT
 * - When players lose, $JOINT stays in contract for future payouts
 * - Treasury fee system for contract revenue
 *
 * Pinned OpenZeppelin v4.8.3 imports.
 */

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/security/ReentrancyGuard.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/security/Pausable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/access/Ownable.sol";

interface IBoatNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function levelOf(uint256 tokenId) external view returns (uint8);
    function gameBurn(uint256 tokenId) external;
    function gameSetLevel(uint256 tokenId, uint8 newLevel) external;
}

interface IBoatGame {
    function upgrade(uint256 tokenId) external;
}

contract JointBoatGame is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable JOINT;
    IBoatNFT public immutable NFT;
    IBoatGame public immutable BOAT_GAME;

    uint256 public minStake = 7_800 ether;    // 7.8k $JOINT min (configurable)
    uint256 public maxStake = 78_000 ether;   // 78k $JOINT max (configurable)
    uint256 public runCooldown = 10 minutes;
    uint16  public capBps = 500;               // max % of pool per single win (5% - more conservative)
    address public treasury;
    uint16  public treasuryBps = 0;            // optional skim from stakes (<=10%)

    // Maximum absolute payouts per level for additional protection
    mapping(uint8 => uint256) public maxPayoutAbs;

    mapping(uint256 => uint256) public lastRunAt;
    mapping(uint256 => uint256) public nonceOf;

    struct Stats { uint64 runsStarted; uint64 runsWon; uint64 boatsLost; }
    mapping(address => Stats) public stats;

    event JointRun(address indexed user, uint256 indexed tokenId, uint8 level, uint256 stake, bool success, uint256 rewardPaid);
    event BoatBurned(uint256 indexed tokenId, uint8 level);
    event BoatDowngraded(uint256 indexed tokenId, uint8 fromLevel, uint8 toLevel);
    event Seeded(uint256 amount);

    constructor(IERC20 jointToken, IBoatNFT boatNft, IBoatGame boatGame) {
        require(address(jointToken) != address(0) && address(boatNft) != address(0) && address(boatGame) != address(0), "zero addr");
        JOINT = jointToken;
        NFT = boatNft;
        BOAT_GAME = boatGame;
        
        // Initialize with final deployment parameters
        minStake = 7_800 ether;    // 7.8k $JOINT min
        maxStake = 78_000 ether;   // 78k $JOINT max
        
        // Set final level parameters
        levelSuccessBps[1] = 5000;  // 50%
        levelSuccessBps[2] = 5500;  // 55%
        levelSuccessBps[3] = 6000;  // 60%
        levelSuccessBps[4] = 6500;  // 65%
        
        levelMultiplierBps[1] = 15000; // 1.50x
        levelMultiplierBps[2] = 16000; // 1.60x
        levelMultiplierBps[3] = 16500; // 1.65x
        levelMultiplierBps[4] = 17000; // 1.70x
        
        // Set conservative maximum absolute payouts per level (set to 0 for unlimited)
        maxPayoutAbs[1] = 0;  // Unlimited
        maxPayoutAbs[2] = 0;  // Unlimited
        maxPayoutAbs[3] = 0;  // Unlimited
        maxPayoutAbs[4] = 0;  // Unlimited
    }

    // ===== Core Game Function =====
    function run(uint256 tokenId, uint256 stake) external whenNotPaused nonReentrant {
        require(NFT.ownerOf(tokenId) == msg.sender, "Not owner");
        require(stake >= minStake && stake <= maxStake, "Stake out of bounds");

        uint8 lvl = NFT.levelOf(tokenId);
        require(lvl >= 1 && lvl <= 4, "Invalid level");

        uint256 last = lastRunAt[tokenId];
        require(block.timestamp >= last + runCooldown, "Cooldown");
        lastRunAt[tokenId] = block.timestamp;

        // Collect stake with optional treasury fee
        _collect(msg.sender, stake);
        stats[msg.sender].runsStarted += 1;

        // Same odds as BoatGame
        bool success = (_rng(tokenId) % 10_000) < _getSuccessBps(lvl);
        uint256 rewardPaid = 0;
        
        if (success) {
            uint256 rawReward = (stake * _getRewardMultBps(lvl)) / 10_000;
            uint256 poolBal = JOINT.balanceOf(address(this));
            
            // Apply pool percentage cap (like BoatGame)
            uint256 capByPool = (poolBal * capBps) / 10_000;
            uint256 capped = rawReward;
            if (capByPool > 0 && capped > capByPool) capped = capByPool;
            
            // Apply absolute maximum payout cap
            uint256 maxAbs = maxPayoutAbs[lvl];
            if (maxAbs > 0 && capped > maxAbs) capped = maxAbs;
            
            require(poolBal >= capped, "Insufficient pool");
            rewardPaid = capped;
            JOINT.safeTransfer(msg.sender, rewardPaid);
            stats[msg.sender].runsWon += 1;
        } else {
            // Same NFT damage as BoatGame
            if (lvl == 1) {
                // Level 1: Burn (same as BoatGame)
                NFT.gameBurn(tokenId);
                stats[msg.sender].boatsLost += 1;
                emit BoatBurned(tokenId, lvl);
            } else {
                // Level 2-4: Downgrade (same as BoatGame)
                NFT.gameSetLevel(tokenId, lvl - 1);
                emit BoatDowngraded(tokenId, lvl, lvl - 1);
            }
        }
        // If fail, stake remains in contract for future payouts

        emit JointRun(msg.sender, tokenId, lvl, stake, success, rewardPaid);
    }

    // ===== Boat Upgrades (delegated to original BoatGame) =====
    function upgradeBoat(uint256 tokenId) external whenNotPaused nonReentrant {
        // User must approve $BOAT to BoatGame contract separately
        BOAT_GAME.upgrade(tokenId);
    }

    // ===== Admin Functions =====
    function seedRewards(uint256 amount) external onlyOwner {
        JOINT.safeTransferFrom(msg.sender, address(this), amount);
        emit Seeded(amount);
    }

    function setCooldown(uint256 seconds_) external onlyOwner { 
        runCooldown = seconds_; 
    }
    
    function setMinMaxStake(uint256 min_, uint256 max_) external onlyOwner {
        require(min_ > 0 && max_ >= min_, "Bad stake bounds");
        minStake = min_;
        maxStake = max_;
    }
    
    function setTreasury(address _treasury, uint16 _bps) external onlyOwner { 
        require(_bps <= 1_000, "Max 10%"); 
        treasury = _treasury; 
        treasuryBps = _bps; 
    }

    // Add configurable level parameters
    mapping(uint8 => uint16) public levelSuccessBps;
    mapping(uint8 => uint16) public levelMultiplierBps;
    
    function setLevelParams(uint8 lvl, uint16 successBps, uint8 /* failMode */) external onlyOwner {
        require(lvl >= 1 && lvl <= 4, "Invalid level");
        require(successBps <= 10000, "Invalid success rate");
        levelSuccessBps[lvl] = successBps;
        // failMode ignored - using same logic as hardcoded (L1 burns, L2-4 downgrade)
    }
    
    function setStakeParams(uint8 lvl, uint256 minStake_, uint256 maxStake_, uint16 rewardMultBps, uint256 maxPayoutAbs_) external onlyOwner {
        require(lvl >= 1 && lvl <= 4, "Invalid level");
        require(rewardMultBps <= 50000, "Invalid multiplier"); // max 5x
        levelMultiplierBps[lvl] = rewardMultBps;
        maxPayoutAbs[lvl] = maxPayoutAbs_;
        // Only update global stakes on level 1 to keep them uniform
        if (lvl == 1) {
            require(minStake_ > 0 && maxStake_ >= minStake_, "Bad stake bounds");
            minStake = minStake_;
            maxStake = maxStake_;
        }
    }
    
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function withdrawJOINT(uint256 amount, address to) external onlyOwner nonReentrant {
        require(to != address(0), "JointBoatGame:zero");
        JOINT.safeTransfer(to, amount);
    }

    function withdrawETH(uint256 amount, address payable to) external onlyOwner nonReentrant {
        require(to != address(0), "JointBoatGame:zero");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH transfer failed");
    }

    // ===== Views =====
    function getStats(address user) external view returns (Stats memory) { 
        return stats[user]; 
    }
    
    function poolBalance() external view returns (uint256) { 
        return JOINT.balanceOf(address(this)); 
    }

    // ===== Internal Functions =====
    function _collect(address from, uint256 amount) internal {
        if (amount == 0) return;
        if (treasury != address(0) && treasuryBps > 0) {
            uint256 toTreasury = (amount * treasuryBps) / 10_000;
            if (toTreasury > 0) JOINT.safeTransferFrom(from, treasury, toTreasury);
            JOINT.safeTransferFrom(from, address(this), amount - toTreasury);
        } else {
            JOINT.safeTransferFrom(from, address(this), amount);
        }
    }

    // Use configurable odds
    function _getSuccessBps(uint8 lvl) internal view returns (uint16) {
        uint16 rate = levelSuccessBps[lvl];
        return rate > 0 ? rate : 5000; // Default to 50% if not set
    }

    // Use configurable multipliers
    function _getRewardMultBps(uint8 lvl) internal view returns (uint16) {
        uint16 mult = levelMultiplierBps[lvl];
        return mult > 0 ? mult : 15000; // Default to 1.50x if not set
    }

    function _rng(uint256 tokenId) internal returns (uint256) {
        uint256 n = ++nonceOf[tokenId];
        return uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1), block.timestamp, msg.sender, tokenId, n, address(this), JOINT.balanceOf(address(this))
        )));
    }

    /// @dev Allow receiving ETH
    receive() external payable {}

    /// @dev Register my contract on Sonic FeeM
    function registerMe() external onlyOwner {
        (bool _success,) = address(0xDC2B0D2Dd2b7759D97D50db4eabDC36973110830).call(
            abi.encodeWithSignature("selfRegister(uint256)", 92)
        );
        require(_success, "FeeM registration failed");
    }
}
