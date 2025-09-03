# BOAT MONEY Game

A decentralized boat smuggling game built on the Sonic blockchain. Buy boats, upgrade them, run smuggling missions, and earn $BOAT tokens!

## 🎮 How to Play

1. **Connect Your Wallet** - Connect your Web3 wallet to start playing
2. **Buy Your First Raft** - Purchase a raft with 100,000 BOAT tokens  
3. **Run Smuggling Missions** - Stake ETH and attempt smuggling runs
4. **Upgrade Your Fleet** - Use earned BOAT tokens to upgrade boats for better success rates
5. **Expand Your Empire** - Buy more boats and compound your earnings

## 🚤 Boat Types & Success Rates

- **🪜 Raft** - 50% success rate (Starting boat)
- **🛶 Dinghy** - 65% success rate (First upgrade)  
- **🚤 Speedboat** - 80% success rate (Second upgrade)
- **🛥️ Yacht** - 90% success rate (Maximum level)

## 💰 Game Mechanics

- **Successful Run**: Earn 2x your staked ETH + BOAT token rewards
- **Failed Run**: Lose your staked ETH (goes to prize pool)
- **Upgrades**: Cost BOAT tokens but increase success rates
- **Multiple Boats**: Own multiple boats to run parallel operations

## 🌐 Deployment

This frontend is built for deployment on Netlify with the following stack:

- **React** - Frontend framework
- **Vite** - Build tool and dev server
- **Wagmi** - React hooks for Ethereum
- **Tailwind CSS** - Styling
- **Sonic Network** - Blockchain integration

## 🚀 Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## 📄 Smart Contracts

- **BoatGame.sol** - Main game logic and BOAT token
- **BoatNFT.sol** - ERC721 NFTs representing boats

## 🔗 Links

- [Live Game](https://your-netlify-url.netlify.app)
- [Sonic Network](https://docs.soniclabs.com)
- [Smart Contracts](./contracts/)

---

**⚠️ Disclaimer**: This is a game involving cryptocurrency. Only play with funds you can afford to lose. Smart contracts have been audited but DeFi involves risks.
