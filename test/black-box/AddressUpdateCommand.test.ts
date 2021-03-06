import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger } from '../../src/core/Logger';
import { AddressUpdateCommand } from '../../src/api/commands/address/AddressUpdateCommand';

describe('/RpcUpdateAddress', () => {
    const testUtil = new BlackBoxTestUtil();
    const addressService = null;
    const method =  new AddressUpdateCommand(addressService, Logger).name;

    const testData = {
        name: 'TESTING-ADDRESS-PROFILE-NAME',
        address: 'TESTING-ADDRESS-PROFILE-ADDRESS',
        shippingAddresses: [{
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            country: 'Sweden',
            zipCode: '85001'
        }]
    };

    const testDataUpdated = {
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        country: 'Finland',
        zipCode: '85001'
    };

    let profileId;
    let addressId;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should update the address', async () => {
        // set up the test data, create profile + addresses
        const addDataRes: any = await testUtil.addData('profile', testData);
        profileId = addDataRes.getBody()['result'].id;
        addressId = addDataRes.getBody()['result'].ShippingAddresses[0].id;

        // update address
        const res = await rpc(method, [
            addressId,
            testDataUpdated.title,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.zipCode,
            testDataUpdated.city,
            testDataUpdated.country,
            testDataUpdated.zipCode,
            profileId
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.addressLine1).toBe(testDataUpdated.addressLine1);
        expect(result.addressLine2).toBe(testDataUpdated.addressLine2);
        expect(result.city).toBe(testDataUpdated.city);
        expect(result.country).toBe(testDataUpdated.country);
        expect(result.zipCode).toBe(testDataUpdated.zipCode);

    });

    test('Should fail because we want to update without profile id', async () => {
        const res = await rpc(method, [
            addressId,
            testDataUpdated.title,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.zipCode,
            testDataUpdated.city,
            testDataUpdated.country
        ]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail because we want to update with an empty address', async () => {
        const getDataRes: any = await rpc(method, []);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(400);
    });
});
