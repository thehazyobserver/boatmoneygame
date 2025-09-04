// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
 * BOAT MONEY - BoatGame (variable-stake runs, friendly progression)
 *
 * - Buy Raft with $BOAT
 * - Upgrade → Dinghy → Speedboat → Yacht
 * - Run with user-chosen stake (10k–80k)
 * - Rewards = stake * multiplier (capped by pool % and optional abs cap)
 * - Fail: L1 burn; L2–L4 downgrade
 *
 * Includes:
 * - FeeM registerMe (onlyOwner)
 * - Owner withdrawals for $BOAT and ETH
 *
 * Pinned OpenZeppelin v4.8.3 imports.
 */

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC721/IERC721.sol";
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

    struct LevelParams { uint16 successBps; FailureMode fail; }
    struct StakeParams {
        uint256 minStake; uint256 maxStake;
        uint16 rewardMultBps; // reward = stake * rewardMultBps / 10_000
        uint256 maxPayoutAbs; // 0 = disabled
    }

    mapping(uint8 => LevelParams) public level;      // 1..4
    mapping(uint8 => StakeParams) public stakeCfg;   // 1..4

    uint16  public capBps = 1000;        // max % of pool per single win (10%)
    uint256 public runCooldown = 10 minutes;
    address public treasury;
    uint16  public treasuryBps = 0;      // optional skim from stakes (<=10%)

    uint256 public buyRaftCost = 100_000 ether; // assumes 18 decimals
    mapping(uint8 => uint256) public upgradeCost; // 1->2, 2->3, 3->4

    uint16 public yachtSpawnRaftBps = 1500; // 15%

    struct Stats { uint64 runsStarted; uint64 runsWon; uint64 boatsLost; uint64 boatsOwnedMax; }
    mapping(address => Stats) public stats;
    mapping(uint256 => uint256) public nonceOf;
    mapping(uint256 => uint256) public lastRunAt;

    event RaftBought(address indexed user, uint256 indexed tokenId, uint256 cost);
    event Upgraded(address indexed user, uint256 indexed tokenId, uint8 fromLevel, uint8 toLevel, uint256 cost);
    event RunResult(address indexed user, uint256 indexed tokenId, uint8 level, uint256 stake, bool success, uint256 rewardPaid);
    event BoatBurned(uint256 indexed tokenId, uint8 level);
    event BoatDowngraded(uint256 indexed tokenId, uint8 fromLevel, uint8 toLevel);
    event RaftSpawned(address indexed to, uint256 indexed tokenId);
    event Seeded(uint256 amount);

    constructor(IERC20 boatToken, IBoatNFT boatNft) {
        require(address(boatToken) != address(0) && address(boatNft) != address(0), "zero addr");
        BOAT = boatToken;
        NFT  = boatNft;

        upgradeCost[1] = 150_000 ether; // L1->L2
        upgradeCost[2] = 300_000 ether; // L2->L3
        upgradeCost[3] = 600_000 ether; // L3->L4

        // Friendly progression odds
        level[1] = LevelParams(5500, FailureMode.Burn);
        level[2] = LevelParams(6500, FailureMode.DowngradeOne);
        level[3] = LevelParams(7500, FailureMode.DowngradeOne);
        level[4] = LevelParams(8500, FailureMode.DowngradeOne);

        // Flat stake range for all levels (10k–80k), multipliers vary by level
        stakeCfg[1] = StakeParams(10_000 ether, 80_000 ether, 15_000, 0); // 1.5x
        stakeCfg[2] = StakeParams(10_000 ether, 80_000 ether, 20_000, 0); // 2.0x
        stakeCfg[3] = StakeParams(10_000 ether, 80_000 ether, 24_000, 0); // 2.4x
        stakeCfg[4] = StakeParams(10_000 ether, 80_000 ether, 30_000, 0); // 3.0x
    }

    // ===== Admin Setters =====
    function setLevelParams(uint8 lvl, uint16 successBps, FailureMode failMode) external onlyOwner {
        require(lvl >= 1 && lvl <= 4, "bad lvl");
        require(successBps <= 10_000, "bps>100%");
        level[lvl] = LevelParams(successBps, failMode);
    }
    function setStakeParams(uint8 lvl, uint256 minStake, uint256 maxStake, uint16 rewardMultBps, uint256 maxPayoutAbs) external onlyOwner {
        require(lvl >= 1 && lvl <= 4, "bad lvl");
        require(minStake > 0 && maxStake >= minStake, "stake bounds");
        require(rewardMultBps > 0, "mult 0");
        stakeCfg[lvl] = StakeParams(minStake, maxStake, rewardMultBps, maxPayoutAbs);
    }
    function setCapBps(uint16 _capBps) external onlyOwner { require(_capBps <= 2000, "cap too high"); capBps = _capBps; }
    function setCooldown(uint256 seconds_) external onlyOwner { runCooldown = seconds_; }
    function setYachtSpawnBps(uint16 bps) external onlyOwner { require(bps <= 10_000, "bps>100%"); yachtSpawnRaftBps = bps; }
    function setTreasury(address _treasury, uint16 _bps) external onlyOwner { require(_bps <= 1_000, "max 10%"); treasury = _treasury; treasuryBps = _bps; }
    function setBuyRaftCost(uint256 cost) external onlyOwner { buyRaftCost = cost; }
    function setUpgradeCost(uint8 fromLevel, uint256 cost) external onlyOwner { require(fromLevel >= 1 && fromLevel <= 3, "bad level"); upgradeCost[fromLevel] = cost; }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /// Seed initial $BOAT into the Rewards Pool (for airdropped boats).
    function seedRewards(uint256 amount) external onlyOwner {
        BOAT.safeTransferFrom(msg.sender, address(this), amount);
        emit Seeded(amount);
    }

    // ===== Airdrops =====
    function airdropSameLevel(address[] calldata recipients, uint8 lvl) external onlyOwner {
        require(lvl >= 1 && lvl <= 4, "bad lvl");
        for (uint256 i = 0; i < recipients.length; i++) {
            NFT.mintTo(recipients[i], lvl);
            _bumpBoatsOwnedMax(recipients[i]);
        }
    }
    function airdropMixed(address[] calldata recipients, uint8[] calldata lvls) external onlyOwner {
        require(recipients.length == lvls.length, "len");
        for (uint256 i = 0; i < recipients.length; i++) {
            require(lvls[i] >= 1 && lvls[i] <= 4, "bad lvl");
            NFT.mintTo(recipients[i], lvls[i]);
            _bumpBoatsOwnedMax(recipients[i]);
        }
    }
    function airdropBatch(address to, uint8 lvl, uint256 amount) external onlyOwner {
        require(lvl >= 1 && lvl <= 4, "bad lvl");
        for (uint256 i = 0; i < amount; i++) { NFT.mintTo(to, lvl); }
        _bumpBoatsOwnedMax(to);
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

    /// Run with user-selected stake. Reward = min(stake*mult, cap%, abs cap).
    function run(uint256 tokenId, uint256 stake) external whenNotPaused nonReentrant {
        require(NFT.ownerOf(tokenId) == msg.sender, "not owner");
        uint8 lvl = NFT.levelOf(tokenId);
        require(lvl >= 1 && lvl <= 4, "bad lvl");

        uint256 last = lastRunAt[tokenId];
        require(block.timestamp >= last + runCooldown, "cooldown");
        lastRunAt[tokenId] = block.timestamp;

        StakeParams memory sp = stakeCfg[lvl];
        require(stake >= sp.minStake && stake <= sp.maxStake, "stake out of bounds");

        _collect(msg.sender, stake);
        stats[msg.sender].runsStarted += 1;

        LevelParams memory lp = level[lvl];
        bool success = (_rng(tokenId) % 10_000) < lp.successBps;

        uint256 rewardPaid = 0;
        if (success) {
            uint256 rawReward = (stake * sp.rewardMultBps) / 10_000;
            uint256 poolBal = BOAT.balanceOf(address(this));
            uint256 capByPool = (poolBal * capBps) / 10_000;
            uint256 capped = rawReward;
            if (capByPool > 0 && capped > capByPool) capped = capByPool;
            if (sp.maxPayoutAbs > 0 && capped > sp.maxPayoutAbs) capped = sp.maxPayoutAbs;
            require(poolBal >= capped, "pool low");
            rewardPaid = capped;
            BOAT.safeTransfer(msg.sender, rewardPaid);
            stats[msg.sender].runsWon += 1;
        } else {
            if (lp.fail == FailureMode.Burn) {
                NFT.gameBurn(tokenId);
                stats[msg.sender].boatsLost += 1;
                emit BoatBurned(tokenId, lvl);
            } else if (lp.fail == FailureMode.DowngradeOne) {
                if (lvl > 1) {
                    NFT.gameSetLevel(tokenId, lvl - 1);
                    emit BoatDowngraded(tokenId, lvl, lvl - 1);
                } else {
                    NFT.gameBurn(tokenId);
                    stats[msg.sender].boatsLost += 1;
                    emit BoatBurned(tokenId, lvl);
                }
            }
        }

        emit RunResult(msg.sender, tokenId, lvl, stake, success, rewardPaid);

        if (lvl == 4 && _chance(yachtSpawnRaftBps, tokenId)) {
            uint256 newId = NFT.mintTo(msg.sender, 1);
            _bumpBoatsOwnedMax(msg.sender);
            emit RaftSpawned(msg.sender, newId);
        }
    }

    // ===== Views =====
    function getStats(address user) external view returns (Stats memory) { return stats[user]; }
    function poolBalance() external view returns (uint256) { return BOAT.balanceOf(address(this)); }

    // ===== Internals =====
    function _collect(address from, uint256 amount) internal {
        if (amount == 0) return;
        if (treasury != address(0) && treasuryBps > 0) {
            uint256 toTreasury = (amount * treasuryBps) / 10_000;
            if (toTreasury > 0) BOAT.safeTransferFrom(from, treasury, toTreasury);
            BOAT.safeTransferFrom(from, address(this), amount - toTreasury);
        } else {
            BOAT.safeTransferFrom(from, address(this), amount);
        }
    }

    function _rng(uint256 tokenId) internal returns (uint256) {
        uint256 n = ++nonceOf[tokenId];
        return uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1), block.timestamp, msg.sender, tokenId, n, address(this), BOAT.balanceOf(address(this))
        )));
    }

    function _chance(uint16 bps, uint256 tokenId) internal returns (bool) {
        if (bps == 0) return false;
        return (_rng(tokenId) % 10_000) < bps;
    }

    function _bumpBoatsOwnedMax(address user) internal {
        uint256 bal = NFT.balanceOf(user);
        if (bal > stats[user].boatsOwnedMax) { stats[user].boatsOwnedMax = uint64(bal); }
    }

    // ===== Owner Withdrawals & FeeM =====

    /// @dev Withdraw BOAT (owner).
    function withdrawBOAT(uint256 amount, address to) external onlyOwner nonReentrant {
        require(to != address(0), "BoatGame:zero");
        BOAT.safeTransfer(to, amount);
    }

    /// @dev Withdraw native ETH (owner).
    function withdrawETH(uint256 amount, address payable to) external onlyOwner nonReentrant {
        require(to != address(0), "BoatGame:zero");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH transfer failed");
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
