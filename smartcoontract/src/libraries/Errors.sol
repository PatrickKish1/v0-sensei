// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Errors - Comprehensive error definitions for the Sensei platform
 * @notice All custom errors used across the platform - no more generic "revert" messages
 * @dev Using custom errors saves gas and provides better debugging info
 * These error messages are written like I'm actually frustrated when they happen, ya know?
 */
library Errors {
    // ============ GENERAL ERRORS ============
    error InvalidAddress(); // "Bruh, that address ain't valid"
    error InvalidId(); // "That ID doesn't exist, what are you doing?"
    error InvalidAmount(); // "Amount can't be zero or negative, come on"
    error InvalidState(); // "Contract is in wrong state for this operation"
    error Unauthorized(); // "You're not allowed to do that, nice try though"
    error AlreadyExists(); // "This already exists, no duplicates allowed"
    error NotFound(); // "Couldn't find what you're looking for"
    error Expired(); // "This has expired, you're too late"
    error TooEarly(); // "Hold up, it's too early for this"
    error Paused(); // "System is paused, try again later"
    error NotPaused(); // "System isn't paused, why are you trying to unpause?"
    
    // ============ VALIDATION ERRORS ============
    error EmptyString(); // "String can't be empty, give us something to work with"
    error StringTooLong(); // "That string is way too long, keep it short"
    error StringTooShort(); // "String is too short, need more characters"
    error ArrayTooLong(); // "Array has too many elements, dial it back"
    error ArrayEmpty(); // "Array is empty, need at least one element"
    error InvalidRange(); // "Value is outside the allowed range"
    error InvalidFormat(); // "Format is wrong, check the requirements"
    error InvalidSignature(); // "Signature doesn't match, something's fishy"
    
    // ============ PAYMENT & TOKEN ERRORS ============
    error InsufficientBalance(); // "Not enough tokens/ETH, go get some more"
    error InsufficientETH(); // "Need more ETH for this operation"
    error InsufficientAllowance(); // "Token allowance is too low, approve more"
    error TransferFailed(); // "Token transfer failed, something went wrong"
    error PaymentFailed(); // "Payment couldn't be processed"
    error RefundFailed(); // "Couldn't refund the payment, that's not good"
    error ExceedsMaxSupply(); // "Would exceed maximum token supply"
    error BelowMinimumAmount(); // "Amount is below minimum required"
    error ExceedsMaximumAmount(); // "Amount exceeds maximum allowed"
    
    // ============ SENSEI REGISTRY ERRORS ============
    error SenseiNotFound(); // "Sensei doesn't exist in our system"
    error SenseiNotActive(); // "Sensei is not active, they might be taking a break"
    error SenseiAlreadyRegistered(); // "This address is already a sensei"
    error OnlyCreator(); // "Only the creator can do this operation"
    error OnlySensei(); // "Only the sensei can perform this action"
    error InvalidSenseiData(); // "Sensei data is invalid or incomplete"
    error TooManyReplicas(); // "Too many AI replicas, quality over quantity"
    error ReplicaNotFound(); // "AI replica doesn't exist"
    error ReplicaInactive(); // "AI replica is not active"
    
    // ============ SESSION & BOOKING ERRORS ============
    error SessionNotFound(); // "Session doesn't exist, check the ID"
    error SessionExpired(); // "Session has expired, book a new one"
    error SessionNotPending(); // "Session is not in pending state"
    error SessionAlreadyStarted(); // "Session already started, can't modify"
    error SessionAlreadyCompleted(); // "Session is already completed"
    error SessionCancelled(); // "Session was cancelled"
    error InvalidSessionState(); // "Session is in wrong state for this operation"
    error SessionTooShort(); // "Session duration is too short"
    error SessionTooLong(); // "Session duration is too long, nobody got time for that"
    error AlreadyRated(); // "Already rated this session, one rating per customer"
    error CannotRateOwnSession(); // "Can't rate your own session, that's cheating"
    
    // ============ NFT ERRORS ============
    error NFTNotFound(); // "NFT doesn't exist, wrong token ID"
    error NFTAlreadyMinted(); // "NFT is already minted to someone"
    error NFTNotMintable(); // "This NFT is not available for public minting"
    error NFTNotOwned(); // "You don't own this NFT"
    error InvalidNFTPrice(); // "NFT price is invalid"
    error NFTTransferFailed(); // "Couldn't transfer the NFT"
    
    // ============ AI & PRIVACY ERRORS ============
    error PersonalAINotFound(); // "Personal AI doesn't exist for this sensei"
    error PersonalAIInactive(); // "Personal AI is not active"
    error InvalidQuery(); // "AI query is invalid or empty"
    error QueryTooLong(); // "AI query is too long, keep it concise"
    error InvalidAIModel(); // "AI model is not supported"
    error AIResponseFailed(); // "AI failed to generate a response"
    error ConversationHistoryFull(); // "Conversation history is full, time to clean up"
    
    // ============ PRIVACY & ENCRYPTION ERRORS ============
    error DataNotEncrypted(); // "Data must be encrypted before upload"
    error EncryptionFailed(); // "Encryption process failed"
    error DecryptionFailed(); // "Decryption process failed"
    error InvalidDataHash(); // "Data hash doesn't match"
    error DataHashMismatch(); // "Data hash verification failed"
    error DataTooLarge(); // "Data size exceeds maximum allowed"
    error DataCorrupted(); // "Data appears to be corrupted"
    error PrivacyViolation(); // "Operation would violate privacy rules"
    error UnauthorizedDecryption(); // "Not authorized to decrypt this data"
    
    // ============ ZAMA FHEVM SPECIFIC ERRORS ============
    error HCULimitExceeded(); // "Transaction exceeds HCU limit, reduce operations"
    error HCUDepthLimitExceeded(); // "Sequential operations exceed depth limit"
    error EncryptedOperationFailed(); // "Encrypted operation failed"
    error InvalidCiphertext(); // "Ciphertext is invalid or corrupted"
    error DecryptionNotReady(); // "Decryption result is not ready yet"
    error InvalidDecryptionRequest(); // "Decryption request is invalid"
    
    // ============ VERIFICATION ERRORS ============
    error NotVerified(); // "Data or operation is not verified"
    error AlreadyVerified(); // "Already verified, can't verify again"
    error VerificationFailed(); // "Verification process failed"
    error InvalidVerifier(); // "Verifier is not authorized"
    error VerificationExpired(); // "Verification has expired"
    
    // ============ ECONOMIC ERRORS ============
    error InsufficientKnowledgeValue(); // "Knowledge value is too low"
    error InvalidTokenomics(); // "Token economics don't add up"
    error RebaseFailed(); // "Token rebase operation failed"
    error InvalidMintRate(); // "Minting rate is invalid"
    error EconomyImbalanced(); // "Token economy is imbalanced"
    
    // ============ RATING & QUALITY ERRORS ============
    error InvalidRating(); // "Rating must be between 1-9, learn to count"
    error RatingOutOfRange(); // "Rating is outside allowed range"
    error QualityTooLow(); // "Quality score is too low to proceed"
    error InvalidQualityScore(); // "Quality score is invalid"
    
    // ============ TIME & SCHEDULING ERRORS ============
    error TooEarlyToExecute(); // "Too early to execute this operation"
    error TooLateToExecute(); // "Too late to execute this operation"
    error InvalidTimeRange(); // "Time range is invalid"
    error SchedulingConflict(); // "There's a scheduling conflict"
    
    // ============ ACCESS CONTROL ERRORS ============
    error OnlyOwner(); // "Only the contract owner can do this"
    error OnlyAuthorized(); // "Only authorized addresses can do this"
    error OnlyStudent(); // "Only the student can perform this action"
    error OnlyVerifier(); // "Only authorized verifiers can do this"
    error OnlyAIAgent(); // "Only the AI agent contract can call this"
    
    // ============ WITHDRAWAL & FEE ERRORS ============
    error NoFeesToWithdraw(); // "No fees available for withdrawal"
    error WithdrawalFailed(); // "Withdrawal operation failed"
    error InvalidFeePercentage(); // "Fee percentage is invalid"
    error FeeTooHigh(); // "Fee is too high, that's highway robbery"
    
    // ============ DATA CONTRIBUTION ERRORS ============
    error DuplicateData(); // "This data has already been contributed"
    error DataNotActive(); // "Data is not active for usage"
    error AssetNotActive(); // "Asset is not active"
    error ContributionNotFound(); // "Data contribution doesn't exist"
    error InvalidContribution(); // "Data contribution is invalid"
    
    // ============ USAGE & QUOTA ERRORS ============
    error InsufficientUsageQuota(); // "Not enough usage quota remaining"
    error UsageQuotaExceeded(); // "Usage quota has been exceeded"
    error InvalidUsageAmount(); // "Usage amount is invalid"
    
    // ============ EMERGENCY & SAFETY ERRORS ============
    error EmergencyStop(); // "Emergency stop is activated"
    error UnsafeOperation(); // "Operation is not safe to execute"
    error SecurityViolation(); // "Security violation detected"
    error SuspiciousActivity(); // "Suspicious activity detected"
}