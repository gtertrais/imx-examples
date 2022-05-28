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


    function read(path: string) {
        const fileContent = fs.readFileSync(path);
        const array = JSON.parse(fileContent);
        return array;
    }

    const fs = require('fs');
    const walletArray = read('./src/holders/holders.txt');


    let assetCursor;
    let assets: any[] = [];
    do {
        const params: ImmutableMethodParams.ImmutableGetAssetsParamsTS = {
            collection: collectionContractAddress,
            user: wallet.address,
            cursor: assetCursor
        };
        let assetRequest = await user.getAssets(params);
        assets = assets.concat(assetRequest.result);
        assetCursor = assetRequest.cursor;
    } while (assetCursor);

    log.info(
        component,
        `Fetched collection with address ${collectionContractAddress}`,
    );

    let index = 100;

    walletArray.forEach(async function (value: any) {
        index = index + 1;
        console.log(value);
        console.log(index);
        if(index == 9 || index == 36 || index == 26 ){
            index = index + 1;
        }
        await user.transfer({
            sender: wallet.address.toLowerCase(),
            token: {
                type: ERC721TokenType.ERC721,
                data: {
                    tokenAddress: env.collectionContractAddress.toLowerCase(),
                    tokenId: index.toString(),
                }
            },
            quantity: BigNumber.from(1),
            receiver: value
        });
    });


    log.info(component, 'Selling assets');
})().catch(e => {
    log.error(component, e);
    process.exit(1);
});
