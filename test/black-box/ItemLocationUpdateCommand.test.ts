import { rpc, api } from './lib/api';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { Logger } from '../../src/core/Logger';
import { ItemLocationUpdateCommand } from '../../src/api/commands/itemlocation/ItemLocationUpdateCommand';

describe('/ItemLocationUpdateCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const itemLocationService = null;
    const listingItemTemplateService = null;
    const method =  new ItemLocationUpdateCommand(itemLocationService, listingItemTemplateService, Logger).name;

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            listingItemId: null,
            itemCategory: {
                key: 'cat_high_luxyry_items'
            },
            itemLocation: {
                region: 'China',
                address: 'USA'
            }
        },
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;

    const testDataUpdated = ['China', 'USA', 'TITLE', 'TEST DESCRIPTION', 25.7, 22.77];

    let createdTemplateId;
    let createdItemInformationId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // profile
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        // create item template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const result: any = addListingItemTempRes.getBody()['result'];
        createdTemplateId = result.id;
        createdItemInformationId = result.ItemInformation.id;
        testDataUpdated.unshift(createdTemplateId);

    });

    test('Should update item location and set null location marker fields', async () => {
        // update item location
        const addDataRes: any = await rpc(method, [createdTemplateId, testDataUpdated[1], testDataUpdated[2]]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];

        expect(result.region).toBe(testDataUpdated[1]);
        expect(result.address).toBe(testDataUpdated[2]);
        expect(result.itemInformationId).toBe(createdItemInformationId);
    });

    test('Should update item location', async () => {
        // update item location
        const addDataRes: any = await rpc(method, testDataUpdated);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];
        expect(result.region).toBe(testDataUpdated[1]);
        expect(result.address).toBe(testDataUpdated[2]);
        expect(result.itemInformationId).toBe(createdItemInformationId);
        expect(result.LocationMarker.markerTitle).toBe(testDataUpdated[3]);
        expect(result.LocationMarker.markerText).toBe(testDataUpdated[4]);
        expect(result.LocationMarker.lat).toBe(testDataUpdated[5]);
        expect(result.LocationMarker.lng).toBe(testDataUpdated[6]);
    });

    test('Should fail because we want to update without reason', async () => {
        const addDataRes: any = await rpc(method, [createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(400);
        expect(addDataRes.error.error.message).toBe('Request body is not valid');
    });

    test('Should fail because we want to update without address', async () => {
        const addDataRes: any = await rpc(method, [createdTemplateId, 'USA']);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(400);
        expect(addDataRes.error.error.message).toBe('Request body is not valid');
    });

    // ItemLocation cannot be updated if there's a ListingItem related to ItemInformations ItemLocation. (the item has allready been posted)
    test('Should not update item location because item information is related with listing item', async () => {
        // create listing item
        const listingItems = await testUtil.generateData('listingitem', 1);
        const testData = listingItems[0];
        const listingItemId = testData['id'];
        // set listing item id in item information
        testDataListingItemTemplate.itemInformation.listingItemId = listingItemId;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        // create new  item template
        const newListingItemTemplate = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const newTemplateId = newListingItemTemplate.getBody()['result'].id;

        // update item location
        const addDataRes: any = await rpc(method, [newTemplateId, 'China', 'TEST ADDRESS', 'TEST TITLE', 'TEST DESC', 55.6, 60.8]);

        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('ItemLocation cannot be updated because the item has allready been posted!');
    });

});


