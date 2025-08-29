// Contract addresses - UPDATE THESE AFTER DEPLOYMENT
export const BOAT_GAME_ADDRESS = '0xab004722930Dd89C3698C73658FE803e8632fdF3' // Your deployed BoatGame address
export const BOAT_NFT_ADDRESS = '0x9CB74A9fF49c06a8119854ac86eF3920e9aCe983'  // Your deployed BoatNFT address
// Note: BOAT token address will be read from the game contract

// Contract ABIs
export const BOAT_GAME_ABI = [
  // Game functions  
  'function buyRaft() returns (uint256)',
  'function upgrade(uint256 tokenId)',
  'function run(uint256 tokenId) payable',
  
  // View functions
  'function buyRaftCost() view returns (uint256)',
  'function upgradeCost(uint8 fromLevel) view returns (uint256)',
  'function level(uint8 level) view returns (tuple(uint16 successBps, uint8 fail))',
  'function stakeCfg(uint8 level) view returns (tuple(uint256 minStake, uint256 maxStake, uint16 rewardMultBps, uint256 maxPayoutAbs))',
  'function BOAT() view returns (address)',
  'function NFT() view returns (address)',
  
  // BOAT token functions (since BOAT is stored in the game contract)
  'function BOAT() view returns (address)',
  
  // Events
  'event RaftBought(address indexed user, uint256 indexed tokenId, uint256 cost)',
  'event Upgraded(address indexed user, uint256 indexed tokenId, uint8 fromLevel, uint8 toLevel, uint256 cost)',
  'event RunResult(address indexed user, uint256 indexed tokenId, uint8 level, uint256 stake, bool success, uint256 rewardPaid)'
]

export const BOAT_NFT_ABI = [
  // ERC721 standard functions
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function totalSupply() view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  
  // Custom functions
  'function levelOf(uint256 tokenId) view returns (uint8)',
  'function nextTokenId() view returns (uint256)',
  'function walletOfOwner(address owner) view returns (uint256[])',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event LevelChanged(uint256 indexed tokenId, uint8 oldLevel, uint8 newLevel)'
]

export const BOAT_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
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
