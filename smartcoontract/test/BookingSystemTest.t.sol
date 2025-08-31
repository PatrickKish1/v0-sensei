// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {BookingSystem} from "../src/BookingSystem.sol";
import {SenseiRegistry} from "../src/SenseiRegistry.sol";
import {SenseiToken} from "../src/SenseiToken.sol";
import {LessonNFT} from "../src/LessonNFT.sol";
import "../src/libraries/Constants.sol";
import "../src/libraries/DataTypes.sol";

/**
 * @title BookingSystemTest - Comprehensive Unit Tests for BookingSystem
 * @notice Tests all booking functionality, payment processing, and session management
 * @dev Every booking scenario gets tested here - ETH, ERC20, edge cases, the works
 * This is where we make sure the booking system is bulletproof
 */
contract BookingSystemTest is Test {
    
    BookingSystem public bookingSystem;
    SenseiRegistry public senseiRegistry;
    SenseiToken public senseiToken;
    LessonNFT public lessonNFT;
    MockERC20 public mockUSDC;
    MockERC20 public mockDAI;
    
    address public owner;
    address public sensei1;
    address public sensei2;
    address public student1;
    address public student2;
    
    uint256 public sensei1Id;
    uint256 public sensei2Id;
    
    function setUp() public {
        owner = address(this);
        sensei1 = makeAddr("sensei1");
        sensei2 = makeAddr("sensei2");
        student1 = makeAddr("student1");
        student2 = makeAddr("student2");
        
        // Deploy contracts
        senseiRegistry = new SenseiRegistry();
        senseiToken = new SenseiToken();
        lessonNFT = new LessonNFT(address(senseiToken));
        bookingSystem = new BookingSystem(
            address(senseiRegistry),
            address(senseiToken),
            address(lessonNFT)
        );
        
        // Deploy mock tokens
        mockUSDC = new MockERC20("USDC", "USDC", 6);
        mockDAI = new MockERC20("DAI", "DAI", 18);
        
        // Set up permissions
        senseiToken.setAuthorizedMinter(address(bookingSystem), true);
        senseiToken.setAuthorizedMinter(address(lessonNFT), true);
        
        // Register senseis
        string[] memory skills1 = new string[](2);
        skills1[0] = "Solidity";
        skills1[1] = "DeFi";
        
        vm.prank(sensei1);
        sensei1Id = senseiRegistry.registerSensei(
            "Solidity Master",
            "Smart Contract Development",
            "Expert in DeFi protocols",
            1 ether,
            false,
            skills1
        );
        
        string[] memory skills2 = new string[](2);
        skills2[0] = "Frontend";
        skills2[1] = "React";
        
        vm.prank(sensei2);
        sensei2Id = senseiRegistry.registerSensei(
            "Frontend Guru",
            "Frontend Development",
            "React and UI/UX expert",
            0.5 ether,
            false,
            skills2
        );
        
        // Fund addresses
        vm.deal(sensei1, 100 ether);
        vm.deal(sensei2, 100 ether);
        vm.deal(student1, 100 ether);
        vm.deal(student2, 100 ether);
        
        // Give mock tokens to students
        mockUSDC.mint(student1, 10000 * 10**6);
        mockUSDC.mint(student2, 10000 * 10**6);
        mockDAI.mint(student1, 10000 * 10**18);
        mockDAI.mint(student2, 10000 * 10**18);
    }
    
    // ============ ETH BOOKING TESTS ============
    
    function testBookSessionWithETH() public {
        vm.prank(student1);
        uint256 sessionId = bookingSystem.bookSessionWithETH{value: 1 ether}(
            sensei1Id,
            "Smart Contracts",
            "Build a DEX",
            "Learn to build a decentralized exchange",
            120,
            true
        );
        
        assertEq(sessionId, 1);
        
        BookingSystem.Session memory session = bookingSystem.getSession(sessionId);
        assertEq(session.senseiId, sensei1Id);
        assertEq(session.studentAddress, student1);
        assertEq(session.price, 1 ether);
        assertEq(uint256(session.paymentMethod), uint256(DataTypes.PaymentMethod.ETH));
        assertEq(uint256(session.state), uint256(DataTypes.SessionState.PENDING));
        assertTrue(session.nftMintable);
        
        // Verify ETH is held in escrow
        assertEq(address(bookingSystem).balance, 1 ether);
    }
    
    function testBookSessionWithETHInvalidAmount() public {
        vm.prank(student1);
        vm.expectRevert();
        bookingSystem.bookSessionWithETH{value: 0}(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            60,
            true
        );
    }
    
    function testBookSessionWithETHInvalidSensei() public {
        vm.prank(student1);
        vm.expectRevert();
        bookingSystem.bookSessionWithETH{value: 1 ether}(
            999, // Non-existent sensei
            "Test",
            "Test",
            "Test",
            60,
            true
        );
    }
    
    // ============ ERC20 BOOKING TESTS ============
    
    function testBookSessionWithUSDC() public {
        uint256 usdcAmount = 100 * 10**6; // 100 USDC
        
        vm.startPrank(student1);
        mockUSDC.approve(address(bookingSystem), usdcAmount);
        
        uint256 sessionId = bookingSystem.bookSessionWithToken(
            sensei1Id,
            "DeFi Development",
            "Yield Farming Protocol",
            "Build a yield farming protocol from scratch",
            180,
            usdcAmount,
            address(mockUSDC),
            true
        );
        vm.stopPrank();
        
        assertEq(sessionId, 1);
        
        BookingSystem.Session memory session = bookingSystem.getSession(sessionId);
        assertEq(session.price, usdcAmount);
        assertEq(session.paymentToken, address(mockUSDC));
        assertEq(uint256(session.paymentMethod), uint256(DataTypes.PaymentMethod.ERC20_TOKEN));
        
        // Verify USDC is held in escrow
        assertEq(mockUSDC.balanceOf(address(bookingSystem)), usdcAmount);
        assertEq(mockUSDC.balanceOf(student1), 10000 * 10**6 - usdcAmount);
    }
    
    function testBookSessionWithDAI() public {
        uint256 daiAmount = 150 * 10**18; // 150 DAI
        
        vm.startPrank(student2);
        mockDAI.approve(address(bookingSystem), daiAmount);
        
        uint256 sessionId = bookingSystem.bookSessionWithToken(
            sensei2Id,
            "Frontend Development",
            "React Performance",
            "Optimize React apps for maximum performance",
            90,
            daiAmount,
            address(mockDAI),
            false // Private lesson
        );
        vm.stopPrank();
        
        assertEq(sessionId, 1);
        
        BookingSystem.Session memory session = bookingSystem.getSession(sessionId);
        assertEq(session.price, daiAmount);
        assertEq(session.paymentToken, address(mockDAI));
        assertFalse(session.nftMintable);
        
        // Verify DAI is held in escrow
        assertEq(mockDAI.balanceOf(address(bookingSystem)), daiAmount);
    }
    
    function testBookSessionWithTokenInsufficientBalance() public {
        vm.startPrank(student1);
        mockUSDC.approve(address(bookingSystem), 20000 * 10**6); // Approve more than balance
        
        vm.expectRevert();
        bookingSystem.bookSessionWithToken(
            sensei1Id,
            "Test",
            "Test",
            "Test", 
            60,
            20000 * 10**6, // More than balance
            address(mockUSDC),
            true
        );
        vm.stopPrank();
    }
    
    function testBookSessionWithTokenInsufficientAllowance() public {
        vm.startPrank(student1);
        // Don't approve enough
        mockUSDC.approve(address(bookingSystem), 50 * 10**6);
        
        vm.expectRevert();
        bookingSystem.bookSessionWithToken(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            60,
            100 * 10**6, // More than approved
            address(mockUSDC),
            true
        );
        vm.stopPrank();
    }
    
    // ============ SESSION LIFECYCLE TESTS ============
    
    function testCompleteSessionLifecycleETH() public {
        // 1. Book session
        vm.prank(student1);
        uint256 sessionId = bookingSystem.bookSessionWithETH{value: 1 ether}(
            sensei1Id,
            "Solidity",
            "Smart Contract Security",
            "Learn security best practices",
            120,
            true
        );
        
        // 2. Accept session
        vm.prank(sensei1);
        bookingSystem.acceptSession(sessionId);
        
        BookingSystem.Session memory session = bookingSystem.getSession(sessionId);
        assertEq(uint256(session.state), uint256(DataTypes.SessionState.ACCEPTED));
        
        // 3. Start session
        vm.prank(sensei1);
        bookingSystem.startSession(sessionId);
        
        session = bookingSystem.getSession(sessionId);
        assertEq(uint256(session.state), uint256(DataTypes.SessionState.IN_PROGRESS));
        assertTrue(session.startTime > 0);
        
        // 4. Complete session
        vm.prank(sensei1);
        bookingSystem.completeSession(sessionId, 85); // 85% knowledge value
        
        session = bookingSystem.getSession(sessionId);
        assertEq(uint256(session.state), uint256(DataTypes.SessionState.COMPLETED));
        assertTrue(session.isPaid);
        assertEq(session.knowledgeValue, 85);
        assertTrue(session.lessonNFTId > 0); // NFT should be created
        
        // 5. Verify payment went to SenseiToken
        assertTrue(address(senseiToken).balance > 0);
        assertEq(address(bookingSystem).balance, 0); // No ETH left in booking system
        
        // 6. Rate session
        vm.prank(student1);
        bookingSystem.rateSession(sessionId, 8, "Excellent lesson!");
        
        session = bookingSystem.getSession(sessionId);
        assertTrue(session.isRated);
        assertEq(session.studentRating, 8);
    }
    
    function testCompleteSessionLifecycleToken() public {
        uint256 daiAmount = 200 * 10**18;
        
        // 1. Book with DAI
        vm.startPrank(student1);
        mockDAI.approve(address(bookingSystem), daiAmount);
        uint256 sessionId = bookingSystem.bookSessionWithToken(
            sensei2Id,
            "Frontend",
            "React Hooks",
            "Master React hooks and state management",
            90,
            daiAmount,
            address(mockDAI),
            false // Private lesson
        );
        vm.stopPrank();
        
        // 2. Accept and complete session
        vm.prank(sensei2);
        bookingSystem.acceptSession(sessionId);
        
        vm.prank(sensei2);
        bookingSystem.startSession(sessionId);
        
        vm.prank(sensei2);
        bookingSystem.completeSession(sessionId, 75);
        
        // 3. Verify payment went to SenseiToken
        assertEq(mockDAI.balanceOf(address(senseiToken)), daiAmount);
        assertEq(mockDAI.balanceOf(address(bookingSystem)), 0);
        
        // 4. Verify no NFT was created (private lesson)
        BookingSystem.Session memory session = bookingSystem.getSession(sessionId);
        assertEq(session.lessonNFTId, 0);
    }
    
    // ============ SESSION CANCELLATION TESTS ============
    
    function testDeclineSessionETH() public {
        // Book session
        vm.prank(student1);
        uint256 sessionId = bookingSystem.bookSessionWithETH{value: 1 ether}(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            60,
            true
        );
        
        uint256 studentETHBefore = student1.balance;
        
        // Decline session
        vm.prank(sensei1);
        bookingSystem.declineSession(sessionId);
        
        // Verify refund
        assertEq(student1.balance, studentETHBefore + 1 ether);
        assertEq(address(bookingSystem).balance, 0);
        
        BookingSystem.Session memory session = bookingSystem.getSession(sessionId);
        assertEq(uint256(session.state), uint256(DataTypes.SessionState.DECLINED));
    }
    
    function testDeclineSessionToken() public {
        uint256 usdcAmount = 100 * 10**6;
        
        // Book with USDC
        vm.startPrank(student1);
        mockUSDC.approve(address(bookingSystem), usdcAmount);
        uint256 sessionId = bookingSystem.bookSessionWithToken(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            60,
            usdcAmount,
            address(mockUSDC),
            true
        );
        vm.stopPrank();
        
        uint256 studentUSDCBefore = mockUSDC.balanceOf(student1);
        
        // Decline session
        vm.prank(sensei1);
        bookingSystem.declineSession(sessionId);
        
        // Verify refund
        assertEq(mockUSDC.balanceOf(student1), studentUSDCBefore + usdcAmount);
        assertEq(mockUSDC.balanceOf(address(bookingSystem)), 0);
    }
    
    function testCancelSessionByStudent() public {
        // Book session
        vm.prank(student1);
        uint256 sessionId = bookingSystem.bookSessionWithETH{value: 1 ether}(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            60,
            true
        );
        
        uint256 studentETHBefore = student1.balance;
        
        // Student cancels
        vm.prank(student1);
        bookingSystem.cancelSession(sessionId);
        
        // Verify refund
        assertEq(student1.balance, studentETHBefore + 1 ether);
        
        BookingSystem.Session memory session = bookingSystem.getSession(sessionId);
        assertEq(uint256(session.state), uint256(DataTypes.SessionState.CANCELLED));
    }
    
    // ============ RATING TESTS ============
    
    function testRatingSystem() public {
        uint256 sessionId = _createAndCompleteSession();
        
        // Test valid ratings (1-9)
        for (uint256 rating = Constants.MIN_RATING; rating <= Constants.MAX_RATING; rating++) {
            vm.prank(student1);
            bookingSystem.rateSession(sessionId, rating, string(abi.encodePacked("Rating: ", rating)));
            
            BookingSystem.Session memory session = bookingSystem.getSession(sessionId);
            assertEq(session.studentRating, rating);
        }
    }
    
    function testInvalidRatings() public {
        uint256 sessionId = _createAndCompleteSession();
        
        // Test rating 0 (too low)
        vm.prank(student1);
        vm.expectRevert();
        bookingSystem.rateSession(sessionId, 0, "Invalid rating");
        
        // Test rating 10 (too high for our 1-9 scale)
        vm.prank(student1);
        vm.expectRevert();
        bookingSystem.rateSession(sessionId, 10, "Invalid rating");
        
        // Test rating 15 (way too high)
        vm.prank(student1);
        vm.expectRevert();
        bookingSystem.rateSession(sessionId, 15, "Invalid rating");
    }
    
    function testDoubleRating() public {
        uint256 sessionId = _createAndCompleteSession();
        
        // Rate once
        vm.prank(student1);
        bookingSystem.rateSession(sessionId, 8, "Great lesson");
        
        // Try to rate again
        vm.prank(student1);
        vm.expectRevert();
        bookingSystem.rateSession(sessionId, 7, "Changed my mind");
    }
    
    // ============ PAYMENT FLOW TESTS ============
    
    function testPaymentGoesToSenseiToken() public {
        uint256 initialSenseiTokenBalance = address(senseiToken).balance;
        
        // Book and complete session
        vm.prank(student1);
        uint256 sessionId = bookingSystem.bookSessionWithETH{value: 2 ether}(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            60,
            true
        );
        
        vm.prank(sensei1);
        bookingSystem.acceptSession(sessionId);
        
        vm.prank(sensei1);
        bookingSystem.startSession(sessionId);
        
        vm.prank(sensei1);
        bookingSystem.completeSession(sessionId, 80);
        
        // Verify payment went to SenseiToken, not directly to sensei
        assertEq(address(senseiToken).balance, initialSenseiTokenBalance + 2 ether);
        assertEq(address(bookingSystem).balance, 0);
        
        // Verify sensei didn't get ETH directly
        assertEq(sensei1.balance, 100 ether); // Still original amount
        
        // But sensei should have earnings recorded (not necessarily tokens yet)
        assertTrue(senseiToken.senseiEarnings(sensei1) > 0);
        assertTrue(senseiToken.senseiContributions(sensei1) > 0);
    }
    
    function testTokenPaymentGoesToSenseiToken() public {
        uint256 daiAmount = 300 * 10**18;
        
        vm.startPrank(student1);
        mockDAI.approve(address(bookingSystem), daiAmount);
        uint256 sessionId = bookingSystem.bookSessionWithToken(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            60,
            daiAmount,
            address(mockDAI),
            true
        );
        vm.stopPrank();
        
        // Complete session
        vm.prank(sensei1);
        bookingSystem.acceptSession(sessionId);
        vm.prank(sensei1);
        bookingSystem.startSession(sessionId);
        vm.prank(sensei1);
        bookingSystem.completeSession(sessionId, 90);
        
        // Verify DAI went to SenseiToken
        assertEq(mockDAI.balanceOf(address(senseiToken)), daiAmount);
        assertEq(mockDAI.balanceOf(address(bookingSystem)), 0);
        
        // Verify sensei didn't get DAI directly
        assertEq(mockDAI.balanceOf(sensei1), 0);
    }
    
    // ============ SESSION TIMEOUT TESTS ============
    
    function testSessionTimeout() public {
        vm.prank(student1);
        uint256 sessionId = bookingSystem.bookSessionWithETH{value: 1 ether}(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            60,
            true
        );
        
        // Wait for timeout
        vm.warp(block.timestamp + Constants.SESSION_TIMEOUT + 1);
        
        // Should be able to cancel after timeout
        vm.prank(student1);
        bookingSystem.cancelSession(sessionId);
        
        BookingSystem.Session memory session = bookingSystem.getSession(sessionId);
        assertEq(uint256(session.state), uint256(DataTypes.SessionState.CANCELLED));
    }
    
    // ============ EDGE CASE TESTS ============
    
    function testSessionDurationLimits() public {
        // Test minimum duration
        vm.prank(student1);
        vm.expectRevert();
        bookingSystem.bookSessionWithETH{value: 1 ether}(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            10, // Below minimum
            true
        );
        
        // Test maximum duration
        vm.prank(student1);
        vm.expectRevert();
        bookingSystem.bookSessionWithETH{value: 1 ether}(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            500, // Above maximum
            true
        );
        
        // Test valid duration
        vm.prank(student1);
        uint256 sessionId = bookingSystem.bookSessionWithETH{value: 1 ether}(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            120, // Valid duration
            true
        );
        
        assertTrue(sessionId > 0);
    }
    
    function testInvalidKnowledgeValue() public {
        uint256 sessionId = _createAcceptedSession();
        
        vm.prank(sensei1);
        bookingSystem.startSession(sessionId);
        
        // Test invalid knowledge values
        vm.prank(sensei1);
        vm.expectRevert();
        bookingSystem.completeSession(sessionId, 0); // Zero knowledge
        
        vm.prank(sensei1);
        vm.expectRevert();
        bookingSystem.completeSession(sessionId, 101); // Over 100%
    }
    
    // ============ ACCESS CONTROL TESTS ============
    
    function testOnlySenseiCanAccept() public {
        vm.prank(student1);
        uint256 sessionId = bookingSystem.bookSessionWithETH{value: 1 ether}(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            60,
            true
        );
        
        // Student tries to accept their own session
        vm.prank(student1);
        vm.expectRevert();
        bookingSystem.acceptSession(sessionId);
        
        // Wrong sensei tries to accept
        vm.prank(sensei2);
        vm.expectRevert();
        bookingSystem.acceptSession(sessionId);
        
        // Correct sensei accepts
        vm.prank(sensei1);
        bookingSystem.acceptSession(sessionId);
    }
    
    function testOnlyStudentCanCancel() public {
        vm.prank(student1);
        uint256 sessionId = bookingSystem.bookSessionWithETH{value: 1 ether}(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            60,
            true
        );
        
        // Sensei tries to cancel
        vm.prank(sensei1);
        vm.expectRevert();
        bookingSystem.cancelSession(sessionId);
        
        // Student cancels
        vm.prank(student1);
        bookingSystem.cancelSession(sessionId);
    }
    
    // ============ HELPER FUNCTIONS ============
    
    function _createAcceptedSession() internal returns (uint256 sessionId) {
        vm.prank(student1);
        sessionId = bookingSystem.bookSessionWithETH{value: 1 ether}(
            sensei1Id,
            "Test",
            "Test",
            "Test",
            60,
            true
        );
        
        vm.prank(sensei1);
        bookingSystem.acceptSession(sessionId);
        
        return sessionId;
    }
    
    function _createAndCompleteSession() internal returns (uint256 sessionId) {
        sessionId = _createAcceptedSession();
        
        vm.prank(sensei1);
        bookingSystem.startSession(sessionId);
        
        vm.prank(sensei1);
        bookingSystem.completeSession(sessionId, 80);
        
        return sessionId;
    }
}

/**
 * @title MockERC20 - Simple ERC20 for testing
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

