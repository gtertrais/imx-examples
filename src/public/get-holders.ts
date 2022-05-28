import { ImLogger, WinstonLogger } from '@imtbl/imlogging';
import { ImmutableMethodParams, ImmutableXClient } from '@imtbl/imx-sdk';
import { requireEnvironmentVariable } from 'libs/utils';

import env from '../config/client';
import { loggerConfig } from '../config/logging';

const log: ImLogger = new WinstonLogger(loggerConfig);

const fs = require('fs');

const component = '[IMX-GET-COLLECTION]';

(async (): Promise<void> => {
    const collectionContractAddress = '0x4f1536b8fc15ec9d9177b9f27198883b96bcb257'

    const user = await ImmutableXClient.build({
        ...env.client,
        enableDebug: true,
    });

    log.info(component, `Fetching holders...`, collectionContractAddress);


    let assetCursor;
    let assets: any[] = [];
    do {
        const params: ImmutableMethodParams.ImmutableGetAssetsParamsTS = {
            collection: collectionContractAddress,
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

    const result = assets.filter((thing, index, self) =>
        index === self.findIndex((t) => (
            t.user === thing.user
        ))
    )

    let index = 0;
    var dataArray: any[] = [];
    result.forEach(function (value) {
        index++;
        console.log(value.user);
        dataArray.push(value.user);
    });

    console.log(index);

    fs.writeFileSync("./src/holders/holders.txt", JSON.stringify(dataArray), 'utf8', function (err: any) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });


})().catch(e => {
    log.error(component, e);
    process.exit(1);
});
