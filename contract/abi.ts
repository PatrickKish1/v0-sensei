// Contract Addresses - Update these with actual deployed addresses
export const SENSEI_GATEWAY_ADDRESS = "" as const
export const SENSEI_TOKEN_ADDRESS = "" as const
export const LESSON_NFT_ADDRESS = "" as const

// Sensei Gateway ABI
export const SENSEI_GATEWAY_ABI = [
  {
    type: "function",
    name: "registerSensei",
    inputs: [
      { name: "name", type: "string" },
      { name: "expertise", type: "string" },
      { name: "description", type: "string" },
      { name: "hourlyRate", type: "uint256" },
      { name: "isRetired", type: "bool" },
      { name: "skills", type: "string[]" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getActiveSenseis",
    inputs: [],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "mintLessonNFT",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "mintTokensWithETH",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "bookLessonWithETH",
    inputs: [
      { name: "senseiId", type: "uint256" },
      { name: "subject", type: "string" },
      { name: "sessionTitle", type: "string" },
      { name: "sessionDescription", type: "string" },
      { name: "duration", type: "uint256" },
      { name: "nftMintable", type: "bool" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "chatWithSenseiAI",
    inputs: [
      { name: "senseiId", type: "uint256" },
      { name: "query", type: "string" }
    ],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "nonpayable"
  }
] as const

// SenseiToken ABI
export const SENSEI_TOKEN_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "mintWithETH",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "burn",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "burnFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getCurrentMintRate",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getTokensForETH",
    inputs: [{ name: "ethAmount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getBackingRatio",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getKnowledgeEconomyMetrics",
    inputs: [],
    outputs: [
      { name: "knowledgeValue", type: "uint256" },
      { name: "backingValue", type: "uint256" },
      { name: "backingRatio", type: "uint256" },
      { name: "mintRate", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getSenseiMetrics",
    inputs: [{ name: "senseiAddress", type: "address" }],
    outputs: [
      { name: "earnings", type: "uint256" },
      { name: "contributions", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view"
  }
] as const

// LessonNFT ABI
export const LESSON_NFT_ABI = [
  {
    type: "function",
    name: "mintLessonNFT",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getLessonMetadata",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "sessionId", type: "uint256" },
          { name: "senseiAddress", type: "address" },
          { name: "studentAddress", type: "address" },
          { name: "subject", type: "string" },
          { name: "lessonTitle", type: "string" },
          { name: "lessonDescription", type: "string" },
          { name: "sessionDuration", type: "uint256" },
          { name: "sessionPrice", type: "uint256" },
          { name: "knowledgeValue", type: "uint256" },
          { name: "mintPrice", type: "uint256" },
          { name: "isMinted", type: "bool" },
          { name: "mintTimestamp", type: "uint256" },
          { name: "isPublicMintable", type: "bool" },
          { name: "lessonQuality", type: "uint256" },
          { name: "minter", type: "address" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getTotalLessonNFTs",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getSenseiLessonNFTs",
    inputs: [{ name: "senseiAddress", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getStudentLessonNFTs",
    inputs: [{ name: "studentAddress", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getTokenIdsForSession",
    inputs: [{ name: "sessionId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view"
  }
] as const
