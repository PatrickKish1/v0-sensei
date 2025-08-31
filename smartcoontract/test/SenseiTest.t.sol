// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {SenseiRegistry} from "../src/SenseiRegistry.sol";
import {SenseiToken} from "../src/SenseiToken.sol";
import {LessonNFT} from "../src/LessonNFT.sol";
import {BookingSystem} from "../src/BookingSystem.sol";
import {SensayAI} from "../src/SensayAI.sol";
import {KnowledgeSession} from "../src/KnowledgeSession.sol";
import "../src/libraries/DataTypes.sol";

contract SenseiTest is Test {
    SenseiRegistry public senseiRegistry;
    SenseiToken public senseiToken;
    LessonNFT public lessonNFT;
    BookingSystem public bookingSystem;
    SensayAI public sensayAI;
    KnowledgeSession public knowledgeSession;
    
    address public deployer;
    address public sensei1;
    address public sensei2;
    address public student1;
    address public student2;
    
    uint256 public sensei1Id;
    uint256 public sensei2Id;
    
    function setUp() public {
        deployer = address(this);
        sensei1 = makeAddr("sensei1");
        sensei2 = makeAddr("sensei2");
        student1 = makeAddr("student1");
        student2 = makeAddr("student2");
        
        // Deploy contracts
        senseiRegistry = new SenseiRegistry();
        senseiToken = new SenseiToken();
        lessonNFT = new LessonNFT(address(senseiToken));
        bookingSystem = new BookingSystem(address(senseiRegistry), address(senseiToken), address(lessonNFT));
        sensayAI = new SensayAI(address(senseiRegistry));
        knowledgeSession = new KnowledgeSession(address(senseiRegistry), address(senseiToken), address(lessonNFT));
        
        // Set up permissions
        senseiToken.setAuthorizedMinter(address(bookingSystem), true);
        senseiToken.setAuthorizedMinter(address(knowledgeSession), true);
        senseiRegistry.setAIAgentContract(address(sensayAI));
        
        // Fund addresses
        vm.deal(sensei1, 100 ether);
        vm.deal(sensei2, 100 ether);
        vm.deal(student1, 100 ether);
        vm.deal(student2, 100 ether);
    }
    
    // ============ SenseiRegistry Tests ============
    
    function testRegisterSensei() public {
        vm.startPrank(sensei1);
        
        uint256 senseiId = senseiRegistry.registerSensei(
            "Master Yoda",
            "Jedi Training",
            "Wise Jedi Master with centuries of experience",
            100 ether,
            false, // isRetired
            new string[](1) // skills
        );
        
        assertEq(senseiId, 1);
        assertTrue(senseiRegistry.isRegisteredSensei(sensei1));
        
        SenseiRegistry.SenseiProfile memory profile = senseiRegistry.getSenseiProfile(senseiId);
        assertEq(profile.name, "Master Yoda");
        assertEq(profile.expertise, "Jedi Training");
        assertEq(profile.hourlyRate, 100 ether);
        assertTrue(profile.isActive);
        
        vm.stopPrank();
    }
    
    function testUpdateSenseiProfile() public {
        // First register
        vm.prank(sensei1);
        uint256 senseiId = senseiRegistry.registerSensei(
            "Master Yoda",
            "Jedi Training",
            "Wise Jedi Master",
            100 ether,
            false, // isRetired
            new string[](1) // skills
        );
        
        // Then update
        vm.prank(sensei1);
        senseiRegistry.updateProfile(
            senseiId,
            "Master Yoda Updated",
            "Advanced Jedi Training",
            "Updated description",
            150 ether
        );
        
        SenseiRegistry.SenseiProfile memory profile = senseiRegistry.getSenseiProfile(senseiId);
        assertEq(profile.name, "Master Yoda Updated");
        assertEq(profile.expertise, "Advanced Jedi Training");
        assertEq(profile.hourlyRate, 150 ether);
    }
    
    // ============ SenseiToken Tests ============
    
    function testInitialTokenSupply() public {
        // Token should start with 0 supply
        assertEq(senseiToken.totalSupply(), 0);
        assertEq(senseiToken.balanceOf(deployer), 0);
    }
    
    function testMintWithETH() public {
        vm.deal(student1, 10 ether);
        
        vm.prank(student1);
        uint256 tokensMinted = senseiToken.mintWithETH{value: 1 ether}();
        
        // Should mint tokens based on current rate (starts at MIN_MINT_RATE = 100)
        assertEq(tokensMinted, 100 * 10**18); // 100 tokens per ETH
        assertEq(senseiToken.balanceOf(student1), 100 * 10**18);
        assertEq(senseiToken.totalSupply(), 100 * 10**18);
    }
    
    function testCompleteKnowledgeSession() public {
        // First mint some tokens to create backing
        vm.deal(student1, 10 ether);
        vm.prank(student1);
        senseiToken.mintWithETH{value: 1 ether}();
        
        // Then complete a knowledge session
        vm.prank(address(knowledgeSession));
        senseiToken.completeKnowledgeSession(1, sensei1, student1, 1000 ether);
        
        (uint256 knowledgeValue, uint256 backingValue) = senseiToken.getSessionInfo(1);
        assertEq(knowledgeValue, 1000 ether); // sessionValue as recorded
        assertEq(backingValue, 1000 ether);   // sessionValue as recorded
    }
    
    function testDynamicMintRate() public {
        // Start with minimum rate
        assertEq(senseiToken.getCurrentMintRate(), 100 * 10**18);
        
        // Complete a knowledge session to increase demand
        vm.prank(address(knowledgeSession));
        senseiToken.completeKnowledgeSession(1, sensei1, student1, 2000 ether);
        
        // Force a rebase
        vm.warp(block.timestamp + 1 days);
        
        // Complete another session to trigger rebase
        vm.prank(address(knowledgeSession));
        senseiToken.completeKnowledgeSession(2, sensei1, student1, 1000 ether);
        
        // Rate should increase due to high demand (knowledge value > backing value)
        uint256 newRate = senseiToken.getCurrentMintRate();
        assertTrue(newRate > 100 * 10**18);
    }
    
    // ============ LessonNFT Tests ============
    
    function testCreateLessonNFT() public {
        vm.prank(address(knowledgeSession));
        uint256 tokenId = lessonNFT.createSessionNFT(
            1,
            sensei1,
            student1,
            "Jedi Training",
            "Basic Lightsaber Combat",
            "Learn the fundamentals of lightsaber combat",
            60,
            100 ether,
            8, // Lesson quality 8/10
            true // isPublicMintable
        );
        
        assertEq(tokenId, 1);
        assertEq(lessonNFT.ownerOf(tokenId), address(lessonNFT)); // Initially owned by contract

        
        // Check the created NFT metadata
        LessonNFT.LessonMetadata memory metadata = lessonNFT.getLessonMetadata(tokenId);
        assertEq(metadata.isMinted, false); // Initially not minted
        assertEq(metadata.lessonQuality, 8);
        assertEq(metadata.isPublicMintable, true);
        
        // Check that mint price was calculated based on quality
        assertTrue(metadata.mintPrice > 0);
    }
    
    function testMintPublicLessonNFT() public {
        // First create the NFT
        vm.prank(address(knowledgeSession));
        uint256 tokenId = lessonNFT.createSessionNFT(
            1,
            sensei1,
            student1,
            "Jedi Training",
            "Basic Lightsaber Combat",
            "Learn the fundamentals of lightsaber combat",
            60,
            100 ether,
            9, // High quality lesson
            true // isPublicMintable
        );
        
        // Mint some tokens for student2 to pay for NFT
        vm.deal(student2, 10 ether);
        vm.prank(student2);
        uint256 tokensMinted = senseiToken.mintWithETH{value: 1 ether}();
        
        // Get the NFT metadata to see the mint price
        LessonNFT.LessonMetadata memory metadata = lessonNFT.getLessonMetadata(tokenId);
        
        // Approve tokens for the NFT purchase
        vm.prank(student2);
        senseiToken.approve(address(lessonNFT), metadata.mintPrice);
        
        // Then mint the public NFT
        vm.prank(student2);
        lessonNFT.mintLessonNFT(tokenId);
        
        LessonNFT.LessonMetadata memory updatedMetadata = lessonNFT.getLessonMetadata(tokenId);
        assertTrue(updatedMetadata.isMinted);
        assertEq(lessonNFT.ownerOf(tokenId), student2);
    }
    
    // ============ KnowledgeSession Tests ============
    
    function testBookSession() public {
        // First register a sensei
        vm.prank(sensei1);
        uint256 senseiId = senseiRegistry.registerSensei(
            "Master Yoda",
            "Jedi Training",
            "Wise Jedi Master",
            100 ether,
            false, // isRetired
            new string[](1) // skills
        );
        
        // Then book a session
        vm.prank(student1);
        uint256 sessionId = knowledgeSession.bookSession{value: 100 ether}(
            senseiId,
            "Jedi Training",
            "Basic Lightsaber Combat",
            "Learn the fundamentals of lightsaber combat",
            60,
            100 ether
        );
        
        assertEq(sessionId, 1);
        
        KnowledgeSession.Session memory session = knowledgeSession.getSession(sessionId);
        assertEq(session.senseiId, senseiId);
        assertEq(session.studentAddress, student1);
        assertEq(session.price, 100 ether);
        assertEq(uint256(session.state), uint256(KnowledgeSession.SessionState.PENDING));
    }
    
    function testCompleteSessionFlow() public {
        // 1. Register sensei
        vm.prank(sensei1);
        uint256 senseiId = senseiRegistry.registerSensei(
            "Master Yoda",
            "Jedi Training",
            "Wise Jedi Master",
            100 ether,
            false, // isRetired
            new string[](1) // skills
        );
        
        // 2. Book session using BookingSystem (supports nftMintable)
        vm.prank(student1);
        uint256 sessionId = bookingSystem.bookSessionWithETH{value: 100 ether}(
            senseiId,
            "Jedi Training",
            "Basic Lightsaber Combat",
            "Learn the fundamentals of lightsaber combat",
            60,
            true // nftMintable
        );
        
        // 3. Accept session
        vm.prank(sensei1);
        bookingSystem.acceptSession(sessionId);
        
        // 4. Start session
        vm.prank(sensei1);
        bookingSystem.startSession(sessionId);
        
        // 5. Complete session with quality rating
        vm.prank(sensei1);
        bookingSystem.completeSession(sessionId, 9); // High quality lesson
        
        BookingSystem.Session memory session = bookingSystem.getSession(sessionId);
        assertEq(uint256(session.state), uint256(DataTypes.SessionState.COMPLETED));
        assertTrue(session.isPaid);
        assertEq(session.knowledgeValue, 9);
        assertEq(session.lessonQuality, 9);
    }
    
    // ============ SensayAI Tests ============
    
    function testCreatePersonalAI() public {
        vm.prank(deployer);
        sensayAI.createPersonalAI(
            1,
            "Master Yoda",
            "Jedi Training",
            "Wise Jedi Master with centuries of experience"
        );
        
        DataTypes.PersonalAI memory personalAI = sensayAI.getPersonalAI(1);
        assertEq(personalAI.senseiId, 1);
        assertTrue(personalAI.isActive);
        assertEq(personalAI.aiModel, "GPT-4");
        assertTrue(bytes(personalAI.personalizedPrompt).length > 0);
    }
    
    function testInteractWithSensayAI() public {
        // First create personal AI
        vm.prank(deployer);
        sensayAI.createPersonalAI(
            1,
            "Master Yoda",
            "Jedi Training",
            "Wise Jedi Master"
        );
        
        // Then interact
        string memory response = sensayAI.interactWithSensayAI(1, "How do I use the Force?");
        
        assertTrue(bytes(response).length > 0);
        
        DataTypes.PersonalAI memory personalAI = sensayAI.getPersonalAI(1);
        assertEq(personalAI.interactionCount, 1);
    }
    
    // ============ Integration Tests ============
    
    function testFullSenseiWorkflow() public {
        // 1. Register sensei
        vm.prank(sensei1);
        uint256 senseiId = senseiRegistry.registerSensei(
            "Master Yoda",
            "Jedi Training",
            "Wise Jedi Master",
            100 ether,
            false, // isRetired
            new string[](1) // skills
        );
        
        // 2. Create personal AI
        vm.prank(deployer);
        sensayAI.createPersonalAI(senseiId, "Master Yoda", "Jedi Training", "Wise Jedi Master");
        
        // 3. Book and complete session using BookingSystem (supports nftMintable)
        vm.prank(student1);
        uint256 sessionId = bookingSystem.bookSessionWithETH{value: 100 ether}(
            senseiId,
            "Jedi Training",
            "Basic Lightsaber Combat",
            "Learn the fundamentals of lightsaber combat",
            60,
            true // nftMintable
        );
        
        vm.prank(sensei1);
        bookingSystem.acceptSession(sessionId);
        
        vm.prank(sensei1);
        bookingSystem.startSession(sessionId);
        
        vm.prank(sensei1);
        bookingSystem.completeSession(sessionId, 9); // High quality lesson
        
        // 4. Verify NFT was created
        uint256[] memory tokenIds = lessonNFT.getTokenIdsForSession(sessionId);
        assertEq(tokenIds.length, 1);
        
        uint256 tokenId = tokenIds[0];
        
        // 5. Verify the NFT metadata
        LessonNFT.LessonMetadata memory metadata = lessonNFT.getLessonMetadata(tokenId);
        assertEq(metadata.isMinted, false); // Initially not minted
        assertEq(metadata.lessonQuality, 9);
        assertEq(metadata.isPublicMintable, true);
        
        // 6. Verify public NFT can be minted with SenseiTokens
        vm.prank(student2);
        vm.deal(student2, 10 ether);
        uint256 tokensMinted = senseiToken.mintWithETH{value: 1 ether}();
        
        vm.prank(student2);
        lessonNFT.mintLessonNFT(tokenId);
        assertEq(lessonNFT.ownerOf(tokenId), student2);
    }
    
    // ============ Error Tests ============
    
    function testCannotBookSessionWithInactiveSensei() public {
        // Register sensei
        vm.prank(sensei1);
        uint256 senseiId = senseiRegistry.registerSensei(
            "Master Yoda",
            "Jedi Training",
            "Wise Jedi Master",
            100 ether,
            false, // isRetired
            new string[](1) // skills
        );
        
        // Deactivate sensei
        vm.prank(sensei1);
        senseiRegistry.deactivateSensei(senseiId);
        
        // Try to book session
        vm.prank(student1);
        vm.expectRevert("Sensei is not active");
        knowledgeSession.bookSession{value: 100 ether}(
            senseiId,
            "Jedi Training",
            "Basic Lightsaber Combat",
            "Learn the fundamentals of lightsaber combat",
            60,
            100 ether
        );
    }
    
    function testCannotMintStudentNFT() public {
        // Create NFT that is NOT publicly mintable (student NFT)
        vm.prank(address(knowledgeSession));
        uint256 tokenId = lessonNFT.createSessionNFT(
            1,
            sensei1,
            student1,
            "Jedi Training",
            "Basic Lightsaber Combat",
            "Learn the fundamentals of lightsaber combat",
            60,
            100 ether,
            8, // lesson quality
            false // isPublicMintable - this makes it a student NFT
        );
        
        // Try to mint student NFT (should fail)
        vm.prank(student2);
        vm.expectRevert("NFT is not publicly mintable");
        lessonNFT.mintLessonNFT(tokenId);
    }
    
    function testTokenMintingWithDemand() public {
        // Start with no tokens
        assertEq(senseiToken.totalSupply(), 0);
        
        // Mint some tokens with ETH
        vm.deal(student1, 10 ether);
        vm.prank(student1);
        uint256 initialTokens = senseiToken.mintWithETH{value: 1 ether}();
        assertEq(initialTokens, 100 * 10**18);
        
        // Complete knowledge session to increase demand
        vm.prank(address(knowledgeSession));
        senseiToken.completeKnowledgeSession(1, sensei1, student1, 2000 ether);
        
        // Force rebase
        vm.warp(block.timestamp + 1 days);
        
        // Mint more tokens - should get higher rate due to increased demand
        vm.prank(student2);
        vm.deal(student2, 10 ether);
        uint256 newTokens = senseiToken.mintWithETH{value: 1 ether}();
        
        // Should get more tokens due to higher demand
        assertTrue(newTokens >= initialTokens);
    }
    
    function testLessonQualityAffectsNFTPrice() public {
        // Create NFTs with different quality levels
        vm.prank(address(knowledgeSession));
        uint256 lowQualityToken = lessonNFT.createSessionNFT(
            1,
            sensei1,
            student1,
            "Jedi Training",
            "Basic Training",
            "Basic lesson",
            60,
            100 ether,
            3, // Low quality
            true // isPublicMintable
        );
        
        vm.prank(address(knowledgeSession));
        uint256 highQualityToken = lessonNFT.createSessionNFT(
            2,
            sensei1,
            student1,
            "Jedi Training",
            "Advanced Training",
            "Advanced lesson",
            60,
            100 ether,
            9, // High quality
            true // isPublicMintable
        );
        
        // Get mint prices
        LessonNFT.LessonMetadata memory lowQualityMetadata = lessonNFT.getLessonMetadata(lowQualityToken);
        LessonNFT.LessonMetadata memory highQualityMetadata = lessonNFT.getLessonMetadata(highQualityToken);
        
        // Higher quality should have higher price
        assertTrue(highQualityMetadata.mintPrice > lowQualityMetadata.mintPrice);
        assertTrue(lowQualityMetadata.mintPrice > 0);
        assertTrue(highQualityMetadata.mintPrice > 0);
    }
}
