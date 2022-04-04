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
        const params: ImmutableMethodParams.ImmutableGetAssetsParamsTS = {
            collection: collectionContractAddress,
            user: wallet.address,
            cursor: assetCursor
        };
        let assetRequest = await user.getAssets(params);
        assets = assets.concat(assetRequest.result);
        assetCursor = assetRequest.cursor;

    log.info(
        component,
        `Fetched collection with address ${collectionContractAddress}`,
    );

        let count = 0;

    assets.forEach(async function (value) {
        if(count < 100){
            await user.createOrder({
                user: wallet.address.toLowerCase(),
                amountSell: BigNumber.from(1),
                tokenSell: {
                    type: ERC721TokenType.ERC721,
                    data: {
                        tokenAddress: env.collectionContractAddress.toLowerCase(),
                        tokenId: value.token_id,
                    }
                },
                amountBuy: BigNumber.from('60000000000000000'),//0.0666 ETH (qjouter les royalties)
                tokenBuy: {
                    type: ETHTokenType.ETH,
                    data: {
                        decimals: 18
                    }
                },
            });
        }
     count = count+1
    });


    log.info(component, 'Selling assets');
})().catch(e => {
    log.error(component, e);
    process.exit(1);
});
