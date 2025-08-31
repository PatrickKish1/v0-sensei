// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SenseiRegistry} from "./SenseiRegistry.sol";
import {SenseiToken} from "./SenseiToken.sol";
import {LessonNFT} from "./LessonNFT.sol";
import {Constants} from "./libraries/Constants.sol";
import {Errors} from "./libraries/Errors.sol";
import {Events} from "./libraries/Events.sol";
import {DataTypes} from "./libraries/DataTypes.sol";

/**
 * @title BookingSystem - Decentralized Lesson Booking Platform
 * @notice Allows students to book lessons with senseis using ETH or any ERC20 token
 * @dev Students don't need to register - anyone can book and pay with any token
 */
contract BookingSystem is Ownable, ReentrancyGuard {
    
    uint256 private _nextSessionId = 1;
    
    // Contract references
    SenseiRegistry public senseiRegistry;
    SenseiToken public senseiToken;
    LessonNFT public lessonNFT;
    
    // Session states
    enum SessionState {
        PENDING,        // Waiting for sensei to accept/decline
        ACCEPTED,       // Sensei accepted, session can start
        DECLINED,       // Sensei declined, refund issued
        IN_PROGRESS,    // Session is currently happening
        COMPLETED,      // Session completed successfully
        CANCELLED,      // Student cancelled before acceptance
        DISPUTED        // Disputed session (requires admin intervention)
    }
    
    // Payment methods
    enum PaymentMethod {
        ETH,            // Payment in ETH
        ERC20_TOKEN     // Payment in any ERC20 token
    }
    
    struct Session {
        uint256 sessionId;
        uint256 senseiId;
        address studentAddress;
        string subject;
        string sessionTitle;
        string sessionDescription;
        uint256 duration; // in minutes
        uint256 price;
        PaymentMethod paymentMethod;
        address paymentToken; // Address of ERC20 token used for payment (address(0) for ETH)
        SessionState state;
        uint256 bookingTime;
        uint256 startTime;
        uint256 endTime;
        uint256 knowledgeValue; // Assessed by sensei
        bool isPaid;
        bool isRated;
        uint256 studentRating; // Student's rating of the session (1-10)
        uint256 senseiRating; // Sensei's rating of the student (1-10)
        bool nftMintable; // Whether student wants NFT to be mintable by others
        uint256 lessonNFTId; // ID of the created lesson NFT
    }
    
    // Mappings
    mapping(uint256 => Session) public sessions;
    mapping(uint256 => uint256[]) public senseiSessions; // senseiId => sessionIds[]
    mapping(address => uint256[]) public studentSessions; // studentAddress => sessionIds[]
    
    // Platform configuration
    uint256 public platformFeePercentage = 5; // 5% platform fee
    uint256 public minSessionDuration = 15; // 15 minutes minimum
    uint256 public maxSessionDuration = 480; // 8 hours maximum
    uint256 public sessionTimeout = 24 hours; // Auto-decline after 24 hours
    
    // Events
    event SessionBooked(
        uint256 indexed sessionId, 
        uint256 indexed senseiId, 
        address indexed studentAddress, 
        uint256 price, 
        PaymentMethod paymentMethod,
        address paymentToken
    );
    event SessionAccepted(uint256 indexed sessionId, uint256 indexed senseiId);
    event SessionDeclined(uint256 indexed sessionId, uint256 indexed senseiId);
    event SessionStarted(uint256 indexed sessionId, uint256 indexed senseiId);
    event SessionCompleted(
        uint256 indexed sessionId, 
        uint256 indexed senseiId, 
        uint256 knowledgeValue, 
        bool nftMintable
    );
    event SessionCancelled(uint256 indexed sessionId, address indexed by);
    event SessionRated(uint256 indexed sessionId, address indexed rater, uint256 rating);
    event PaymentRefunded(uint256 indexed sessionId, address indexed student, uint256 amount);
    
    modifier onlySensei(uint256 sessionId) {
        require(sessions[sessionId].sessionId > 0, "Session does not exist");
        uint256 senseiId = sessions[sessionId].senseiId;
        SenseiRegistry.SenseiProfile memory profile = senseiRegistry.getSenseiProfile(senseiId);
        require(msg.sender == profile.senseiAddress, "Only the sensei can perform this action");
        _;
    }
    
    modifier onlyStudent(uint256 sessionId) {
        require(sessions[sessionId].studentAddress == msg.sender, "Only the student can perform this action");
        _;
    }
    
    modifier sessionExists(uint256 sessionId) {
        require(sessions[sessionId].sessionId > 0, "Session does not exist");
        _;
    }
    
    modifier validSessionState(uint256 sessionId, SessionState expectedState) {
        require(sessions[sessionId].state == expectedState, "Invalid session state");
        _;
    }
    
    constructor(
        address _senseiRegistry,
        address _senseiToken,
        address _lessonNFT
    ) Ownable(msg.sender) {
        require(_senseiRegistry != address(0), "Invalid registry address");
        require(_senseiToken != address(0), "Invalid token address");
        require(_lessonNFT != address(0), "Invalid NFT address");
        
        senseiRegistry = SenseiRegistry(_senseiRegistry);
        senseiToken = SenseiToken(payable(_senseiToken));
        lessonNFT = LessonNFT(_lessonNFT);
    }
    
    /**
     * @dev Books a lesson session with a sensei using ETH
     * @param senseiId ID of the sensei
     * @param subject Subject of the lesson
     * @param sessionTitle Title of the session
     * @param sessionDescription Description of what student wants to learn
     * @param duration Duration in minutes
     * @param nftMintable Whether student wants the lesson NFT to be mintable by others
     */
    function bookSessionWithETH(
        uint256 senseiId,
        string memory subject,
        string memory sessionTitle,
        string memory sessionDescription,
        uint256 duration,
        bool nftMintable
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Payment required");
        
        return _bookSession(
            senseiId,
            subject,
            sessionTitle,
            sessionDescription,
            duration,
            nftMintable,
            msg.value,
            PaymentMethod.ETH,
            address(0) // ETH uses address(0)
        );
    }
    
    /**
     * @dev Books a lesson session with a sensei using any ERC20 token
     * @param senseiId ID of the sensei
     * @param subject Subject of the lesson
     * @param sessionTitle Title of the session
     * @param sessionDescription Description of what student wants to learn
     * @param duration Duration in minutes
     * @param tokenAmount Amount of tokens to pay
     * @param paymentToken Address of the ERC20 token to use for payment
     * @param nftMintable Whether student wants the lesson NFT to be mintable by others
     */
    function bookSessionWithToken(
        uint256 senseiId,
        string memory subject,
        string memory sessionTitle,
        string memory sessionDescription,
        uint256 duration,
        uint256 tokenAmount,
        address paymentToken,
        bool nftMintable
    ) external nonReentrant returns (uint256) {
        require(paymentToken != address(0), "Invalid token address");
        require(tokenAmount > 0, "Payment required");
        require(IERC20(paymentToken).balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        
        // Transfer tokens to this contract for escrow
        require(IERC20(paymentToken).transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");
        
        return _bookSession(
            senseiId,
            subject,
            sessionTitle,
            sessionDescription,
            duration,
            nftMintable,
            tokenAmount,
            PaymentMethod.ERC20_TOKEN,
            paymentToken
        );
    }
    
    /**
     * @dev Books a lesson session with a sensei using SenseiTokens (legacy function)
     * @param senseiId ID of the sensei
     * @param subject Subject of the lesson
     * @param sessionTitle Title of the session
     * @param sessionDescription Description of what student wants to learn
     * @param duration Duration in minutes
     * @param tokenAmount Amount of SenseiTokens to pay
     * @param nftMintable Whether student wants the lesson NFT to be mintable by others
     */
    function bookSessionWithTokens(
        uint256 senseiId,
        string memory subject,
        string memory sessionTitle,
        string memory sessionDescription,
        uint256 duration,
        uint256 tokenAmount,
        bool nftMintable
    ) external nonReentrant returns (uint256) {
        // This is for booking with SenseiTokens specifically
        require(senseiToken.balanceOf(msg.sender) >= tokenAmount, "Insufficient SenseiToken balance");
        require(senseiToken.transferFrom(msg.sender, address(this), tokenAmount), "SenseiToken transfer failed");
        
        return _bookSession(
            senseiId,
            subject,
            sessionTitle,
            sessionDescription,
            duration,
            nftMintable,
            tokenAmount,
            PaymentMethod.ERC20_TOKEN,
            address(senseiToken)
        );
    }
    
    /**
     * @dev Internal function to handle common booking logic
     * @param senseiId ID of the sensei
     * @param subject Subject of the lesson
     * @param sessionTitle Title of the session
     * @param sessionDescription Description of what student wants to learn
     * @param duration Duration in minutes
     * @param nftMintable Whether student wants the lesson NFT to be mintable by others
     * @param amount Payment amount
     * @param paymentMethod Payment method (ETH or ERC20_TOKEN)
     * @param paymentToken Address of payment token (address(0) for ETH)
     */
    function _bookSession(
        uint256 senseiId,
        string memory subject,
        string memory sessionTitle,
        string memory sessionDescription,
        uint256 duration,
        bool nftMintable,
        uint256 amount,
        PaymentMethod paymentMethod,
        address paymentToken
    ) internal returns (uint256) {
        require(senseiId > 0, "Invalid sensei ID");
        require(bytes(subject).length > 0, "Subject cannot be empty");
        require(bytes(sessionTitle).length > 0, "Session title cannot be empty");
        require(duration >= minSessionDuration, "Duration too short");
        require(duration <= maxSessionDuration, "Duration too long");
        require(amount > 0, "Payment required");
        
        // Check if sensei exists and is active
        SenseiRegistry.SenseiProfile memory profile = senseiRegistry.getSenseiProfile(senseiId);
        require(profile.senseiAddress != address(0), "Sensei does not exist");
        require(profile.isActive, "Sensei is not active");
        
        uint256 newSessionId = _nextSessionId++;
        
        sessions[newSessionId] = Session({
            sessionId: newSessionId,
            senseiId: senseiId,
            studentAddress: msg.sender,
            subject: subject,
            sessionTitle: sessionTitle,
            sessionDescription: sessionDescription,
            duration: duration,
            price: amount,
            paymentMethod: paymentMethod,
            paymentToken: paymentToken,
            state: SessionState.PENDING,
            bookingTime: block.timestamp,
            startTime: 0,
            endTime: 0,
            knowledgeValue: 0,
            isPaid: false,
            isRated: false,
            studentRating: 0,
            senseiRating: 0,
            nftMintable: nftMintable,
            lessonNFTId: 0
        });
        
        // Add to tracking mappings
        senseiSessions[senseiId].push(newSessionId);
        studentSessions[msg.sender].push(newSessionId);
        
        emit SessionBooked(newSessionId, senseiId, msg.sender, amount, paymentMethod, paymentToken);
        
        return newSessionId;
    }
    
    /**
     * @dev Sensei accepts a session booking
     * @param sessionId ID of the session to accept
     */
    function acceptSession(uint256 sessionId) 
        external 
        onlySensei(sessionId) 
        sessionExists(sessionId) 
        validSessionState(sessionId, SessionState.PENDING) 
    {
        sessions[sessionId].state = SessionState.ACCEPTED;
        emit SessionAccepted(sessionId, sessions[sessionId].senseiId);
    }
    
    /**
     * @dev Sensei declines a session booking
     * @param sessionId ID of the session to decline
     */
    function declineSession(uint256 sessionId) 
        external 
        onlySensei(sessionId) 
        sessionExists(sessionId) 
        validSessionState(sessionId, SessionState.PENDING) 
    {
        Session storage session = sessions[sessionId];
        session.state = SessionState.DECLINED;
        
        _refundPayment(session);
        
        emit SessionDeclined(sessionId, session.senseiId);
    }
    
    /**
     * @dev Starts an accepted session
     * @param sessionId ID of the session to start
     */
    function startSession(uint256 sessionId) 
        external 
        onlySensei(sessionId) 
        sessionExists(sessionId) 
        validSessionState(sessionId, SessionState.ACCEPTED) 
    {
        sessions[sessionId].state = SessionState.IN_PROGRESS;
        sessions[sessionId].startTime = block.timestamp;
        emit SessionStarted(sessionId, sessions[sessionId].senseiId);
    }
    
    /**
     * @dev Completes a session and processes payment
     * @param sessionId ID of the session to complete
     * @param knowledgeValue Assessed value of knowledge shared (1-100)
     */
    function completeSession(uint256 sessionId, uint256 knowledgeValue) 
        external 
        onlySensei(sessionId) 
        sessionExists(sessionId) 
        validSessionState(sessionId, SessionState.IN_PROGRESS) 
    {
        require(knowledgeValue >= 1 && knowledgeValue <= 100, "Knowledge value must be 1-100");
        
        Session storage session = sessions[sessionId];
        session.state = SessionState.COMPLETED;
        session.endTime = block.timestamp;
        session.knowledgeValue = knowledgeValue;
        session.isPaid = true;
        
        // Process payment to SenseiToken (feeds the economy!)
        _processPaymentToSenseiToken(session);
        
        // Create lesson NFT
        uint256 nftId = lessonNFT.createSessionNFT(
            sessionId,
            senseiRegistry.getSenseiProfile(session.senseiId).senseiAddress,
            session.studentAddress,
            session.subject,
            session.sessionTitle,
            session.sessionDescription,
            session.duration,
            session.price,
            knowledgeValue,
            session.nftMintable
        );
        
        session.lessonNFTId = nftId;
        
        // Update sensei stats
        senseiRegistry.updateSessionStats(session.senseiId, 8); // Default rating
        senseiRegistry.recordKnowledgeContribution(session.senseiId, knowledgeValue);
        
        // Record knowledge session in SenseiToken
        senseiToken.completeKnowledgeSession(
            sessionId,
            senseiRegistry.getSenseiProfile(session.senseiId).senseiAddress,
            session.studentAddress,
            session.price
        );
        
        emit SessionCompleted(sessionId, session.senseiId, knowledgeValue, session.nftMintable);
    }
    
    /**
     * @dev Student cancels a pending session
     * @param sessionId ID of the session to cancel
     */
    function cancelSession(uint256 sessionId) 
        external 
        onlyStudent(sessionId) 
        sessionExists(sessionId) 
        validSessionState(sessionId, SessionState.PENDING) 
    {
        Session storage session = sessions[sessionId];
        session.state = SessionState.CANCELLED;
        
        _refundPayment(session);
        
        emit SessionCancelled(sessionId, msg.sender);
    }
    
    /**
     * @dev Student rates a completed session
     * @param sessionId ID of the session to rate
     * @param rating Rating from 1-9 (because 10 is too perfect, ya know?)
     * @param feedback Optional feedback text
     */
    function rateSession(uint256 sessionId, uint256 rating, string calldata feedback) 
        external 
        onlyStudent(sessionId) 
        sessionExists(sessionId) 
        validSessionState(sessionId, SessionState.COMPLETED) 
    {
        if (rating < Constants.MIN_RATING || rating > Constants.MAX_RATING) {
            revert Errors.InvalidRating();
        }
        if (sessions[sessionId].isRated) {
            revert Errors.AlreadyRated();
        }
        
        sessions[sessionId].studentRating = rating;
        sessions[sessionId].isRated = true;
        
        // Update sensei rating in registry (4 + student_rating gives fair average)
        uint256 senseiCurrentRating = Constants.DEFAULT_SENSEI_RATING; // 4
        uint256 averageRating = (senseiCurrentRating + rating) / 2;
        senseiRegistry.updateSessionStats(sessions[sessionId].senseiId, averageRating);
        
        emit SessionRated(sessionId, msg.sender, rating);
    }
    
    /**
     * @dev Sensei rates a student (optional)
     * @param sessionId ID of the session
     * @param rating Rating from 1-10
     */
    function rateStudent(uint256 sessionId, uint256 rating) 
        external 
        onlySensei(sessionId) 
        sessionExists(sessionId) 
        validSessionState(sessionId, SessionState.COMPLETED) 
    {
        require(rating >= 1 && rating <= 10, "Rating must be between 1 and 10");
        require(sessions[sessionId].senseiRating == 0, "Already rated");
        
        sessions[sessionId].senseiRating = rating;
        
        emit SessionRated(sessionId, msg.sender, rating);
    }
    
    /**
     * @dev Auto-decline expired sessions (can be called by anyone)
     * @param sessionId ID of the session to auto-decline
     */
    function autoDeclineExpiredSession(uint256 sessionId) 
        external 
        sessionExists(sessionId) 
        validSessionState(sessionId, SessionState.PENDING) 
    {
        Session storage session = sessions[sessionId];
        require(block.timestamp >= session.bookingTime + sessionTimeout, "Session not expired yet");
        
        session.state = SessionState.DECLINED;
        _refundPayment(session);
        
        emit SessionDeclined(sessionId, session.senseiId);
    }
    
    /**
     * @dev Internal function to process payment - money goes to SenseiToken for minting
     * @param session Session struct
     * The payment doesn't go to sensei directly - it goes to SenseiToken to mint tokens
     * This feeds the floating stablecoin economy, senseis withdraw by burning tokens later
     */
    function _processPaymentToSenseiToken(Session storage session) internal {
        SenseiRegistry.SenseiProfile memory profile = senseiRegistry.getSenseiProfile(session.senseiId);
        
        if (session.paymentMethod == PaymentMethod.ETH) {
            // Send ETH to SenseiToken contract to increase backing value
            (bool success, ) = address(senseiToken).call{value: session.price}("");
            require(success, "ETH transfer to SenseiToken failed");
        } else {
            // Transfer ERC20 tokens to SenseiToken contract
            require(IERC20(session.paymentToken).transfer(address(senseiToken), session.price), "Token transfer to SenseiToken failed");
        }
        
        // Record the knowledge session completion - this mints tokens and updates sensei earnings
        senseiToken.completeKnowledgeSession(
            session.sessionId,
            profile.senseiAddress,
            session.studentAddress, 
            session.price
        );
        
        // Update sensei earnings in registry (for tracking purposes)
        senseiRegistry.updateEarnings(session.senseiId, session.price);
    }
    
    /**
     * @dev Internal function to refund payment to student
     * @param session Session struct
     */
    function _refundPayment(Session storage session) internal {
        if (session.paymentMethod == PaymentMethod.ETH) {
            payable(session.studentAddress).transfer(session.price);
        } else {
            require(IERC20(session.paymentToken).transfer(session.studentAddress, session.price), "Refund transfer failed");
        }
        
        emit PaymentRefunded(session.sessionId, session.studentAddress, session.price);
    }
    
    // View functions
    function getSession(uint256 sessionId) external view returns (Session memory) {
        require(sessions[sessionId].sessionId > 0, "Session does not exist");
        return sessions[sessionId];
    }
    
    function getSenseiSessions(uint256 senseiId) external view returns (uint256[] memory) {
        return senseiSessions[senseiId];
    }
    
    function getStudentSessions(address studentAddress) external view returns (uint256[] memory) {
        return studentSessions[studentAddress];
    }
    
    function getTotalSessions() external view returns (uint256) {
        return _nextSessionId - 1;
    }
    
    // Admin functions
    function setPlatformFeePercentage(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 10, "Fee cannot exceed 10%");
        platformFeePercentage = newFeePercentage;
    }
    
    function setSessionDurationLimits(uint256 newMinDuration, uint256 newMaxDuration) external onlyOwner {
        require(newMinDuration > 0, "Minimum duration must be positive");
        require(newMaxDuration > newMinDuration, "Maximum duration must be greater than minimum");
        minSessionDuration = newMinDuration;
        maxSessionDuration = newMaxDuration;
    }
    
    function setSessionTimeout(uint256 newTimeout) external onlyOwner {
        require(newTimeout >= 1 hours, "Timeout must be at least 1 hour");
        sessionTimeout = newTimeout;
    }
    
    function withdrawPlatformFees() external onlyOwner {
        uint256 ethBalance = address(this).balance;
        
        if (ethBalance > 0) {
            payable(owner()).transfer(ethBalance);
        }
    }
    
    /**
     * @dev Withdraw platform fees for a specific ERC20 token
     * @param tokenAddress Address of the ERC20 token to withdraw
     */
    function withdrawTokenFees(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        
        IERC20 token = IERC20(tokenAddress);
        uint256 tokenBalance = token.balanceOf(address(this));
        
        if (tokenBalance > 0) {
            require(token.transfer(owner(), tokenBalance), "Token withdrawal failed");
        }
    }
    
    function setContracts(
        address _senseiRegistry,
        address _senseiToken,
        address _lessonNFT
    ) external onlyOwner {
        if (_senseiRegistry != address(0)) senseiRegistry = SenseiRegistry(_senseiRegistry);
        if (_senseiToken != address(0)) senseiToken = SenseiToken(payable(_senseiToken));
        if (_lessonNFT != address(0)) lessonNFT = LessonNFT(_lessonNFT);
    }
}
