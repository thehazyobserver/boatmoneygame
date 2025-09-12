# BOAT MONEY Game

A decentralized boat smuggling game built on the Sonic blockchain. Buy boats, upgrade them, run smuggling missions, and earn rewards with either $BOAT or $JOINT tokens!

## 🎮 How to Play

1. **Connect Your Wallet** - Connect your Web3 wallet to start playing
2. **Buy Your First Raft** - Purchase a raft with 50,000 BOAT tokens  
3. **Run Operations** - Choose $BOAT (5K-100K stakes) or $JOINT (7.8K-78K stakes) for runs
4. **Upgrade Your Fleet** - Use BOAT tokens to upgrade boats for better success rates
5. **Expand Your Empire** - Buy more boats and compound your earnings

## 🚤 Boat Types & Success Rates

- **⛵ Raft** - 50% success rate (Starting boat)
- **🛶 Dinghy** - 55% success rate (First upgrade)  
- **🚤 Speedboat** - 60% success rate (Second upgrade)
- **🛥️ Yacht** - 65% success rate (Maximum level)

## 💰 Game Mechanics

- **Two Token Systems**: Play with $BOAT (5K-100K stakes) or $JOINT (7.8K-78K stakes)
- **Multipliers**: Payouts vary by boat level (Raft 1.5x to Yacht 1.7x)
- **Failure Penalties**: Lose stake + boat burns (Raft) or downgrades (higher boats)
- **Upgrade Costs**: Always paid in BOAT tokens (80K→150K→250K progression)
- **Yacht Bonus**: 15% chance to spawn free rafts on successful yacht runs
- **Cooldown**: 120 seconds between runs per boat

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
