'use strict';

var ShippingMgr = require('dw/order/ShippingMgr');

var collections = require('*/cartridge/scripts/util/collections');

var AddressModel = require('~/cartridge/models/address');
var ProductLineItemsModel = require('~/cartridge/models/productLineItems');
var ShippingMethodModel = require('~/cartridge/models/shipping/shippingMethod');


/**
 * Plain JS object that represents a DW Script API dw.order.ShippingMethod object
 * @param {dw.order.Shipment} shipment - the target Shipment
 * @param {Object} [address] - optional address object
 * @returns {dw.util.Collection} an array of ShippingModels
 */
function getApplicableShippingMethods(shipment, address) {
    if (!shipment) return null;

    var shipmentShippingModel = ShippingMgr.getShipmentShippingModel(shipment);

    var shippingMethods;
    if (address) {
        shippingMethods = shipmentShippingModel.getApplicableShippingMethods(address);
    } else {
        shippingMethods = shipmentShippingModel.getApplicableShippingMethods();
    }

    return collections.map(shippingMethods, function (shippingMethod) {
        return new ShippingMethodModel(shippingMethod, shipment);
    });
}

/**
 * Plain JS object that represents a DW Script API dw.order.ShippingMethod object
 * @param {dw.order.Shipment} shipment - the target Shipment
 * @returns {ProductLineItemsModel} an array of ShippingModels
 */
function getProductLineItemsModel(shipment) {
    if (!shipment) return null;

    return new ProductLineItemsModel(shipment.productLineItems);
}

/**
 * Plain JS object that represents a DW Script API dw.order.ShippingMethod object
 * @param {dw.order.Shipment} shipment - the target Shipment
 * @returns {Object} a ShippingMethodModel object
 */
function getSelectedShippingMethod(shipment) {
    if (!shipment) return null;

    var method = shipment.shippingMethod;

    return method ? new ShippingMethodModel(method, shipment) : null;
}

/**
 * ppingMethod object
 * @param {dw.order.Shipment} shipment - the target Shipment
 * @returns {string} the Shipment UUID or null
 */
function getShipmentUUID(shipment) {
    if (!shipment) return null;

    return shipment.UUID;
}

/**
 * Returns the matching address ID or UUID for a shipping address
 * @param {dw.order.Shipment} shipment - line items model
 * @param {Object} customer - customer model
 * @return {string|boolean} returns matching ID or false
*/
function getAssociatedAddress(shipment, customer) {
    var address = shipment ? shipment.shippingAddress : null;
    var matchingId;
    var anAddress;

    if (!address) return false;

    // If we still haven't found a match, then loop through customer addresses to find a match
    if (!matchingId && customer && customer.addressBook && customer.addressBook.addresses) {
        for (var j = 0, jj = customer.addressBook.addresses.length; j < jj; j++) {
            anAddress = customer.addressBook.addresses[j];

            if (anAddress && anAddress.isEquivalentAddress(address)) {
                matchingId = anAddress.ID;
                break;
            }
        }
    }

    return matchingId;
}

/**
 * @constructor
 * @classdesc Model that represents shipping information
 *
 * @param {dw.order.Shipment} shipment - the default shipment of the current basket
 * @param {Object} address - the address to use to filter the shipping method list
 * @param {Object} customer - the current customer model
 */
function ShippingModel(shipment, address, customer) {
	// Simple properties
    this.UUID = getShipmentUUID(shipment);

	// Derived properties
    this.productLineItems = getProductLineItemsModel(shipment);
    this.applicableShippingMethods = getApplicableShippingMethods(shipment, address);
    this.selectedShippingMethod = getSelectedShippingMethod(shipment);
    this.matchingAddressId = getAssociatedAddress(shipment, customer);

    // Optional properties
    if (shipment && shipment.shippingAddress) {
        this.shippingAddress = new AddressModel(shipment.shippingAddress).address;
    } else {
        this.shippingAddress = address;
    }
}

module.exports = ShippingModel;
