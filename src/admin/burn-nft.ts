import { BigNumber } from '@ethersproject/bignumber';
import { AlchemyProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ImLogger, WinstonLogger } from '@imtbl/imlogging';
import { ERC721TokenType, ImmutableMethodParams, ImmutableXClient, UpdateCollectionParams } from '@imtbl/imx-sdk';
import { requireEnvironmentVariable } from 'libs/utils';

import env from '../config/client';
import { loggerConfig } from '../config/logging';

const provider = new AlchemyProvider(env.ethNetwork, env.alchemyApiKey);
const log: ImLogger = new WinstonLogger(loggerConfig);

const component = '[IMX-UPDATE-COLLECTION]';

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



    const params: ImmutableMethodParams.ImmutableGetAssetsParamsTS = {
        collection: collectionContractAddress,
        user: wallet.address,

    };
    let assetRequest = await user.getAssets(params);
    let assets = assetRequest.result;
    console.log(assets.length);
    

    log.info(
        component,
        `Fetched collection with address ${collectionContractAddress}`,
    );


    assets.forEach(async function (value) {
        await user.burn({
            sender: wallet.address,
            token: {
                type: ERC721TokenType.ERC721,
                data: {
                    tokenId: value.token_id,
                    tokenAddress: collectionContractAddress
                }
            },
            quantity: BigNumber.from(1),
        });
    });


    log.info(component, 'Burned assets');
})().catch(e => {
    log.error(component, e);
    process.exit(1);
});
