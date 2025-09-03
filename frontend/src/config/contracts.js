// Contract addresses - UPDATE THESE AFTER DEPLOYMENT
export const BOAT_GAME_ADDRESS = '0xab004722930Dd89C3698C73658FE803e8632fdF3' // Your deployed BoatGame address
export const BOAT_NFT_ADDRESS = '0x9CB74A9fF49c06a8119854ac86eF3920e9aCe983'  // Your deployed BoatNFT address
// Note: BOAT token address will be read from the game contract

// Contract ABIs
export const BOAT_GAME_ABI = [
  {
    "type": "function",
    "name": "buyRaft",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "upgrade",
    "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "run",
    "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "buyRaftCost",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "upgradeCost",
    "inputs": [{"name": "", "type": "uint8", "internalType": "uint8"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "BOAT",
    "inputs": [],
    "outputs": [{"name": "", "type": "address", "internalType": "contract IERC20"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "NFT",
    "inputs": [],
    "outputs": [{"name": "", "type": "address", "internalType": "contract IBoatNFT"}],
    "stateMutability": "view"
  }
]

export const BOAT_NFT_ABI = [
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{"name": "owner", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "address", "internalType": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenOfOwnerByIndex",
    "inputs": [
      {"name": "owner", "type": "address", "internalType": "address"},
      {"name": "index", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "string", "internalType": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "levelOf",
    "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "uint8", "internalType": "uint8"}],
    "stateMutability": "view"
  }
]

export const BOAT_TOKEN_ABI = [
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{"name": "owner", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {"name": "owner", "type": "address", "internalType": "address"},
      {"name": "spender", "type": "address", "internalType": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {"name": "spender", "type": "address", "internalType": "address"},
      {"name": "amount", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint8", "internalType": "uint8"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{"name": "", "type": "string", "internalType": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{"name": "", "type": "string", "internalType": "string"}],
    "stateMutability": "view"
  }
]

// Contract configuration for wagmi
export const contracts = {
  boatGame: {
    address: BOAT_GAME_ADDRESS,
    abi: BOAT_GAME_ABI
  },
  boatNFT: {
    address: BOAT_NFT_ADDRESS,
    abi: BOAT_NFT_ABI
  },
  // BOAT token contract will be accessed via the game contract's BOAT() function
}
