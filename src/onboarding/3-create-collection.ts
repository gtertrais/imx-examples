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
    name: 'Raverse',
    description: "In the early 90s we were the only video artists crew authorized to shoot what was happening in RAVE parties across Europe. We kept all that precious material for thirty years. We digitized tape after tape. For us, it is the right time to share these historical assets. We hope our archives can create a link between generations. WELCOME TO THE RAVERSE!",
    contract_address: collectionContractAddress,
    owner_public_key: ownerPublicKey,
    icon_url: 'https://gateway.pinata.cloud/ipfs/QmSLrZ8BhSkumPR3P6ofS5R67Kv4RGBxpqJKp54iovXYTR/Gif-bannie%CC%80re-plus-grand-moyennement.gif',
    metadata_api_url: 'https://ipfs.gaspardetjoseph.fr/ipfs/QmaAy8Vs5xGC4DSgcU5mkh4bECrXFfLm4EowpXR8xVGNKF',
    collection_image_url: 'https://gateway.pinata.cloud/ipfs/QmSLrZ8BhSkumPR3P6ofS5R67Kv4RGBxpqJKp54iovXYTR/Gif-bannie%CC%80re-plus-grand-moyennement.gif',
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
