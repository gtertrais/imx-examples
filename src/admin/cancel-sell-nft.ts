import { BigNumber } from '@ethersproject/bignumber';
import { AlchemyProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ImLogger, WinstonLogger } from '@imtbl/imlogging';
import { ERC721TokenType, ETHTokenType, ImmutableMethodParams, ImmutableXClient, UpdateCollectionParams } from '@imtbl/imx-sdk';
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



    let assetCursor;
    let assets: any[] = [];
    do {
        const params: ImmutableMethodParams.ImmutableGetAssetsParamsTS = {
            cursor: assetCursor,
            user: wallet.address, 
            sell_orders: true
        };
        let assetRequest = await user.getAssets(params);
        assets = assets.concat(assetRequest.result);
        
        assetCursor = assetRequest.cursor;
    } while (assetCursor);

    log.info(
        component,
        `Fetched collection with address ${collectionContractAddress}`,
    );



    assets.forEach(async function (value) {
        
        await user.cancelOrder(
            value.orders.sell_orders[0].order_id
        );
        
    });


    log.info(component, 'Cancel Sell assets');
})().catch(e => {
    log.error(component, e);
    process.exit(1);
});
