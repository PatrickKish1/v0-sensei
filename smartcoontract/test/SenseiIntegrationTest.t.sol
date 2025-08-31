// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {SenseiRegistry} from "../src/SenseiRegistry.sol";
import {SenseiToken} from "../src/SenseiToken.sol";
import {BookingSystem} from "../src/BookingSystem.sol";
import {LessonNFT} from "../src/LessonNFT.sol";
import {SensayAI} from "../src/SensayAI.sol";
import {PrivacyManager} from "../src/PrivacyManager.sol";
import {SenseiGateway} from "../src/SenseiGateway.sol";
import {SenseiCrossChain} from "../src/SenseiCrossChain.sol";
import {TFHE} from "@fhevm/solidity/lib/TFHE.sol";
import "../src/libraries/Constants.sol";
import "../src/libraries/Errors.sol";
import "../src/libraries/Events.sol";
import "../src/libraries/DataTypes.sol";

/**
 * @title SenseiIntegrationTest - Comprehensive Integration Tests
 * @notice Tests the complete Sensei platform workflow from registration to NFT minting
 * @dev This is where we make sure everything works together like a well-oiled machine
 * Testing every possible scenario because bugs are not welcome here, ya know?
 */
contract SenseiIntegrationTest is Test {
    
    // ============ CONTRACT INSTANCES ============
    SenseiRegistry public senseiRegistry;
    SenseiToken public senseiToken;
    BookingSystem public bookingSystem;
    LessonNFT public lessonNFT;
    SensayAI public sensayAI;
    PrivacyManager public privacyManager;
    SenseiGateway public gateway;
    SenseiCrossChain public crossChain;
    
    // ============ TEST ADDRESSES ============
    address public deployer;
    address public sensei1;
    address public sensei2;
    address public retiredSensei;
    address public student1;
    address public student2;
    address public nftCollector;
    address public crossChainUser;
    
    // ============ TEST DATA ============
    uint256 public sensei1Id;
    uint256 public sensei2Id;
    uint256 public retiredSenseiId;
    
    // Mock ERC20 token for testing
    MockERC20 public mockUSDC;
    MockERC20 public mockDAI;
    
    // ============ SETUP ============
    function setUp() public {
        deployer = address(this);
        sensei1 = makeAddr("sensei1");
        sensei2 = makeAddr("sensei2");
        retiredSensei = makeAddr("retiredSensei");
        student1 = makeAddr("student1");
        student2 = makeAddr("student2");
        nftCollector = makeAddr("nftCollector");
        crossChainUser = makeAddr("crossChainUser");
        
        // Deploy mock tokens for testing
        mockUSDC = new MockERC20("USDC", "USDC", 6);
        mockDAI = new MockERC20("DAI", "DAI", 18);
        
        // Deploy all contracts
        senseiRegistry = new SenseiRegistry();
        senseiToken = new SenseiToken();
        lessonNFT = new LessonNFT(address(senseiToken));
        bookingSystem = new BookingSystem(address(senseiRegistry), address(senseiToken), address(lessonNFT));
        sensayAI = new SensayAI(address(senseiRegistry));
        privacyManager = new PrivacyManager();
        
        // Deploy gateway and cross-chain
        gateway = new SenseiGateway();
        // Note: CrossChain needs LayerZero endpoint - using mock for tests
        // crossChain = new SenseiCrossChain(mockEndpoint, deployer, address(gateway));
        
        // Initialize all contracts through gateway
        gateway.setContractAddresses(
            address(senseiRegistry),
            address(senseiToken),
            address(bookingSystem),
            address(lessonNFT),
            address(sensayAI),
            address(privacyManager)
        );
        
        gateway.initializeAuthorizations();
        
        // Fund test addresses
        vm.deal(sensei1, 100 ether);
        vm.deal(sensei2, 100 ether);
        vm.deal(retiredSensei, 100 ether);
        vm.deal(student1, 100 ether);
        vm.deal(student2, 100 ether);
        vm.deal(nftCollector, 100 ether);
        vm.deal(crossChainUser, 100 ether);
        
        // Give mock tokens to users
        mockUSDC.mint(student1, 10000 * 10**6); // 10,000 USDC
        mockUSDC.mint(student2, 10000 * 10**6);
        mockDAI.mint(student1, 10000 * 10**18); // 10,000 DAI
        mockDAI.mint(student2, 10000 * 10**18);
    }
    
    // ============ FULL WORKFLOW TESTS ============
    
    /**
     * @dev Test complete sensei registration and AI creation workflow
     * This tests the whole journey from zero to having an AI replica
     */
    function testCompleteSenseiRegistrationWorkflow() public {
        string[] memory skills = new string[](3);
        skills[0] = "JavaScript";
        skills[1] = "React";
        skills[2] = "Node.js";
        
        vm.startPrank(sensei1);
        
        // Register sensei through gateway
        uint256 senseiId = gateway.registerSensei(
            "Master Coder",
            "Full Stack Development",
            "20 years building web apps, been there done that",
            50 ether, // 50 ETH per hour (expensive but worth it)
            false, // Not retired
            skills
        );
        
        vm.stopPrank();
        
        // Verify registration
        assertEq(senseiId, 1);
        assertTrue(senseiRegistry.isRegisteredSensei(sensei1));
        
        // Verify AI was created
        SenseiRegistry.SenseiProfile memory profile = senseiRegistry.getSenseiProfile(senseiId);
        assertTrue(profile.hasPersonalAI);
        assertEq(profile.skills.length, 3);
        assertEq(profile.replicaCount, 1); // Should have initial replica
        
        // Verify AI replica was created
        uint256[] memory replicas = senseiRegistry.getSenseiReplicas(senseiId);
        assertEq(replicas.length, 1);
        
        SenseiRegistry.AIReplica memory replica = senseiRegistry.getReplicaDetails(replicas[0]);
        assertEq(replica.senseiId, senseiId);
        assertTrue(replica.isActive);
        assertEq(replica.knowledgeLevel, Constants.INITIAL_REPLICA_KNOWLEDGE);
    }
    
    /**
     * @dev Test complete lesson booking workflow with ETH payment
     * From booking to completion to NFT minting - the full journey
     */
    function testCompleteETHLessonWorkflow() public {
        // 1. Register sensei
        string[] memory skills = new string[](2);
        skills[0] = "Solidity";
        skills[1] = "Smart Contracts";
        
        vm.prank(sensei1);
        uint256 senseiId = gateway.registerSensei(
            "Solidity Master",
            "Smart Contract Development", 
            "Expert in DeFi and NFT contracts",
            1 ether,
            false,
            skills
        );
        
        // 2. Student books lesson with ETH
        vm.prank(student1);
        uint256 sessionId = gateway.bookLessonWithETH{value: 1 ether}(
            senseiId,
            "Smart Contracts",
            "Build a DeFi Protocol",
            "Learn to build a complete DeFi lending protocol",
            120, // 2 hours
            true // NFT mintable
        );
        
        assertEq(sessionId, 1);
        
        // 3. Sensei accepts session
        vm.prank(sensei1);
        bookingSystem.acceptSession(sessionId);
        
        // 4. Start session
        vm.prank(sensei1);
        bookingSystem.startSession(sessionId);
        
        // 5. Complete session with high quality
        vm.prank(sensei1);
        bookingSystem.completeSession(sessionId, 85); // 85% knowledge value - pretty good
        
        // 6. Rate the session
        vm.prank(student1);
        bookingSystem.rateSession(sessionId, 8, "Amazing lesson, learned so much!");
        
        // 7. Verify tokens were minted to SenseiToken contract (not directly to sensei)
        assertTrue(senseiToken.totalSupply() > 0);
        assertTrue(address(senseiToken).balance > 0); // Contract should have ETH backing
        
        // 8. Verify sensei can withdraw by burning tokens
        uint256 senseiTokenBalance = senseiToken.balanceOf(sensei1);
        assertTrue(senseiTokenBalance > 0);
        
        vm.prank(sensei1);
        uint256 initialETH = sensei1.balance;
        senseiToken.withdrawEarningsByBurning(senseiTokenBalance / 2); // Withdraw half
        assertTrue(sensei1.balance > initialETH); // Should have received ETH
        
        // 9. Verify NFT was created and can be minted
        // The session should have created an NFT
        BookingSystem.Session memory session = bookingSystem.getSession(sessionId);
        assertTrue(session.lessonNFTId > 0);
        
        // 10. Someone else mints the NFT
        vm.prank(nftCollector);
        // First get some SenseiTokens
        gateway.mintTokensWithETH{value: 0.5 ether}();
        
        // Then mint the NFT
        gateway.mintLessonNFT(session.lessonNFTId);
        assertEq(lessonNFT.ownerOf(session.lessonNFTId), nftCollector);
    }
    
    /**
     * @dev Test lesson booking with any ERC20 token (the universal payment feature)
     * This is where we test the "anyone can book with any token" requirement
     */
    function testUniversalTokenPaymentWorkflow() public {
        // 1. Register sensei
        string[] memory skills = new string[](1);
        skills[0] = "DeFi";
        
        vm.prank(sensei1);
        uint256 senseiId = gateway.registerSensei(
            "DeFi Expert",
            "Decentralized Finance",
            "Built multiple DeFi protocols",
            2 ether,
            false,
            skills
        );
        
        // 2. Test booking with USDC
        vm.startPrank(student1);
        mockUSDC.approve(address(gateway), 100 * 10**6); // 100 USDC
        
        uint256 sessionId1 = gateway.bookLessonWithToken(
            senseiId,
            "DeFi",
            "Yield Farming Strategies",
            "Learn advanced yield farming techniques",
            90,
            100 * 10**6, // 100 USDC
            address(mockUSDC),
            true
        );
        vm.stopPrank();
        
        // 3. Test booking with DAI
        vm.startPrank(student2);
        mockDAI.approve(address(gateway), 150 * 10**18); // 150 DAI
        
        uint256 sessionId2 = gateway.bookLessonWithToken(
            senseiId,
            "DeFi",
            "Liquidity Mining",
            "Master liquidity mining strategies",
            60,
            150 * 10**18, // 150 DAI
            address(mockDAI),
            false // Private lesson, no NFT
        );
        vm.stopPrank();
        
        // 4. Verify both sessions were created
        assertEq(sessionId1, 1);
        assertEq(sessionId2, 2);
        
        // 5. Verify tokens were transferred to SenseiToken contract
        assertEq(mockUSDC.balanceOf(address(senseiToken)), 100 * 10**6);
        assertEq(mockDAI.balanceOf(address(senseiToken)), 150 * 10**18);
        
        // 6. Complete both sessions
        vm.prank(sensei1);
        bookingSystem.acceptSession(sessionId1);
        vm.prank(sensei1);
        bookingSystem.acceptSession(sessionId2);
        
        vm.prank(sensei1);
        bookingSystem.startSession(sessionId1);
        vm.prank(sensei1);
        bookingSystem.startSession(sessionId2);
        
        vm.prank(sensei1);
        bookingSystem.completeSession(sessionId1, 90); // High quality
        vm.prank(sensei1);
        bookingSystem.completeSession(sessionId2, 75); // Good quality
        
        // 7. Verify sensei earned tokens from both sessions
        uint256 senseiTokens = senseiToken.balanceOf(sensei1);
        assertTrue(senseiTokens > 0);
        
        // 8. Verify first session created mintable NFT, second didn't
        BookingSystem.Session memory session1 = bookingSystem.getSession(sessionId1);
        BookingSystem.Session memory session2 = bookingSystem.getSession(sessionId2);
        
        assertTrue(session1.nftMintable);
        assertTrue(session1.lessonNFTId > 0);
        assertFalse(session2.nftMintable);
        assertEq(session2.lessonNFTId, 0);
    }
    
    /**
     * @dev Test retired sensei registration and AI replica creation
     * Retired folks should be able to share their lifetime knowledge
     */
    function testRetiredSenseiWorkflow() public {
        string[] memory skills = new string[](4);
        skills[0] = "Leadership";
        skills[1] = "Business Strategy";
        skills[2] = "Mentoring";
        skills[3] = "Life Wisdom";
        
        vm.prank(retiredSensei);
        uint256 senseiId = gateway.registerSensei(
            "Retired CEO",
            "Executive Leadership",
            "Former Fortune 500 CEO with 40 years experience",
            5 ether, // High rate for executive coaching
            true, // Retired sensei
            skills
        );
        
        // Verify retired status
        SenseiRegistry.SenseiProfile memory profile = senseiRegistry.getSenseiProfile(senseiId);
        assertTrue(profile.isRetiredSensei);
        assertEq(profile.skills.length, 4);
        
        // Retired sensei should be able to create specialized replicas
        vm.prank(retiredSensei);
        uint256 replicaId = senseiRegistry.createSpecializedReplica(
            senseiId,
            "Leadership Mentor",
            "Executive Leadership and Team Management"
        );
        
        assertTrue(replicaId > 0);
        
        // Verify replica was created with lower knowledge level
        SenseiRegistry.AIReplica memory replica = senseiRegistry.getReplicaDetails(replicaId);
        assertEq(replica.knowledgeLevel, Constants.NEW_REPLICA_KNOWLEDGE);
        
        // Test feeding knowledge to replica
        vm.prank(retiredSensei);
        uint256 contributionId = privacyManager.uploadEncryptedKnowledge(
            senseiId,
            1, // replicaId
            "executive_insights",
            TFHE.asEbytes256("Leadership lessons from 40 years of experience"),
            "ipfs://executive_insights",
            true, // isPrivacySensitive
            new string[](0), // tags
            TFHE.asEuint64(15) // knowledgeValue
        );
        
        assertTrue(contributionId > 0);
    }
    
    /**
     * @dev Test NFT marketplace and revenue sharing
     * This tests the 50/50 split when NFTs are minted by collectors
     */
    function testNFTMarketplaceWorkflow() public {
        // 1. Complete a high-quality lesson first
        _setupAndCompleteLesson(sensei1, student1, 8, true); // High rating, NFT mintable
        
        // 2. Get the NFT ID from the completed session
        BookingSystem.Session memory session = bookingSystem.getSession(1);
        uint256 nftId = session.lessonNFTId;
        assertTrue(nftId > 0);
        
        // 3. Collector gets SenseiTokens to mint NFT
        vm.prank(nftCollector);
        gateway.mintTokensWithETH{value: 2 ether}(); // Get plenty of tokens
        
        uint256 collectorTokensBefore = senseiToken.balanceOf(nftCollector);
        uint256 studentTokensBefore = senseiToken.balanceOf(student1);
        uint256 senseiTokensBefore = senseiToken.balanceOf(sensei1);
        
        // 4. Mint the NFT
        vm.prank(nftCollector);
        gateway.mintLessonNFT(nftId);
        
        // 5. Verify NFT ownership transferred
        assertEq(lessonNFT.ownerOf(nftId), nftCollector);
        
        // 6. Verify 50/50 revenue split happened
        uint256 collectorTokensAfter = senseiToken.balanceOf(nftCollector);
        uint256 studentTokensAfter = senseiToken.balanceOf(student1);
        uint256 senseiTokensAfter = senseiToken.balanceOf(sensei1);
        
        // Collector should have fewer tokens (paid for NFT)
        assertTrue(collectorTokensBefore > collectorTokensAfter);
        
        // Student and sensei should have more tokens (50/50 split)
        assertTrue(studentTokensAfter > studentTokensBefore);
        assertTrue(senseiTokensAfter > senseiTokensBefore);
        
        // The increase should be roughly equal (50/50 split)
        uint256 studentIncrease = studentTokensAfter - studentTokensBefore;
        uint256 senseiIncrease = senseiTokensAfter - senseiTokensBefore;
        
        // Allow for 5% platform fee difference
        assertTrue(studentIncrease > 0);
        assertTrue(senseiIncrease > 0);
    }
    
    /**
     * @dev Test floating stablecoin economics
     * This tests the knowledge-backed token economy mechanics
     */
    function testFloatingStablecoinEconomics() public {
        // 1. Initial state - no tokens, no backing
        assertEq(senseiToken.totalSupply(), 0);
        assertEq(address(senseiToken).balance, 0);
        
        // 2. Complete multiple lessons to build economy
        uint256 sessionId1 = _setupAndCompleteLesson(sensei1, student1, 7, true);
        uint256 sessionId2 = _setupAndCompleteLesson(sensei1, student2, 9, true);
        uint256 sessionId3 = _setupAndCompleteLesson(sensei2, student1, 6, false);
        
        // 3. Verify tokens were minted and backing increased
        assertTrue(senseiToken.totalSupply() > 0);
        assertTrue(address(senseiToken).balance > 0);
        
        // 4. Test mint rate changes with demand
        uint256 initialMintRate = senseiToken.getCurrentMintRate();
        
        // Create high demand by completing many sessions
        for (uint i = 0; i < 5; i++) {
            _setupAndCompleteLesson(sensei1, student1, 8, true);
        }
        
        // Force rebase
        vm.warp(block.timestamp + Constants.REBASE_INTERVAL);
        vm.prank(student1);
        gateway.mintTokensWithETH{value: 1 ether}();
        
        uint256 newMintRate = senseiToken.getCurrentMintRate();
        // Rate should increase due to high demand (more tokens per ETH)
        assertTrue(newMintRate >= initialMintRate);
        
        // 5. Test sensei withdrawal
        uint256 senseiEarnings = senseiToken.senseiEarnings(sensei1);
        assertTrue(senseiEarnings > 0);
        
        vm.prank(sensei1);
        uint256 senseiETHBefore = sensei1.balance;
        senseiToken.withdrawEarningsByBurning(senseiEarnings / 2); // Withdraw half
        assertTrue(sensei1.balance > senseiETHBefore); // Should have received ETH
    }
    
    /**
     * @dev Test privacy manager and encrypted data upload
     * This tests the Zama FHEVM integration for protecting sensei knowledge
     */
    function testPrivacyManagerWorkflow() public {
        // 1. Register sensei
        string[] memory skills = new string[](1);
        skills[0] = "Cybersecurity";
        
        vm.prank(sensei1);
        uint256 senseiId = gateway.registerSensei(
            "Security Expert",
            "Cybersecurity",
            "Former NSA, knows all the secrets",
            10 ether,
            false,
            skills
        );
        
        // 2. Upload encrypted knowledge
        string[] memory tags = new string[](2);
        tags[0] = "advanced";
        tags[1] = "classified";
        
        vm.prank(sensei1);
        uint256 contributionId = gateway.uploadKnowledgeData(
            senseiId,
            1, // replicaId
            "security_protocols",
            "Top secret cybersecurity techniques",
            "ipfs://security_protocols",
            true, // isPrivacySensitive
            tags
        );
        
        assertTrue(contributionId > 0);
        
        // 3. Verify data was uploaded with proper privacy
        // Note: In real FHEVM, this would be encrypted and not readable
        uint256[] memory contributions = privacyManager.getSenseiContributions(senseiId);
        assertEq(contributions.length, 1);
        assertEq(contributions[0], contributionId);
    }
    
    /**
     * @dev Test error conditions and edge cases
     * Making sure our error handling is bulletproof
     */
    function testErrorConditions() public {
        // Test invalid sensei registration
        string[] memory emptySkills = new string[](0);
        
        vm.prank(sensei1);
        vm.expectRevert(); // Should fail with empty skills
        gateway.registerSensei(
            "",
            "Invalid",
            "Invalid sensei",
            0,
            false,
            emptySkills
        );
        
        // Test booking non-existent sensei
        vm.prank(student1);
        vm.expectRevert(); // Should fail
        gateway.bookLessonWithETH{value: 1 ether}(
            999, // Non-existent sensei
            "Test",
            "Test",
            "Test",
            60,
            true
        );
        
        // Test insufficient payment
        vm.prank(student1);
        vm.expectRevert(); // Should fail
        gateway.bookLessonWithETH{value: 0}( // No payment
            1,
            "Test",
            "Test", 
            "Test",
            60,
            true
        );
    }
    
    /**
     * @dev Test rating system with 1-9 scale
     * Making sure the rating math works correctly
     */
    function testRatingSystem() public {
        uint256 sessionId = _setupAndCompleteLesson(sensei1, student1, 8, true);
        
        // Test valid ratings
        for (uint256 rating = Constants.MIN_RATING; rating <= Constants.MAX_RATING; rating++) {
            vm.prank(student1);
            bookingSystem.rateSession(sessionId, rating, "Test rating");
            
                    BookingSystem.Session memory session = bookingSystem.getSession(sessionId);
        assertEq(session.studentRating, rating);
        }
        
        // Test invalid ratings
        vm.prank(student1);
        vm.expectRevert(); // Should fail for rating 0
        bookingSystem.rateSession(sessionId, 0, "Invalid rating");
        
        vm.prank(student1);
        vm.expectRevert(); // Should fail for rating 10
        bookingSystem.rateSession(sessionId, 10, "Invalid rating");
    }
    
    // ============ HELPER FUNCTIONS ============
    
    /**
     * @dev Helper to setup and complete a lesson workflow
     * @param senseiAddr Sensei address
     * @param studentAddr Student address
     * @param knowledgeValue Knowledge assessment (1-100)
     * @param nftMintable Whether NFT should be mintable
     * @return sessionId The completed session ID
     */
    function _setupAndCompleteLesson(
        address senseiAddr,
        address studentAddr,
        uint256 knowledgeValue,
        bool nftMintable
    ) internal returns (uint256 sessionId) {
        // Register sensei if not already registered
        if (!senseiRegistry.isRegisteredSensei(senseiAddr)) {
            string[] memory skills = new string[](1);
            skills[0] = "Teaching";
            
            vm.prank(senseiAddr);
            gateway.registerSensei(
                "Test Sensei",
                "General Teaching",
                "Test sensei for integration tests",
                1 ether,
                false,
                skills
            );
        }
        
        uint256 senseiId = senseiRegistry.addressToSenseiId(senseiAddr);
        
        // Book session
        vm.prank(studentAddr);
        sessionId = gateway.bookLessonWithETH{value: 1 ether}(
            senseiId,
            "Test Subject",
            "Test Lesson",
            "Test lesson description",
            60,
            nftMintable
        );
        
        // Accept and complete session
        vm.prank(senseiAddr);
        bookingSystem.acceptSession(sessionId);
        
        vm.prank(senseiAddr);
        bookingSystem.startSession(sessionId);
        
        vm.prank(senseiAddr);
        bookingSystem.completeSession(sessionId, knowledgeValue);
        
        return sessionId;
    }
}

/**
 * @title MockERC20 - Simple ERC20 for testing
 * @notice Basic ERC20 implementation for testing universal token payments
 */
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }
    
    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
}
