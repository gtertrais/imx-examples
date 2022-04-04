import { AlchemyProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ImLogger, WinstonLogger } from '@imtbl/imlogging';
import { ImmutableXClient, ImmutableMethodParams } from '@imtbl/imx-sdk';
import { parse } from 'ts-command-line-args';

import env from './config/client';
import { loggerConfig } from './config/logging';

interface BulkMintScriptArgs {
  wallet: string;
  number: number;
}

const provider = new AlchemyProvider(env.ethNetwork, env.alchemyApiKey);
const log: ImLogger = new WinstonLogger(loggerConfig);
const component = 'imx-bulk-mint-script';

const waitForTransaction = async (promise: Promise<string>) => {
  const txId = await promise;
  log.info(component, 'Waiting for transaction', {
    txId,
    etherscanLink: `https://etherscan.io/tx/${txId}`,
    alchemyLink: `https://dashboard.alchemyapi.io/mempool/eth-mainnet/tx/${txId}`,
  });
  const receipt = await provider.waitForTransaction(txId);
  if (receipt.status === 0) {
    throw new Error('Transaction rejected');
  }
  log.info(component, `Transaction Mined: ${receipt.blockNumber}`);
  return receipt;
};

(async (): Promise<void> => {
  const BULK_MINT_MAX = env.bulkMintMax;
  const IPFS_URL = env.ipfsCid;
  const { wallet, number } = parse<BulkMintScriptArgs>({
    wallet: {
      type: String,
      alias: 'w',
      description: 'Wallet to receive minted NFTs',
    },
    number: {
      type: Number,
      alias: 'n',
      description: `Number of NFTS to mint. Maximum: ${BULK_MINT_MAX}`,
    },
  });
  if (number >= Number(BULK_MINT_MAX))
    throw new Error(`tried to mint too many tokens. Maximum ${BULK_MINT_MAX}`);

  const tokenId = parseInt(env.tokenId, 10);
  console.log('tokenId');
  console.log(tokenId);

  const minter = await ImmutableXClient.build({
    ...env.client,
    signer: new Wallet(env.privateKey1).connect(provider),
  });

  log.info(component, 'MINTER REGISTRATION');
  const registerImxResult = await minter.registerImx({
    etherKey: minter.address.toLowerCase(),
    starkPublicKey: minter.starkPublicKey,
  });

  if (registerImxResult.tx_hash === '') {
    log.info(component, 'Minter registered, continuing...');
  } else {
    log.info(component, 'Waiting for minter registration...');
    await waitForTransaction(Promise.resolve(registerImxResult.tx_hash));
  }

  log.info(component, `OFF-CHAIN MINT ${number} NFTS`);

  const tokens = Array.from({ length: number }, (_, i) => i).map(i => ({
      id: (tokenId + i).toString(),
      blueprint: "ipfs://" + IPFS_URL + "/" + (tokenId + i).toString(),
    }));

  const payload: ImmutableMethodParams.ImmutableOffchainMintV2ParamsTS = [
    {
      contractAddress: env.tokenAddress, // NOTE: a mintable token contract is not the same as regular erc token contract
      users: [
        {
          etherKey: wallet.toLowerCase(),
          tokens,
        },
      ],
      royalties: [ // global fees
        {
          recipient: "0x8e5f7fAD01819BF29cfD637C88D7977f7bC59BCd",//unknown artists - 5%
          percentage: 0.5
        },
        {
          recipient: "0x47cDd0F1c9332168db926eE5B4E5663c9ba20F05",//artist Haiti - 5%
          percentage: 0.5
        },
        {
          recipient: "0x7E9e3478C203bC5efA1460365185d35Fcb488915",//artist Peznas - 5%
          percentage: 0.5
        },
        {
          recipient: "0x1689B564814db5f1C7Abd74129771D282E2d652b",//MoCa - 5%
          percentage: 0.5
        },
        {
          recipient: "0x3E4A99ffBb1B1e1A29B9C215d9B7962dbd59c35e",//AlphaVerse - 5%
          percentage: 0.5
        },
        {
          recipient: "0x8C74C7ec112BCb2a668F5534380719dA8A55f60e",//G&J - 5%
          percentage: 0.5
        },
        {
          recipient: "0x6b823fbf452678187327cBDcf711B14F1A918126",//Chac - 70%
          percentage: 7.0
        }
      ],
    },
  ]

  
  const result = await minter.mintV2(payload);
  console.log(result);
})().catch(e => {
  log.error(component, e);
  process.exit(1);
});
