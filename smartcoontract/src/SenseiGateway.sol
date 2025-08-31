// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {TFHE} from "@fhevm/solidity/lib/TFHE.sol";
import {SenseiRegistry} from "./SenseiRegistry.sol";
import {SenseiToken} from "./SenseiToken.sol";
import {BookingSystem} from "./BookingSystem.sol";
import {LessonNFT} from "./LessonNFT.sol";
import {SensayAI} from "./SensayAI.sol";
import {PrivacyManager} from "./PrivacyManager.sol";
import {SenseiCrossChain} from "./SenseiCrossChain.sol";
import {Constants} from "./libraries/Constants.sol";
import {Errors} from "./libraries/Errors.sol";
import {Events} from "./libraries/Events.sol";
import {DataTypes} from "./libraries/DataTypes.sol";

/**
 * @title SenseiGateway - Central Gateway for Sensei Knowledge Economy
 * @notice Single entry point for all Sensei platform interactions
 * @dev Coordinates between all contracts and manages the complete user journey
 */
contract SenseiGateway is Ownable, ReentrancyGuard {
    
    // Contract references - the gang's all here
    SenseiRegistry public senseiRegistry;
    SenseiToken public senseiToken;
    BookingSystem public bookingSystem;
    LessonNFT public lessonNFT;
    SensayAI public sensayAI;
    PrivacyManager public privacyManager;
    SenseiCrossChain public crossChain;
    
    // Platform statistics
    struct PlatformStats {
        uint256 totalSenseis;
        uint256 totalSessions;
        uint256 totalNFTsMinted;
        uint256 totalTokensCirculating;
        uint256 totalKnowledgeValue;
        uint256 totalEarnings;
    }
    
    // Events
    event SenseiRegistrationComplete(uint256 indexed senseiId, address indexed senseiAddress, bool hasAI);
    event SessionBookingComplete(uint256 indexed sessionId, uint256 indexed senseiId, address indexed student);
    event SessionCompletionProcessed(uint256 indexed sessionId, uint256 nftId, bool nftMintable);
    event NFTMintingProcessed(uint256 indexed nftId, address indexed minter, uint256 studentShare, uint256 senseiShare);
    event KnowledgeDataUploaded(uint256 indexed contributionId, uint256 indexed senseiId, uint256 indexed replicaId);
    event PlatformStatsUpdated(PlatformStats stats);
    
    modifier contractsInitialized() {
        require(address(senseiRegistry) != address(0), "SenseiRegistry not set");
        require(address(senseiToken) != address(0), "SenseiToken not set");
        require(address(bookingSystem) != address(0), "BookingSystem not set");
        require(address(lessonNFT) != address(0), "LessonNFT not set");
        require(address(sensayAI) != address(0), "SensayAI not set");
        require(address(privacyManager) != address(0), "PrivacyManager not set");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Contract addresses will be set after deployment
    }
    
    /**
     * @dev Complete sensei registration with AI creation and replica setup
     * @param name Name of the sensei
     * @param expertise Primary expertise area
     * @param description Personal description
     * @param hourlyRate Hourly rate for lessons
     * @param isRetired Whether this is a retired person
     * @param skills Array of skills they can teach
     */
    function registerSensei(
        string memory name,
        string memory expertise,
        string memory description,
        uint256 hourlyRate,
        bool isRetired,
        string[] memory skills
    ) external contractsInitialized nonReentrant returns (uint256) {
        // Register sensei in registry (this also creates AI and initial replica)
        uint256 senseiId = senseiRegistry.registerSensei(
            name, expertise, description, hourlyRate, isRetired, skills
        );
        
        // Create personal AI in SensayAI contract
        sensayAI.createPersonalAI(senseiId, name, expertise, description);
        
        emit SenseiRegistrationComplete(senseiId, msg.sender, true);
        
        return senseiId;
    }
    
    /**
     * @dev Book a lesson session with ETH payment
     * @param senseiId ID of the sensei
     * @param subject Subject of the lesson
     * @param sessionTitle Title of the session
     * @param sessionDescription Description of what student wants to learn
     * @param duration Duration in minutes
     * @param nftMintable Whether student wants the lesson NFT to be mintable by others
     */
    function bookLessonWithETH(
        uint256 senseiId,
        string memory subject,
        string memory sessionTitle,
        string memory sessionDescription,
        uint256 duration,
        bool nftMintable
    ) external payable contractsInitialized nonReentrant returns (uint256) {
        // Book session through BookingSystem
        uint256 sessionId = bookingSystem.bookSessionWithETH{value: msg.value}(
            senseiId, subject, sessionTitle, sessionDescription, duration, nftMintable
        );
        
        emit SessionBookingComplete(sessionId, senseiId, msg.sender);
        
        return sessionId;
    }
    
    /**
     * @dev Book a lesson session with any ERC20 token
     * @param senseiId ID of the sensei
     * @param subject Subject of the lesson
     * @param sessionTitle Title of the session
     * @param sessionDescription Description of what student wants to learn
     * @param duration Duration in minutes
     * @param tokenAmount Amount of tokens to pay
     * @param paymentToken Address of the ERC20 token to use for payment
     * @param nftMintable Whether student wants the lesson NFT to be mintable by others
     */
    function bookLessonWithToken(
        uint256 senseiId,
        string memory subject,
        string memory sessionTitle,
        string memory sessionDescription,
        uint256 duration,
        uint256 tokenAmount,
        address paymentToken,
        bool nftMintable
    ) external contractsInitialized nonReentrant returns (uint256) {
        // Book session through BookingSystem
        uint256 sessionId = bookingSystem.bookSessionWithToken(
            senseiId, subject, sessionTitle, sessionDescription, duration, tokenAmount, paymentToken, nftMintable
        );
        
        emit SessionBookingComplete(sessionId, senseiId, msg.sender);
        
        return sessionId;
    }
    
    /**
     * @dev Book a lesson session with SenseiTokens (legacy function for backward compatibility)
     * @param senseiId ID of the sensei
     * @param subject Subject of the lesson
     * @param sessionTitle Title of the session
     * @param sessionDescription Description of what student wants to learn
     * @param duration Duration in minutes
     * @param tokenAmount Amount of SenseiTokens to pay
     * @param nftMintable Whether student wants the lesson NFT to be mintable by others
     */
    function bookLessonWithTokens(
        uint256 senseiId,
        string memory subject,
        string memory sessionTitle,
        string memory sessionDescription,
        uint256 duration,
        uint256 tokenAmount,
        bool nftMintable
    ) external contractsInitialized nonReentrant returns (uint256) {
        // Book session using SenseiTokens through BookingSystem
        uint256 sessionId = bookingSystem.bookSessionWithTokens(
            senseiId, subject, sessionTitle, sessionDescription, duration, tokenAmount, nftMintable
        );
        
        emit SessionBookingComplete(sessionId, senseiId, msg.sender);
        return sessionId;
    }
    
    /**
     * @dev Mint SenseiTokens with ETH (anyone can do this)
     * @return Amount of tokens minted
     */
    function mintTokensWithETH() external payable contractsInitialized nonReentrant returns (uint256) {
        return senseiToken.mintWithETH{value: msg.value}();
    }
    
    /**
     * @dev Mint a lesson NFT (implements 50/50 split with 5% platform fee)
     * @param tokenId ID of the NFT to mint
     */
    function mintLessonNFT(uint256 tokenId) external contractsInitialized nonReentrant {
        // Get NFT metadata to determine student and sensei
        LessonNFT.LessonMetadata memory metadata = lessonNFT.getLessonMetadata(tokenId);
        require(metadata.isPublicMintable, "NFT is not publicly mintable");
        
        // Mint the NFT (this handles the payment and 50/50 split)
        lessonNFT.mintLessonNFT(tokenId);
        
        emit NFTMintingProcessed(
            tokenId, 
            msg.sender, 
            metadata.mintPrice / 2 - (metadata.mintPrice * 5) / 200, // Student share minus 5% platform fee
            metadata.mintPrice / 2 // Sensei share
        );
    }
    
    /**
     * @dev Upload encrypted knowledge data for AI replica training
     * @param senseiId ID of the sensei
     * @param replicaId ID of the AI replica
     * @param dataType Type of knowledge data
     * @param encryptedData Encrypted data bytes
     * @param metadataUri IPFS URI for metadata
     * @param isPrivacySensitive Whether data is privacy sensitive
     * @param tags Tags for categorization
     */
    function uploadKnowledgeData(
        uint256 senseiId,
        uint256 replicaId,
        string memory dataType,
        bytes calldata encryptedData,
        string memory metadataUri,
        bool isPrivacySensitive,
        string[] memory tags
    ) external contractsInitialized nonReentrant returns (uint256) {
        // Upload through PrivacyManager with FHEVM encryption
        // Note: encryptedData needs to be converted to ebytes256 format
        uint256 contributionId = privacyManager.uploadEncryptedKnowledge(
            senseiId, replicaId, dataType, TFHE.asEbytes256(encryptedData), metadataUri, isPrivacySensitive, tags, TFHE.asEuint64(0)
        );
        
        emit KnowledgeDataUploaded(contributionId, senseiId, replicaId);
        
        return contributionId;
    }
    
    /**
     * @dev Interact with a sensei's personal AI
     * @param senseiId ID of the sensei
     * @param query Question or request for the AI
     * @return AI response
     */
    function chatWithSenseiAI(uint256 senseiId, string memory query) 
        external 
        contractsInitialized 
        returns (string memory) 
    {
        return sensayAI.interactWithSensayAI(senseiId, query);
    }
    
    /**
     * @dev Create a specialized AI replica for a sensei
     * @param senseiId ID of the sensei
     * @param specialization Specific area of expertise
     * @param replicaName Name for the replica
     * @return ID of the created replica
     */
    function createSpecializedReplica(
        uint256 senseiId,
        string memory specialization,
        string memory replicaName
    ) external contractsInitialized nonReentrant returns (uint256) {
        return senseiRegistry.createSpecializedReplica(senseiId, specialization, replicaName);
    }
    
    /**
     * @dev Get comprehensive platform statistics
     * @return PlatformStats struct with all key metrics
     */
    function getPlatformStats() external view contractsInitialized returns (PlatformStats memory) {
        (uint256 totalSupply, uint256 knowledgeValue, , , uint256 totalEarnings) = senseiToken.getEconomyMetrics();
        
        PlatformStats memory stats = PlatformStats({
            totalSenseis: senseiRegistry.getTotalSenseiCount(),
            totalSessions: bookingSystem.getTotalSessions(),
            totalNFTsMinted: lessonNFT.getTotalLessonNFTs(),
            totalTokensCirculating: totalSupply,
            totalKnowledgeValue: knowledgeValue,
            totalEarnings: totalEarnings
        });
        
        return stats;
    }
    
    /**
     * @dev Get sensei dashboard data
     * @param senseiId ID of the sensei
     * @return profile Sensei profile information
     * @return sessionIds Array of session IDs for the sensei
     * @return replicaIds Array of AI replica IDs for the sensei
     * @return tokenEarnings Total token earnings for the sensei
     * @return knowledgeContributions Total knowledge contributions for the sensei
     */
    function getSenseiDashboard(uint256 senseiId) external view contractsInitialized returns (
        SenseiRegistry.SenseiProfile memory profile,
        uint256[] memory sessionIds,
        uint256[] memory replicaIds,
        uint256 tokenEarnings,
        uint256 knowledgeContributions
    ) {
        profile = senseiRegistry.getSenseiProfile(senseiId);
        sessionIds = bookingSystem.getSenseiSessions(senseiId);
        replicaIds = senseiRegistry.getSenseiReplicas(senseiId);
        (tokenEarnings, knowledgeContributions) = senseiToken.getSenseiMetrics(profile.senseiAddress);
        
        return (profile, sessionIds, replicaIds, tokenEarnings, knowledgeContributions);
    }
    
    /**
     * @dev Get student dashboard data
     * @param studentAddress Address of the student
     * @return sessionIds Array of session IDs for the student
     * @return ownedNFTs Array of NFT IDs owned by the student
     * @return tokenBalance Current token balance of the student
     */
    function getStudentDashboard(address studentAddress) external view contractsInitialized returns (
        uint256[] memory sessionIds,
        uint256[] memory ownedNFTs,
        uint256 tokenBalance
    ) {
        sessionIds = bookingSystem.getStudentSessions(studentAddress);
        // Note: Would need to implement a function to get student's owned NFTs
        tokenBalance = senseiToken.balanceOf(studentAddress);
        
        // Placeholder for owned NFTs - would need implementation
        ownedNFTs = new uint256[](0);
        
        return (sessionIds, ownedNFTs, tokenBalance);
    }
    
    /**
     * @dev Get all active senseis (for browsing)
     * @return Array of active sensei IDs
     */
    function getActiveSenseis() external view contractsInitialized returns (uint256[] memory) {
        return senseiRegistry.getActiveSenseiIds();
    }
    
    /**
     * @dev Get all retired senseis (special category)
     * @return Array of retired sensei IDs
     */
    function getRetiredSenseis() external view contractsInitialized returns (uint256[] memory) {
        return senseiRegistry.getRetiredSenseis();
    }
    
    /**
     * @dev Get mintable NFTs (for browsing and purchasing)
     * @return Array of mintable NFT IDs with metadata
     */
    function getMintableNFTs() external view contractsInitialized returns (uint256[] memory, LessonNFT.LessonMetadata[] memory) {
        uint256 totalNFTs = lessonNFT.getTotalLessonNFTs();
        uint256 mintableCount = 0;
        
        // Count mintable NFTs
        for (uint256 i = 1; i <= totalNFTs; i++) {
            LessonNFT.LessonMetadata memory metadata = lessonNFT.getLessonMetadata(i);
            if (metadata.isPublicMintable && !metadata.isMinted) {
                mintableCount++;
            }
        }
        
        // Collect mintable NFTs
        uint256[] memory tokenIds = new uint256[](mintableCount);
        LessonNFT.LessonMetadata[] memory metadataArray = new LessonNFT.LessonMetadata[](mintableCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalNFTs; i++) {
            LessonNFT.LessonMetadata memory metadata = lessonNFT.getLessonMetadata(i);
            if (metadata.isPublicMintable && !metadata.isMinted) {
                tokenIds[index] = i;
                metadataArray[index] = metadata;
                index++;
            }
        }
        
        return (tokenIds, metadataArray);
    }
    
    // Admin functions
    
    /**
     * @dev Set all contract addresses (only owner)
     * @param _senseiRegistry SenseiRegistry contract address
     * @param _senseiToken SenseiToken contract address
     * @param _bookingSystem BookingSystem contract address
     * @param _lessonNFT LessonNFT contract address
     * @param _sensayAI SensayAI contract address
     * @param _privacyManager PrivacyManager contract address
     */
    function setContractAddresses(
        address _senseiRegistry,
        address _senseiToken,
        address _bookingSystem,
        address _lessonNFT,
        address _sensayAI,
        address _privacyManager
    ) external onlyOwner {
        if (_senseiRegistry != address(0)) senseiRegistry = SenseiRegistry(_senseiRegistry);
        if (_senseiToken != address(0)) senseiToken = SenseiToken(payable(_senseiToken));
        if (_bookingSystem != address(0)) bookingSystem = BookingSystem(_bookingSystem);
        if (_lessonNFT != address(0)) lessonNFT = LessonNFT(_lessonNFT);
        if (_sensayAI != address(0)) sensayAI = SensayAI(_sensayAI);
        if (_privacyManager != address(0)) privacyManager = PrivacyManager(payable(_privacyManager));
    }
    
    /**
     * @dev Initialize contract authorizations (only owner)
     * This sets up the necessary permissions between contracts
     */
    function initializeAuthorizations() external onlyOwner contractsInitialized {
        // Authorize BookingSystem to mint tokens and update registries
        senseiToken.setAuthorizedMinter(address(bookingSystem), true);
        
        // Authorize LessonNFT to mint tokens for NFT sales
        senseiToken.setAuthorizedMinter(address(lessonNFT), true);
        
        // Set contract references in other contracts
        senseiRegistry.setSenseiTokenContract(address(senseiToken));
        senseiRegistry.setPrivacyManagerContract(address(privacyManager));
        
        // Set SenseiRegistry in SensayAI
        sensayAI.setSenseiRegistry(address(senseiRegistry));
        
        // Set contract addresses in PrivacyManager
        privacyManager.setContractReferences(address(senseiRegistry), address(sensayAI));
    }
    
    /**
     * @dev Emergency pause all operations (only owner)
     */
    function emergencyPause() external onlyOwner {
        // This would pause all major operations
        // Implementation depends on pause mechanisms in individual contracts
    }
    
    /**
     * @dev Get contract addresses (for verification)
     */
    function getContractAddresses() external view returns (
        address registry,
        address token,
        address booking,
        address nft,
        address ai,
        address privacy
    ) {
        return (
            address(senseiRegistry),
            address(senseiToken),
            address(bookingSystem),
            address(lessonNFT),
            address(sensayAI),
            address(privacyManager)
        );
    }
    
    // ============ CROSS-CHAIN FUNCTIONS ============
    
    /**
     * @dev Set cross-chain contract address (only owner)
     * @param _crossChain Address of the cross-chain contract
     */
    function setCrossChainContract(address _crossChain) external onlyOwner {
        if (_crossChain == Constants.ZERO_ADDRESS) revert Errors.InvalidAddress();
        crossChain = SenseiCrossChain(payable(_crossChain));
    }
    
    /**
     * @dev Book a lesson from another chain (Lisk/Base → Ethereum)
     * This function is called by the cross-chain contract when handling incoming messages
     * @param senseiId ID of the sensei to book
     * @param subject Lesson subject
     * @param sessionTitle Title of the session
     * @param sessionDescription Description of what to learn
     * @param duration Duration in minutes
     * @param nftMintable Whether others can mint this as NFT
     * @return sessionId Created session ID
     */
    function bookCrossChainLesson(
        uint256 senseiId,
        string calldata subject,
        string calldata sessionTitle,
        string calldata sessionDescription,
        uint256 duration,
        bool nftMintable
    ) external payable returns (uint256 sessionId) {
        // Only allow cross-chain contract to call this
        require(msg.sender == address(crossChain), "Only cross-chain contract");
        
        // Book the lesson through the normal flow
        sessionId = bookingSystem.bookSessionWithETH{value: msg.value}(
            senseiId,
            subject,
            sessionTitle,
            sessionDescription,
            duration,
            nftMintable
        );
        
        emit SessionBookingComplete(sessionId, senseiId, tx.origin); // tx.origin is the original student
        return sessionId;
    }
    
    /**
     * @dev Mint an NFT from another chain (Lisk/Base → Ethereum)
     * This function is called by the cross-chain contract when handling NFT mint requests
     * @param tokenId ID of the NFT to mint
     * @return success Whether minting succeeded
     */
    function mintCrossChainNFT(uint256 tokenId) external returns (bool success) {
        // Only allow cross-chain contract to call this
        require(msg.sender == address(crossChain), "Only cross-chain contract");
        
        try this.mintLessonNFT(tokenId) {
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * @dev Get cross-chain operation fee quote
     * @param destinationChain Target chain (Lisk/Base)
     * @param operationType Type of operation (booking/minting)
     * @return fee Estimated fee for cross-chain operation
     */
    function quoteCrossChainFee(
        uint32 destinationChain,
        uint8 operationType
    ) external view returns (uint256 fee) {
        if (address(crossChain) == Constants.ZERO_ADDRESS) return 0;
        
        // This would call the cross-chain contract's quote function
        // For now, return a basic estimate
        return 0.01 ether; // Base fee for cross-chain operations
    }
}