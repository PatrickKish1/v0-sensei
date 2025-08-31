// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Events - Comprehensive event definitions for the Sensei platform
 * @notice All events used across the platform for tracking and monitoring
 * @dev Events are the breadcrumbs we leave behind to track what happened
 * These events tell the story of the platform, ya know?
 */
library Events {
    // ============ SENSEI REGISTRY EVENTS ============
    event SenseiRegistered(
        uint256 indexed senseiId,
        address indexed senseiAddress,
        string name,
        string expertise,
        uint256 hourlyRate,
        bool isRetired,
        uint256 timestamp
    );
    
    event SenseiProfileUpdated(
        uint256 indexed senseiId,
        address indexed senseiAddress,
        string name,
        string expertise,
        uint256 newHourlyRate,
        uint256 timestamp
    );
    
    event SenseiDeactivated(
        uint256 indexed senseiId,
        address indexed senseiAddress,
        uint256 timestamp
    );
    
    event SenseiReactivated(
        uint256 indexed senseiId,
        address indexed senseiAddress,
        uint256 timestamp
    );
    
    // ============ AI REPLICA EVENTS ============
    event PersonalAICreated(
        uint256 indexed senseiId,
        address indexed senseiAddress,
        string aiModel,
        string personalizedPrompt,
        uint256 timestamp
    );
    
    event AIReplicaCreated(
        uint256 indexed replicaId,
        uint256 indexed senseiId,
        string replicaName,
        string specialization,
        uint256 initialKnowledgeLevel,
        uint256 timestamp
    );
    
    event ReplicaKnowledgeUpdated(
        uint256 indexed replicaId,
        uint256 indexed senseiId,
        uint256 oldKnowledgeLevel,
        uint256 newKnowledgeLevel,
        uint256 timestamp
    );
    
    event AIInteraction(
        uint256 indexed senseiId,
        address indexed user,
        string queryHash,
        string responseHash,
        bool isEncrypted,
        uint256 timestamp
    );
    
    event AIConfigUpdated(
        uint256 indexed senseiId,
        string newPrompt,
        string newModel,
        uint256 timestamp
    );
    
    event AIModelAdded(
        string modelName,
        string description,
        uint256 timestamp
    );
    
    event AIModelRemoved(
        string modelName,
        uint256 timestamp
    );
    
    // ============ SESSION & BOOKING EVENTS ============
    event SessionBooked(
        uint256 indexed sessionId,
        uint256 indexed senseiId,
        address indexed studentAddress,
        string subject,
        uint256 duration,
        uint256 price,
        address paymentToken,
        bool nftMintable,
        uint256 timestamp
    );
    
    event SessionAccepted(
        uint256 indexed sessionId,
        uint256 indexed senseiId,
        address indexed studentAddress,
        uint256 timestamp
    );
    
    event SessionDeclined(
        uint256 indexed sessionId,
        uint256 indexed senseiId,
        address indexed studentAddress,
        string reason,
        uint256 timestamp
    );
    
    event SessionStarted(
        uint256 indexed sessionId,
        uint256 indexed senseiId,
        address indexed studentAddress,
        uint256 startTime
    );
    
    event SessionCompleted(
        uint256 indexed sessionId,
        uint256 indexed senseiId,
        address indexed studentAddress,
        uint256 knowledgeValue,
        uint256 lessonQuality,
        uint256 duration,
        uint256 timestamp
    );
    
    event SessionCancelled(
        uint256 indexed sessionId,
        uint256 indexed senseiId,
        address indexed studentAddress,
        address cancelledBy,
        string reason,
        uint256 timestamp
    );
    
    event SessionRated(
        uint256 indexed sessionId,
        uint256 indexed senseiId,
        address indexed rater,
        uint256 rating,
        string feedback,
        uint256 timestamp
    );
    
    event PaymentProcessed(
        uint256 indexed sessionId,
        address indexed sensei,
        address indexed student,
        uint256 senseiAmount,
        uint256 platformFee,
        address paymentToken,
        uint256 timestamp
    );
    
    event PaymentRefunded(
        uint256 indexed sessionId,
        address indexed student,
        uint256 amount,
        address paymentToken,
        string reason,
        uint256 timestamp
    );
    
    // ============ TOKEN ECONOMICS EVENTS ============
    event TokensMinted(
        address indexed to,
        uint256 amount,
        uint256 ethPaid,
        uint256 mintRate,
        string mintType,
        uint256 timestamp
    );
    
    event TokensBurned(
        address indexed from,
        uint256 amount,
        string burnReason,
        uint256 timestamp
    );
    
    event TokensMintedForNFT(
        address indexed student,
        address indexed sensei,
        uint256 studentAmount,
        uint256 senseiAmount,
        uint256 platformFee,
        uint256 nftValue,
        uint256 timestamp
    );
    
    event KnowledgeSessionCompleted(
        uint256 indexed sessionId,
        uint256 knowledgeValue,
        uint256 backingValue,
        uint256 tokensGenerated,
        uint256 timestamp
    );
    
    event RebaseExecuted(
        uint256 newTotalSupply,
        uint256 newBackingRatio,
        uint256 newMintRate,
        uint256 totalKnowledgeValue,
        uint256 timestamp
    );
    
    event MintRateUpdated(
        uint256 oldRate,
        uint256 newRate,
        uint256 demandRatio,
        uint256 timestamp
    );
    
    event SenseiEarningsDistributed(
        address indexed sensei,
        uint256 amount,
        string earningsType,
        uint256 timestamp
    );
    
    // ============ NFT EVENTS ============
    event LessonNFTCreated(
        uint256 indexed tokenId,
        uint256 indexed sessionId,
        address indexed senseiAddress,
        address studentAddress,
        string subject,
        uint256 mintPrice,
        bool isPublicMintable,
        uint256 timestamp
    );
    
    event LessonNFTMinted(
        uint256 indexed tokenId,
        address indexed minter,
        address indexed student,
        address sensei,
        uint256 mintPrice,
        uint256 studentEarnings,
        uint256 senseiEarnings,
        uint256 timestamp
    );
    
    event LessonMetadataUpdated(
        uint256 indexed tokenId,
        string newURI,
        address updatedBy,
        uint256 timestamp
    );
    
    event LessonQualityUpdated(
        uint256 indexed tokenId,
        uint256 oldQuality,
        uint256 newQuality,
        address updatedBy,
        uint256 timestamp
    );
    
    // ============ PRIVACY & ENCRYPTION EVENTS ============
    event EncryptedDataUploaded(
        uint256 indexed contributionId,
        uint256 indexed senseiId,
        uint256 indexed replicaId,
        string dataType,
        bytes32 dataHash,
        bool isPrivacySensitive,
        uint256 timestamp
    );
    
    event DataVerified(
        uint256 indexed contributionId,
        address indexed verifier,
        bool approved,
        uint256 qualityScore,
        uint256 privacyScore,
        uint256 timestamp
    );
    
    event DataProcessedByAI(
        uint256 indexed contributionId,
        uint256 indexed replicaId,
        uint256 knowledgeIncrease,
        uint256 newKnowledgeLevel,
        uint256 timestamp
    );
    
    event DataDecryptionRequested(
        uint256 indexed contributionId,
        address indexed requester,
        uint256 requestId,
        uint256 timestamp
    );
    
    event DataDecryptionCompleted(
        uint256 indexed contributionId,
        uint256 requestId,
        bool successful,
        uint256 timestamp
    );
    
    // ============ KNOWLEDGE CONTRIBUTION EVENTS ============
    event KnowledgeContributionRecorded(
        uint256 indexed senseiId,
        uint256 contributionValue,
        uint256 totalContributions,
        string contributionType,
        uint256 timestamp
    );
    
    event DataSourceRegistered(
        uint256 indexed senseiId,
        uint256 indexed datTokenId,
        string dataType,
        uint256 timestamp
    );
    
    event DataSourceAuthorized(
        uint256 indexed senseiId,
        uint256 indexed datTokenId,
        bool authorized,
        uint256 timestamp
    );
    
    // ============ EARNINGS & REVENUE EVENTS ============
    event EarningsUpdated(
        uint256 indexed senseiId,
        address indexed senseiAddress,
        uint256 additionalEarnings,
        uint256 newTotalEarnings,
        string earningsSource,
        uint256 timestamp
    );
    
    event RevenueShareDistributed(
        uint256 indexed tokenId,
        uint256 totalAmount,
        uint256 holdersCount,
        uint256 timestamp
    );
    
    event RevenueShareClaimed(
        uint256 indexed tokenId,
        address indexed claimer,
        uint256 amount,
        uint256 timestamp
    );
    
    // ============ AUTHORIZATION & ACCESS EVENTS ============
    event VerifierAuthorized(
        address indexed verifier,
        bool authorized,
        uint256 timestamp
    );
    
    event TEEVerifierAuthorized(
        address indexed verifier,
        bool authorized,
        uint256 timestamp
    );
    
    event AuthorizedMinterUpdated(
        address indexed minter,
        bool authorized,
        string contractType,
        uint256 timestamp
    );
    
    event AuthorizedBurnerUpdated(
        address indexed burner,
        bool authorized,
        string contractType,
        uint256 timestamp
    );
    
    // ============ PLATFORM MANAGEMENT EVENTS ============
    event PlatformConfigUpdated(
        string configType,
        uint256 oldValue,
        uint256 newValue,
        address updatedBy,
        uint256 timestamp
    );
    
    event EmergencyPaused(
        address indexed pausedBy,
        string reason,
        uint256 timestamp
    );
    
    event EmergencyResumed(
        address indexed resumedBy,
        string reason,
        uint256 timestamp
    );
    
    event ContractUpgraded(
        address indexed oldContract,
        address indexed newContract,
        string contractType,
        uint256 timestamp
    );
    
    // ============ PRIVACY SETTINGS EVENTS ============
    event PrivacySettingsUpdated(
        uint256 maxDataSize,
        uint256 retentionPeriod,
        address updatedBy,
        uint256 timestamp
    );
    
    event DataCleanupExecuted(
        uint256 contributionsDeleted,
        uint256 bytesFreed,
        address executedBy,
        uint256 timestamp
    );
    
    // ============ GLOBAL CONFIGURATION EVENTS ============
    event GlobalConfigUpdated(
        string basePrompt,
        string personalityTraits,
        uint256 timestamp
    );
    
    event PlatformStatsUpdated(
        uint256 totalSenseis,
        uint256 totalSessions,
        uint256 totalNFTs,
        uint256 totalTokens,
        uint256 totalKnowledgeValue,
        uint256 timestamp
    );
}