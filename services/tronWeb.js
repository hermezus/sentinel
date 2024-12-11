import { TronWeb } from 'tronweb';

import dotenv from 'dotenv';
dotenv.config();

import Web3 from "web3-setup-lib";
Web3.setup();

const tronConfig = {
    fullNode: process.env.RPC_URL,
    solidityNode: process.env.RPC_URL,
    eventServer: process.env.EVENT_SERVER,
};

export const tronWeb = new TronWeb(tronConfig);

export const wallet = {
    fromAddress: tronWeb.address.fromPrivateKey(process.env.PK_FROM),
    toAddress: tronWeb.address.fromPrivateKey(process.env.PK_TO),
    toPrivateKey: process.env.PK_TO,
    fromPrivateKey: process.env.PK_FROM,
};