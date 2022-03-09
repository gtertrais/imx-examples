import { AlchemyProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ImLogger, WinstonLogger } from '@imtbl/imlogging';
import { CreateCollectionParams, ImmutableXClient } from '@imtbl/imx-sdk';
import { requireEnvironmentVariable } from 'libs/utils';

import env from '../config/client';
import { loggerConfig } from '../config/logging';

const provider = new AlchemyProvider(env.ethNetwork, env.alchemyApiKey);
const log: ImLogger = new WinstonLogger(loggerConfig);

const component = '[IMX-CREATE-COLLECTION]';

(async (): Promise<void> => {
  const privateKey = requireEnvironmentVariable('OWNER_ACCOUNT_PRIVATE_KEY');
  const collectionContractAddress = requireEnvironmentVariable(
    'COLLECTION_CONTRACT_ADDRESS',
  );
  const projectId = requireEnvironmentVariable('COLLECTION_PROJECT_ID');

  const wallet = new Wallet(privateKey);
  const signer = wallet.connect(provider);
  const ownerPublicKey = wallet.publicKey;

  const user = await ImmutableXClient.build({
    ...env.client,
    signer,
    enableDebug: true,
  });

  log.info(component, 'Creating collection...', collectionContractAddress);

  /**
   * Edit your values here
   */
  const params: CreateCollectionParams = {
    name: 'Gaspard & Joseph - Hors-Série',
    description: "Découvrez la collection Hors-Série de Gaspard & Joseph. Discover Gaspard & Joseph's special collection.",
    contract_address: collectionContractAddress,
    owner_public_key: ownerPublicKey,
    icon_url: 'https://ipfs.gaspardetjoseph.fr/ipfs/QmTQmATW93frakgKtQuLukvjhmjA71kYUnXkhfW6U5AaFF/logo.png',
    metadata_api_url: 'https://ipfs.gaspardetjoseph.fr/ipfs/QmQjL895Bjs6h8fSGZaaJujxVkkq7g1GTjjqWMHro1s2nQ/IMX',
    collection_image_url: 'https://ipfs.gaspardetjoseph.fr/ipfs/QmTQmATW93frakgKtQuLukvjhmjA71kYUnXkhfW6U5AaFF/main.png',
    project_id: parseInt(projectId, 10),
  };

  let collection;
  try {
    collection = await user.createCollection(params);
  } catch (error) {
    throw new Error(JSON.stringify(error, null, 2));
  }

  log.info(component, 'Created collection');
  console.log(JSON.stringify(collection, null, 2));
})().catch(e => {
  log.error(component, e);
  process.exit(1);
});
