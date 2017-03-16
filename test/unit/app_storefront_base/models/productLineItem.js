'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var ArrayList = require('../../../mocks/dw.util.Collection');
var toProductMock = require('../../../util');

describe('Product Line Item', function () {
    var ProductLineItem = proxyquire('../../../../cartridges/app_storefront_base/cartridge/models/productLineItem', {
        './product/productBase': proxyquire('../../../../cartridges/app_storefront_base/cartridge/models/product/productBase', {
            './productImages': function () {},
            './productAttributes': function () { return []; },
            '../../scripts/dwHelpers': proxyquire('../../../../cartridges/app_storefront_base/cartridge/scripts/dwHelpers', {
                'dw/util/ArrayList': ArrayList
            }),
            '../../scripts/factories/price': { getPrice: function () {} }
        }),
        'dw/util/StringUtils': {
            formatMoney: function () {
                return 'formattedMoney';
            }
        },
        'dw/value/Money': require('../../../mocks/dw.value.Money'),
        '~/cartridge/scripts/renderTemplateHelper': {
            getRenderedHtml: function () { return 'string'; }
        },
        '~/cartridge/scripts/dwHelpers': proxyquire('../../../../cartridges/app_storefront_base/cartridge/scripts/dwHelpers', {
            'dw/util/ArrayList': ArrayList
        })
    });

    var productVariantMock = {
        ID: '1234567',
        name: 'test product',
        variant: true,
        availabilityModel: {
            isOrderable: {
                return: true,
                type: 'function'
            },
            inventoryRecord: {
                ATS: {
                    value: 100
                }
            }
        },
        minOrderQuantity: {
            value: 2
        }
    };

    var productMock = {
        variationModel: {
            productVariationAttributes: new ArrayList([{
                attributeID: '',
                value: ''
            }]),
            selectedVariant: productVariantMock
        }
    };

    var priceAdjustments = new ArrayList([
        {
            promotion: {
                calloutMsg: { markup: 'string' },
                details: { markup: 'string' },
                name: 'some name'
            }
        }
    ]);

    var lineItem = {
        bonusProductLineItem: false,
        gift: false,
        UUID: 'some UUID',
        adjustedPrice: {
            value: 'some value',
            currencyCode: 'US'
        },
        priceAdjustments: priceAdjustments,
        getPrice: function () { return 'money object'; },
        product: toProductMock(productMock),
        shipment: {
            UUID: 'shipment UUID'
        }
    };

    it('should load productLineItem', function () {
        var productLineItem = new ProductLineItem(lineItem.product, null, 1, lineItem);

        assert.equal(productLineItem.productName, 'test product');
        assert.equal(productLineItem.id, 1234567);
        assert.equal(productLineItem.rating, 4);
        assert.equal(productLineItem.isBonusProductLineItem, false);
        assert.equal(productLineItem.isGift, false);
        assert.equal(productLineItem.UUID, 'some UUID');
        assert.equal(productLineItem.isOrderable, true);
        assert.deepEqual(productLineItem.priceTotal, {
            nonAdjustedPrice: 'formattedMoney',
            price: 'formattedMoney',
            renderedPrice: 'string'
        });
        assert.equal(productLineItem.quantity, 1);
        assert.equal(productLineItem.appliedPromotions.length, 1);
        assert.deepEqual(productLineItem.appliedPromotions,
            [{ callOutMsg: 'string', name: 'some name', details: 'string' }]);
        assert.equal(productLineItem.renderedPromotions, 'string');
    });
});
