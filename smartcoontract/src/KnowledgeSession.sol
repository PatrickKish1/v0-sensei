// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SenseiRegistry} from "./SenseiRegistry.sol";
import {SenseiToken} from "./SenseiToken.sol";
import {LessonNFT} from "./LessonNFT.sol";

contract KnowledgeSession is Ownable, ReentrancyGuard {
    
    uint256 private _nextSessionId = 1;
    
    // Contract references
    SenseiRegistry public senseiRegistry;
    SenseiToken public senseiToken;
    LessonNFT public lessonNFT;
    
    // Session states
    enum SessionState {
        PENDING,
        ACCEPTED,
        DECLINED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
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
        uint256 proposedPrice;
        SessionState state;
        uint256 bookingTime;
        uint256 startTime;
        uint256 endTime;
        uint256 knowledgeValue;
        bool isPaid;
        bool isRated;
        uint256 lessonQuality; // Quality rating given by sensei
    }
    
    // Mappings
    mapping(uint256 => Session) public sessions;
    mapping(uint256 => uint256[]) public senseiSessions; // senseiId => sessionIds[]
    mapping(address => uint256[]) public studentSessions; // studentAddress => sessionIds[]
    
    // Platform fees
    uint256 public platformFeePercentage = 5; // 5%
    uint256 public minSessionDuration = 30; // 30 minutes
    uint256 public maxSessionDuration = 480; // 8 hours
    
    // Events
    event SessionBooked(uint256 indexed sessionId, uint256 indexed senseiId, address indexed studentAddress, uint256 price);
    event SessionAccepted(uint256 indexed sessionId, uint256 indexed senseiId);
    event SessionDeclined(uint256 indexed sessionId, uint256 indexed senseiId);
    event SessionStarted(uint256 indexed sessionId, uint256 indexed senseiId);
    event SessionCompleted(uint256 indexed sessionId, uint256 indexed senseiId, uint256 knowledgeValue, uint256 lessonQuality);
    event SessionCancelled(uint256 indexed sessionId, uint256 indexed senseiId);
    event SessionRated(uint256 indexed sessionId, uint256 indexed senseiId, uint256 rating);
    
    modifier onlySensei(uint256 sessionId) {
        require(sessions[sessionId].senseiId > 0, "Session does not exist");
        uint256 senseiId = sessions[sessionId].senseiId;
        address senseiAddress = senseiRegistry.getSenseiProfile(senseiId).senseiAddress;
        require(msg.sender == senseiAddress, "Only the sensei can perform this action");
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
        senseiRegistry = SenseiRegistry(_senseiRegistry);
        senseiToken = SenseiToken(payable(_senseiToken));
        lessonNFT = LessonNFT(_lessonNFT);
    }
    
    /**
     * @dev Books a knowledge session with a sensei
     * @param senseiId ID of the sensei
     * @param subject Subject of the session
     * @param sessionTitle Title of the session
     * @param sessionDescription Description of the session
     * @param duration Duration in minutes
     * @param proposedPrice Proposed price for the session
     */
    function bookSession(
        uint256 senseiId,
        string memory subject,
        string memory sessionTitle,
        string memory sessionDescription,
        uint256 duration,
        uint256 proposedPrice
    ) external payable nonReentrant returns (uint256) {
        require(senseiId > 0, "Invalid sensei ID");
        require(bytes(subject).length > 0, "Subject cannot be empty");
        require(bytes(sessionTitle).length > 0, "Session title cannot be empty");
        require(duration >= minSessionDuration, "Duration too short");
        require(duration <= maxSessionDuration, "Duration too long");
        require(proposedPrice > 0, "Price must be positive");
        require(msg.value == proposedPrice, "Incorrect payment amount");
        
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
            price: proposedPrice,
            proposedPrice: proposedPrice,
            state: SessionState.PENDING,
            bookingTime: block.timestamp,
            startTime: 0,
            endTime: 0,
            knowledgeValue: 0,
            isPaid: false,
            isRated: false,
            lessonQuality: 0
        });
        
        // Add to sensei and student session lists
        senseiSessions[senseiId].push(newSessionId);
        studentSessions[msg.sender].push(newSessionId);
        
        emit SessionBooked(newSessionId, senseiId, msg.sender, proposedPrice);
        return newSessionId;
    }
    
    /**
     * @dev Sensei accepts a session
     * @param sessionId ID of the session to accept
     */
    function acceptSession(uint256 sessionId) external onlySensei(sessionId) sessionExists(sessionId) validSessionState(sessionId, SessionState.PENDING) {
        sessions[sessionId].state = SessionState.ACCEPTED;
        emit SessionAccepted(sessionId, sessions[sessionId].senseiId);
    }
    
    /**
     * @dev Sensei declines a session
     * @param sessionId ID of the session to decline
     */
    function declineSession(uint256 sessionId) external onlySensei(sessionId) sessionExists(sessionId) validSessionState(sessionId, SessionState.PENDING) {
        Session storage session = sessions[sessionId];
        session.state = SessionState.DECLINED;
        
        // Refund the student
        payable(session.studentAddress).transfer(session.price);
        
        emit SessionDeclined(sessionId, session.senseiId);
    }
    
    /**
     * @dev Starts a session
     * @param sessionId ID of the session to start
     */
    function startSession(uint256 sessionId) external onlySensei(sessionId) sessionExists(sessionId) validSessionState(sessionId, SessionState.ACCEPTED) {
        sessions[sessionId].state = SessionState.IN_PROGRESS;
        sessions[sessionId].startTime = block.timestamp;
        emit SessionStarted(sessionId, sessions[sessionId].senseiId);
    }
    
    /**
     * @dev Completes a session and processes payment
     * @param sessionId ID of the session to complete
     * @param knowledgeValue Value of knowledge imparted
     * @param lessonQuality Quality rating of the lesson (1-10)
     */
    function completeSession(uint256 sessionId, uint256 knowledgeValue, uint256 lessonQuality) external onlySensei(sessionId) sessionExists(sessionId) validSessionState(sessionId, SessionState.IN_PROGRESS) {
        require(lessonQuality >= 1 && lessonQuality <= 10, "Lesson quality must be 1-10");
        
        Session storage session = sessions[sessionId];
        session.state = SessionState.COMPLETED;
        session.endTime = block.timestamp;
        session.knowledgeValue = knowledgeValue;
        session.lessonQuality = lessonQuality;
        session.isPaid = true;
        
        // Calculate platform fee
        uint256 platformFee = (session.price * platformFeePercentage) / 100;
        uint256 senseiPayment = session.price - platformFee;
        
        // Pay the sensei
        payable(senseiRegistry.getSenseiProfile(session.senseiId).senseiAddress).transfer(senseiPayment);
        
        // Keep platform fee in contract (can be withdrawn by owner)
        
        // Update sensei stats
        senseiRegistry.updateSessionStats(session.senseiId, 5); // Default rating of 5
        
        // Complete knowledge session in SenseiToken contract
        senseiToken.completeKnowledgeSession(
            sessionId,
            senseiRegistry.getSenseiProfile(session.senseiId).senseiAddress,
            session.studentAddress,
            session.price
        );
        
        // Create single lesson NFT for the session
        lessonNFT.createSessionNFT(
            sessionId,
            senseiRegistry.getSenseiProfile(session.senseiId).senseiAddress,
            session.studentAddress,
            session.subject,
            session.sessionTitle,
            session.sessionDescription,
            session.duration,
            session.price,
            knowledgeValue,
            false // isPublicMintable - set to false by default
        );
        
        emit SessionCompleted(sessionId, session.senseiId, knowledgeValue, lessonQuality);
    }
    
    /**
     * @dev Cancels a session (only before it starts)
     * @param sessionId ID of the session to cancel
     */
    function cancelSession(uint256 sessionId) external onlyStudent(sessionId) sessionExists(sessionId) validSessionState(sessionId, SessionState.PENDING) {
        Session storage session = sessions[sessionId];
        session.state = SessionState.CANCELLED;
        
        // Refund the student
        payable(session.studentAddress).transfer(session.price);
        
        emit SessionCancelled(sessionId, session.senseiId);
    }
    
    /**
     * @dev Rates a completed session
     * @param sessionId ID of the session to rate
     * @param rating Rating from 1-10
     */
    function rateSession(uint256 sessionId, uint256 rating) external onlyStudent(sessionId) sessionExists(sessionId) validSessionState(sessionId, SessionState.COMPLETED) {
        require(rating >= 1 && rating <= 10, "Rating must be between 1 and 10");
        require(!sessions[sessionId].isRated, "Session already rated");
        
        sessions[sessionId].isRated = true;
        
        // Update sensei rating
        senseiRegistry.updateSessionStats(sessions[sessionId].senseiId, rating);
        
        emit SessionRated(sessionId, sessions[sessionId].senseiId, rating);
    }
    
    /**
     * @dev Gets session details
     * @param sessionId ID of the session
     * @return Complete session information
     */
    function getSession(uint256 sessionId) external view returns (Session memory) {
        require(sessions[sessionId].sessionId > 0, "Session does not exist");
        return sessions[sessionId];
    }
    
    /**
     * @dev Gets all sessions for a sensei
     * @param senseiId ID of the sensei
     * @return Array of session IDs
     */
    function getSenseiSessions(uint256 senseiId) external view returns (uint256[] memory) {
        return senseiSessions[senseiId];
    }
    
    /**
     * @dev Gets all sessions for a student
     * @param studentAddress Address of the student
     * @return Array of session IDs
     */
    function getStudentSessions(address studentAddress) external view returns (uint256[] memory) {
        return studentSessions[studentAddress];
    }
    
    /**
     * @dev Gets total session count
     * @return Total number of sessions
     */
    function getTotalSessions() external view returns (uint256) {
        return _nextSessionId - 1;
    }
    
    /**
     * @dev Updates platform fee percentage (only owner)
     * @param newFeePercentage New fee percentage
     */
    function setPlatformFeePercentage(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 20, "Fee cannot exceed 20%");
        platformFeePercentage = newFeePercentage;
    }
    
    /**
     * @dev Updates session duration limits (only owner)
     * @param newMinDuration New minimum duration
     * @param newMaxDuration New maximum duration
     */
    function setSessionDurationLimits(uint256 newMinDuration, uint256 newMaxDuration) external onlyOwner {
        require(newMinDuration > 0, "Minimum duration must be positive");
        require(newMaxDuration > newMinDuration, "Maximum duration must be greater than minimum");
        minSessionDuration = newMinDuration;
        maxSessionDuration = newMaxDuration;
    }
    
    /**
     * @dev Withdraws platform fees (only owner)
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Updates contract references (only owner)
     */
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
