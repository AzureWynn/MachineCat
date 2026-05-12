# 🤖 buzhai - Cross-Chain Privacy Payment Smart Robot Cat Platform

> Endowing every physical robot cat with a unique "soul" — capable of hearing, speaking, and moving, with all behaviors and language highly consistent with its设定的 "persona".
> 
> Integrated with Solana on-chain state management + LI.FI cross-chain bridge + MagicBlock privacy transactions + x402 autonomous agent payments

[🇨🇳 中文版](README_CN.md) | 🇬🇧 English

## 🏆 Hackathon Submission Info

### Contract Deployment Address
- **Network:** Solana Devnet
- **Program ID:** `ARjXV5jAyB1t53WE4c3eEf6gftFnF7aiympwBCfSvVoY`
- **Transaction Signature:** [View Transaction](https://solscan.io/tx/4FGj6HfGyZzX9kAqUdvHBdFycYAKAt9QKQh1F6WXfU9zji8a7wcj9iBqsXvBhfE3JmWjwwe4DXXx7LXdvDHXffwf?cluster=devnet)

### Quick Links
- 📄 [Contract Documentation](robot-contract/README.md) - Solana contract features, deployment and API documentation
- 📄 [Contract API Documentation](robot-contract/CONTRACT_API.md) - Detailed API documentation
- 📄 [Backend Service](robot-server/) - Node.js backend code
- 📄 [Frontend Application](robot-app/) - React frontend code
- 📄 [Devnet Deployment Guide](DEPLOY_DEVNET.md) - Deployment steps and configuration

### Live Demo
🌐 **https://scuba-biblical-specified-distinguished.trycloudflare.com**

### Demo Video
🎬 **https://youtu.be/EfRvZO4WACY**

## 📖 Project Overview

Robot Cat is a highly personalized, scalable smart robot cat interaction platform. Through software definition, we endow robot cats with names, types, breeds, and customizable personality traits, combined with Large Language Models (LLM) for truly emotional intelligent interaction.

**Hackathon Highlight**: Implementing a complete closed loop of "AI Task Generation → User Confirmation → Cross-Chain Payment → On-Chain State Update", demonstrating practical application scenarios of Agent cross-chain privacy payments.

### ✨ Core Features

- **🎭 Personalized Persona System**: Customize robot cat names, types, breeds, and personality trait profiles
- **🧠 LLM Intelligent Conversation**: Natural language interaction based on large language models, with responses highly matching the robot cat's personality
- **🎬 Action Choreography**: LLM automatically generates action commands to control robot cat movements
- **📡 Real-time Communication**: Bidirectional real-time communication based on WebSocket, supporting state monitoring and command dispatch
- **🔋 State Monitoring**: Real-time display of robot cat online status, battery level, and other information
- **🎮 Virtual Simulator**: Supports virtual robot cat simulation, enabling full development and testing without hardware
- **⛓️ Solana On-Chain State**: Robot cat state data stored on Solana blockchain, supporting multi-user isolation
- **🌉 Cross-Chain Payment**: Integrated LI.FI cross-chain bridge, supporting multi-chain asset transfers
- **🔒 Privacy Protection**: Using MagicBlock PER protocol for privacy transactions
- **🤖 Autonomous Agent Payment**: x402 protocol supports AI agents autonomously executing payments

## 🏗️ System Architecture

The project adopts **Domain-Driven Design (DDD)** and **Hexagonal Architecture**, dividing the system into clear, independent bounded contexts:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Application (React)              │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Home    │  │ Personality  │  │ Chat     │  │ Control │ │
│  └──────────┘  └──────────────┘  └──────────┘  └─────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                   Backend Service (Node.js + Koa)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Core Domain                               │   │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌─────────┐ │   │
│  │  │ RobotPersonality│  │ AIInteraction│  │ Robot   │ │   │
│  │  │ Context         │  │ Context      │  │ Control │ │   │
│  │  └─────────────────┘  └──────────────┘  └─────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────┬──────────────────────┬─────────────────────────┘
             │                      │
    ┌────────▼────────┐    ┌────────▼────────┐
    │   MongoDB       │    │     Redis       │
    │  Persistent      │    │   Real-time     │
    │  Storage         │    │   Cache         │
    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
MachineCat/
├── robot-app/                    # Frontend React Application
│   ├── src/
│   │   ├── components/          # Reusable Components
│   │   │   ├── Navbar.js        # Navigation Bar
│   │   │   └── RobotStatus.js   # Robot Status Display
│   │   ├── pages/               # Page Components
│   │   │   ├── Home.js          # Home Page
│   │   │   ├── PersonalityPage.js  # Personality Settings Page
│   │   │   ├── ChatPage.js      # Chat Page
│   │   │   ├── ControlPage.js   # Control Page
│   │   │   └── DemoPage.js      # Demo (Cross-Chain Payment)
│   │   ├── services/            # API and WebSocket Services
│   │   └── store/               # Zustand State Management
│   └── package.json
│
├── robot-server/                 # Backend Node.js Service
│   ├── src/
│   │   ├── core/                # Core Business Domain
│   │   │   ├── robot-personality/    # Robot Personality Context
│   │   │   │   ├── domain/           # Domain Models
│   │   │   │   └── application/      # Application Services
│   │   │   ├── ai-interaction/       # AI Interaction Context
│   │   │   │   ├── application/      # Interaction Services
│   │   │   │   └── infrastructure/   # LLM Clients
│   │   │   ├── robot-control/        # Robot Control Context
│   │   │   │   ├── domain/           # Robot Aggregate Root
│   │   │   │   └── infrastructure/   # WebSocket/HTTP/Bluetooth Connectors
│   │   │   └── blockchain/           # Blockchain Services
│   │   │       ├── solana.service.js     # Solana Contract Interaction
│   │   │       ├── payment.service.js    # Cross-Chain Payment Service
│   │   │       └── robot_contract.json   # Contract IDL
│   │   └── infrastructure/      # Global Infrastructure
│   │       ├── database/        # Database Connections
│   │       └── web/             # Koa Web Service
│   ├── scripts/                 # Database Seed Scripts
│   ├── virtual_robot.js         # Virtual Robot Cat Simulator
│   └── package.json
│
── robot-contract/               # Solana Smart Contract
│   ├── programs/
│   │   ── robot-contract/
│   │       ── src/
│   │           └── lib.rs        # Main Contract Code (Rust/Anchor)
│   ├── tests/
│   │   └── robot-contract.ts     # Contract Tests
│   ├── Anchor.toml               # Anchor Configuration
│   └── README.md                 # Contract Documentation
│
├── robot-sim-ros2/               # ROS2 + Gazebo Simulation
│   ├── src/machinecat_robot/     # ROS2 Robot Package
│   │   ├── urdf/                 # URDF Robot Models
│   │   ├── launch/               # Launch Files
│   │   ├── scripts/              # Python Control Scripts
│   │   └── worlds/               # Gazebo World Files
│   ├── Dockerfile                # Docker Image
│   ├── docker-compose.yml        # Container Orchestration
│   └── README.md                 # Simulation Documentation
│
── complete_project_analysis_v4.md  # Technical Implementation Blueprint
```

## 🛠️ Tech Stack

### Backend (robot-server)
- **Runtime**: Node.js
- **Web Framework**: Koa.js
- **WebSocket**: ws
- **Database**: MongoDB (Mongoose ODM)
- **Cache**: Redis (ioredis)
- **Logging**: Winston
- **Architecture Pattern**: Domain-Driven Design (DDD)
- **Blockchain Integration**: @solana/web3.js, @coral-xyz/anchor

### Frontend (robot-app)
- **UI Framework**: React 19
- **Routing**: React Router v7
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Build Tool**: Create React App
- **Wallet Integration**: Phantom Wallet

### Smart Contract (robot-contract)
- **Language**: Rust
- **Framework**: Anchor
- **Network**: Solana Devnet
- **Contract Address**: `ARjXV5jAyB1t53WE4c3eEf6gftFnF7aiympwBCfSvVoY`

### Blockchain Protocol Integration
- **LI.FI**: Cross-chain bridge protocol, supporting multi-chain asset transfers
- **MagicBlock PER**: Privacy transaction protocol, protecting user transaction privacy
- **x402**: Autonomous agent payment protocol, AI agents autonomously executing payments

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.0
- Redis >= 7.0
- Solana CLI >= 1.18.0 (optional, for contract development)
- Anchor >= 0.30.0 (optional, for contract development)
- Phantom Wallet (optional, for frontend interaction)

### Backend Startup

```bash
# Enter backend directory
cd robot-server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env file, configure MongoDB and Redis connection information

# Initialize sample data (optional)
npm run seed

# Start service using HTTP mode
npm run start:http
```

### Frontend Startup

```bash
# Enter frontend directory
cd robot-app

# Install dependencies
npm install

# Start development server
npm start
```

### Virtual Robot Cat Simulator

```bash
# Run in robot-server directory
node virtual_robot.js
```

The virtual robot cat simulates real hardware behavior, including:
- WebSocket connection and heartbeat maintenance
- Receiving and printing action commands
- Simulated battery level reporting

## 📡 API Endpoints

### Personality Management
- `POST /api/personality` - Create robot cat personality
- `GET /api/personality/:robotId` - Get robot cat personality
- `PUT /api/personality/:robotId` - Update robot cat personality

### AI Interaction
- `POST /api/interaction` - Send user input, get AI response and action commands
- `POST /api/speech` - Voice input processing

### Static Data
- `GET /api/static-data/types` - Get supported robot cat types
- `GET /api/static-data/breeds` - Get breed list
- `GET /api/static-data/traits` - Get personality trait list

### Health Check
- `GET /health` - Service health check

### Solana Blockchain
- `GET /api/solana/state/:robotId` - Get on-chain robot cat state
- `POST /api/solana/state/init` - Initialize on-chain robot cat state
- `POST /api/solana/state/update` - Update on-chain robot cat state
- `POST /api/solana/quest/complete` - Complete on-chain quest
- `POST /api/solana/transaction/build` - Build frontend signature transaction
- `POST /api/solana/transaction/init` - Build initialization transaction

### Cross-Chain Payment
- `POST /api/payment/process` - Process cross-chain payment
- `POST /api/payment/quote` - Get cross-chain quote
- `GET /api/payment/mode` - Get current payment mode

## 🔗 Cross-Chain Payment Integration

### LI.FI Cross-Chain Bridge (Core Integration)

**Integration Method:** REST API

**Technical Implementation:**
- Use LI.FI `/v1/quote` to get cross-chain quotes, supporting multi-chain asset transfers (Ethereum, Polygon, BSC → Solana)
- Use `/v1/transfer` to execute cross-chain transfers with automatic optimal routing
- Support API Key authentication (`x-lifi-api-key` header)
- Complete error handling and Mock fallback mechanisms

**Call Flow:**
```
User confirms task 
  → Backend calls LI.FI API to get quote 
  → Frontend signs transaction 
  → LI.FI executes cross-chain bridge 
  → Solana on-chain state update
```

**Code Location:** [robot-server/src/core/blockchain/payment.service.js](robot-server/src/core/blockchain/payment.service.js)

**API Documentation:** https://li.fi/developers

### MagicBlock PER Privacy Transactions

Using MagicBlock PER protocol for privacy-protected transactions:
- Enhanced privacy protection level
- Large anonymity set protects user privacy (1000+)
- Suitable for sensitive payment scenarios

**Code Location:** [payment.service.js](robot-server/src/core/blockchain/payment.service.js) - `createPrivateTransaction()`

### x402 Autonomous Agent Payment

Using x402 protocol for AI agent autonomous payment:
- AI agents can independently initiate and execute payments
- Triggered based on Solana on-chain state
- Suitable for automated service payment scenarios

**Code Location:** [payment.service.js](robot-server/src/core/blockchain/payment.service.js) - `createX402Payment()`

### Payment Modes

The system supports dual-mode operation:
- **Mock Mode** (default): Local testing, no API Key required, fast development
- **Real Mode**: Real protocol calls, requires API Keys configuration

Switch modes:
```bash
# Switch to Real mode
./switch-network.sh devnet

# Configure .env
PAYMENT_MODE=real
LIFI_API_KEY=your_key_here
```

## 🎯 User Flow

**Complete Closed Loop:** AI Task Generation → User Confirmation → Cross-Chain Payment → On-Chain State Update

1. **User Input Request**: e.g., "I don't want to go out"
2. **LLM Generates Task**: AI suggests "Go downstairs to buy water"
3. **User Confirms Task**: Confirms payment and execution
4. **Connect Phantom Wallet**: Frontend signature mode
5. **LI.FI Cross-Chain Payment**: Transfer assets from other chains to Solana (real API call)
6. **MagicBlock Privacy Protection**: Protect transaction privacy
7. **x402 Autonomous Agent Payment**: Complete payment process
8. **Solana On-Chain State Update**: Update robot cat mood, bond, energy, etc.
9. **Frontend Displays Results**: Show payment success and state changes

**Core Role of Solana in User Journey:**
- Robot state stored on Solana blockchain (PDA accounts)
- All payments completed through Solana
- Contract is the core infrastructure for AI agent and user interaction

## 🎭 Personality System

### Robot Cat Types
- `CAT` - Cat-type robot cat
- `CUSTOM` - Custom type

### Personality Traits
Each robot cat can have multiple personality traits, each with a percentage value of 0-100:

```json
{
  "name": "Little Orange",
  "type": "CAT",
  "breed": "Orange Cat",
  "traits": {
    "lively": 80,
    "tsundere": 50,
    "gluttonous": 90
  }
}
```

### LLM Interaction Flow

1. User inputs text
2. System retrieves robot cat's personality configuration
3. Dynamically constructs Prompt with personality information
4. Calls LLM to generate response
5. Parses LLM response, separates text and action commands
6. Sends action commands to robot cat for execution
7. Returns text response to user

## 📋 Development Plan

The project adopts a **Simulation-Driven Development** strategy, implemented in phases:

- ✅ **Sprint 0**: Environment Setup and Backend Foundation
- ✅ **Sprint 1**: Core Context Modeling and Simulator Development
- ✅ **Sprint 2**: Personalization and LLM Interaction
- ✅ **Sprint 3**: Frontend Development and Complete Flow Integration
- ⏳ **Sprint 4+**: Hardware Integration and TTS Voice Broadcasting

For detailed development plan, see [development_plan.md](development_plan.md)

## 📚 Documentation

- [Technical Implementation Blueprint](complete_project_analysis_v4.md) - Complete architecture design and technology selection
- [Development Plan](development_plan.md) - Detailed development phases and task list
- [Contract Documentation](robot-contract/README.md) - Solana contract deployment address and API documentation
- [Contract API Documentation](robot-contract/CONTRACT_API.md) - Detailed contract interface documentation
- [Devnet Deployment Guide](DEPLOY_DEVNET.md) - Devnet deployment steps and configuration

### Sub-Project Documentation
- [robot-contract/README.md](robot-contract/README.md) - Solana smart contract documentation
- [robot-server/](robot-server/) - Backend service
- [robot-app/](robot-app/) - Frontend application
- [robot-sim-ros2/README.md](robot-sim-ros2/README.md) - ROS2 + Gazebo simulation documentation

## 🔐 Security Notes

The following files contain sensitive information and should not be committed to version control:

- `.env` - Environment variables (including database passwords, API keys, etc.)
- `certificates/` - SSL/TLS certificate files
- `node_modules/` - Dependency packages

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

ISC License

---

**Endowing every robot cat with a unique soul** 🐱
