import { AlchemyProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ImLogger, WinstonLogger } from '@imtbl/imlogging';
import {
  AddMetadataSchemaToCollectionParams,
  ImmutableXClient,
  MetadataTypes,
} from '@imtbl/imx-sdk';
import { requireEnvironmentVariable } from 'libs/utils';

import env from '../config/client';
import { loggerConfig } from '../config/logging';

const provider = new AlchemyProvider(env.ethNetwork, env.alchemyApiKey);
const log: ImLogger = new WinstonLogger(loggerConfig);

const component = '[IMX-ADD-COLLECTION-METADATA-SCHEMA]';

(async (): Promise<void> => {
  const privateKey = requireEnvironmentVariable('OWNER_ACCOUNT_PRIVATE_KEY');
  const collectionContractAddress = requireEnvironmentVariable(
    'COLLECTION_CONTRACT_ADDRESS',
  );

  const wallet = new Wallet(privateKey);
  const signer = wallet.connect(provider);

  const user = await ImmutableXClient.build({
    ...env.client,
    signer,
    enableDebug: true,
  });

  log.info(
    component,
    'Adding metadata schema to collection',
    collectionContractAddress,
  );

  /**
   * Edit your values here
   */
  const params: AddMetadataSchemaToCollectionParams = {
    metadata: [
      {
        name: 'name',
        type: MetadataTypes.Text,
        filterable: false,
      },
      {
        name: 'description',
        type: MetadataTypes.Text,
        filterable: false,
      },
      {
        name: 'image_url',
        type: MetadataTypes.Text,
        filterable: false,
      },
      {
        name: 'animation_url',
        type: MetadataTypes.Text,
        filterable: false,
      },
      {
        name: 'animation_url_mime_type',
        type: MetadataTypes.Text,
        filterable: false,
      },
      {
        name: 'external_url',
        type: MetadataTypes.Text,
        filterable: false,
      },
      {
        name: 'pdf',
        type: MetadataTypes.Text,
        filterable: false,
      },
      {
        name: 'rarity',
        type: MetadataTypes.Enum,
        filterable: true,
      },
      {
        name: 'project',
        type: MetadataTypes.Enum,
        filterable: true,
      },
      {
        name: 'collection',
        type: MetadataTypes.Enum,
        filterable: true,
      },
      {
        name: 'sub_collection',
        type: MetadataTypes.Enum,
        filterable: true,
      },
      {
        name: 'editor',
        type: MetadataTypes.Enum,
        filterable: true,
      },
      {
        name: 'creator',
        type: MetadataTypes.Enum,
        filterable: true,
      },
      {
        name: 'producer',
        type: MetadataTypes.Enum,
        filterable: true,
      },
      {
        name: 'sound',
        type: MetadataTypes.Enum,
        filterable: true,
      },
      {
        name: 'motion_design',
        type: MetadataTypes.Enum,
        filterable: true,
      },
      {
        name: 'domain',
        type: MetadataTypes.Enum,
        filterable: true,
      }
    ],
  };

  const collection = await user.addMetadataSchemaToCollection(
    collectionContractAddress,
    params,
  );

  log.info(
    component,
    'Added metadata schema to collection',
    collectionContractAddress,
  );
  console.log(JSON.stringify(collection, null, 2));
})().catch(e => {
  log.error(component, e);
  process.exit(1);
});
