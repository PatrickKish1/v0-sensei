# Sensei – Decentralized Knowledge Economy Platform

## Vision
Sensei is a decentralized platform where retirees and experts (“Senseis”) can immortalize their knowledge as AI-powered clones, share it with students, and participate in a knowledge-backed economy. Students can book lessons, mint NFTs of their learning, and everyone benefits from a transparent, fair, and privacy-preserving system.

---

## Core Features & Flows

### 1. Sensei Registration & AI Cloning
- **Who:** Retirees/Experts  
- **How:** Register via `SenseiGateway`, providing profile data and uploading knowledge (encrypted via Zama FHEVM).  
- **Result:** A Sensei profile is created in `SenseiRegistry`, and a personal AI agent is instantiated in `SensayAI` to learn from the uploaded knowledge.  

### 2. Booking Lessons (No Registration Needed)
- **Who:** Anyone (students, no KYC/account needed)  
- **How:** Book a lesson via `SenseiGateway`, paying with ETH or any ERC20 token.  
- **Result:** `BookingSystem` handles payment escrow, lesson scheduling, and notifies the Sensei for acceptance.  

### 3. Session Completion & NFT Creation
- After a lesson: Payment is released to the Sensei.  
- The student can choose to mint the lesson as an NFT (`LessonNFT`), making it public or keeping it private.  

### 4. NFT Marketplace & Revenue Split
- **NFTs:** Anyone can mint a public lesson NFT using `SenseiTokens`.  
- **Revenue:** 50% to Sensei, 45% to student (after 5% platform fee).  

### 5. Knowledge-Backed Token Economy
- **SenseiToken:** A floating stablecoin minted as knowledge is shared (sessions, NFT sales, ETH deposits).  
- **Value:** Directly tied to platform usage and knowledge transfer.  

---

## Smart Contract Architecture

### Central Orchestrator
- **SenseiGateway:** All user and contract interactions flow through here. It coordinates bookings, NFT minting, token operations, and cross-chain actions.  

### Core Contracts
- **SenseiRegistry:** Manages Sensei profiles, AI replicas, and knowledge tracking.  
- **BookingSystem:** Handles lesson bookings, payment escrow, and session management.  
- **LessonNFT:** Creates and manages lesson NFTs, including minting and revenue splits.  
- **SenseiToken:** Floating stablecoin, minted/redeemed based on knowledge economy activity.  

### AI & Privacy Layer
- **SensayAI:** Deploys and manages personal AI agents for each Sensei, which learn and evolve from encrypted knowledge.  
- **PrivacyManager:** Integrates Zama FHEVM for end-to-end encryption of all sensitive knowledge uploads.  

### Cross-Chain Layer
- **SenseiCrossChain:** Handles cross-chain messaging, allowing bookings and NFT minting from other chains (e.g., Base, Lisk). Integrates with bridges/relayers.  

### Libraries
- **Constants, DataTypes, Errors, Events:** Modularize and standardize contract logic, error handling, and event emission.  

### External Integrations
- **Zama FHEVM:** Confidential computing for knowledge uploads (privacy-preserving, even from node operators).  
- **IPFS:** Decentralized storage for lesson/NFT metadata.  
- **Ethereum, Base, Lisk:** Multi-chain support for bookings, NFT minting, and token operations.  

---

## Economic Model

- **Floating Stablecoin:** `SenseiToken` supply/value adjusts with demand, backed by knowledge sessions, NFT sales, and ETH deposits.  
- **Public Minting:** Anyone can mint tokens with ETH.  
- **Knowledge Backing:** Token value is directly tied to completed learning sessions.  
- **Fair Revenue Sharing:** Automated 50/50 split on NFT sales (student gets 45% after 5% platform fee, sensei gets 50%).  
- **NFT Marketplace:** Each lesson can be minted as an NFT by anyone if the student allows it.  

---

## Security & Privacy

- **Zama FHEVM:** All knowledge uploads are encrypted and processed confidentially.  
- **ReentrancyGuard:** Protects against reentrancy attacks.  
- **Role-Based Access Control:** Only authorized contracts/users can perform sensitive actions.  
- **Input Validation:** Comprehensive parameter checks.  
- **Emergency Pause:** Owner can pause all operations in emergencies.  
- **Audit-Ready:** Modular, well-documented code.  

---

## Cross-Chain Support

- **How:** `SenseiCrossChain` contract relays bookings and NFT minting requests to/from other chains (Base, Lisk, etc.).  
- **On Other Chains:** Minimal receiver contracts process cross-chain messages and trigger local actions (e.g., minting NFTs, booking lessons).  

---

## Deployment & Testing

- **Order:** Deploy core contracts (`SenseiToken`, `SenseiRegistry`), then dependent contracts (`BookingSystem`, `LessonNFT`, `SensayAI`, `PrivacyManager`), then `SenseiGateway`, then initialize connections.  
- **Testing:** Uses Foundry for comprehensive unit and integration tests.  
- **Addresses:** Saved in `deployment.env` after deployment.  

---

## Use Cases

- **Retired Professionals:** Share lifetime expertise, earn revenue, and preserve legacy.  
- **Active Experts:** Monetize knowledge, build reputation, and create AI-powered clones.  
- **Students:** Learn from real experts, earn by sharing learning, and collect knowledge NFTs.  
- **NFT Collectors:** Own unique learning experiences and invest in knowledge assets.  
- **Token Investors:** Participate in a knowledge-backed, transparent, and fair economy.  

---

## Roadmap

- **Phase 1:** Core contracts, session management, token economics, NFT system (✅)  
- **Phase 2:** AI integration, personal AI agents, conversation management (✅)  
- **Phase 3:** Web/mobile frontend, dashboards, payment integration (🚧)  
- **Phase 4:** Video/group sessions, advanced analytics, marketplace features (🚧)  

---

## Summary Table of Contracts

| Contract         | Purpose                                               |
|------------------|-------------------------------------------------------|
| SenseiGateway    | Central entry point, orchestrates all actions         |
| SenseiRegistry   | Manages Sensei profiles, AI replicas, knowledge tracking |
| SenseiToken      | Floating stablecoin, knowledge-backed                 |
| BookingSystem    | Handles lesson bookings, payments, session management |
| LessonNFT        | Creates/mints lesson NFTs, manages revenue split      |
| SensayAI         | Deploys/manages personal AI agents for each Sensei    |
| PrivacyManager   | Zama FHEVM integration for encrypted knowledge uploads|
| SenseiCrossChain | Cross-chain messaging and operations                  |
| Libraries        | Constants, DataTypes, Errors, Events (shared logic)   |

---

## Every Tiny Detail

- No registration required for students: Anyone can book a lesson instantly.  
- Universal payment: ETH or any ERC20 token accepted.  
- AI replicas: Each Sensei gets up to 5 evolving AI clones.  
- NFTs: Each lesson can be minted as a unique NFT, with dynamic pricing.  
- Revenue split: 50% Sensei, 45% student, 5% platform fee.  
- Privacy: All knowledge uploads are encrypted and confidential.  
- Cross-chain: Bookings and NFT minting can happen from Base, Lisk, or other chains.  
- Emergency controls: Owner can pause the platform if needed.  
- Transparent economics: All metrics and flows are on-chain and auditable.  
- Upgradeable: Modular contracts allow for future upgrades and integrations.  
- Open source: MIT licensed, welcoming contributions.  

---

## Summary
Sensei is a modular, privacy-first, AI-powered, cross-chain knowledge economy platform, where anyone can learn, teach, earn, and invest in wisdom—securely, transparently, and fairly.
