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
    name: 'SCRIPTORIUM - #1. « Les Cercles de Cassiodore »',
    description: "La toute première collection de SCRIPTORIUM est conçue en signe d’hommage à Cassiodore, cet érudit né en 480 à Calabre en Italie. Sans lui, le savoir, la culture européenne, les bibliothèques et les universités ne seraient pas telles que nous les connaissons aujourd’hui ! Il a naturellement toute sa place, plus de 15 siècles plus tard, dans le Métavers. « Les Cercles de Cassiodore » sont une collection de 32 œuvres originales réalisées par le calligraphe Charles Boisart : tout simplement l’un parmi les meilleurs artistes de notre époque ! The very first collection of SCRIPTORIUM is designed as a sign of tribute to Cassiodore, this scholar born in 480 in Calabria in Italy. Without him, knowledge, European culture, libraries and universities would not be as we know them today! He naturally has its legitimacy, more than 15 centuries later, in the Metaverse. « The circles of Cassiodore » is a collection of 32 original artworks by the calligrapher Charles Boisart: quite simply one among the best artists of our time!",
    contract_address: collectionContractAddress,
    owner_public_key: ownerPublicKey,
    icon_url: 'https://fleursetfeuillages.mypinata.cloud/ipfs/QmYDGRRZP6dku7zTuuq8iPnnQG7mHvRVbJdjozDXyknPXD',
    metadata_api_url: 'https://fleursetfeuillages.mypinata.cloud/ipfs/QmUpB7nhrnoTKnEji5KVESB3QHCidgBTgCwovPpLZxvJMx',
    collection_image_url: 'https://fleursetfeuillages.mypinata.cloud/ipfs/Qmc1jxLYQSAecuCAUnuL74jHP3uTdSmYyPhZLKpRHjsSgF',
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
