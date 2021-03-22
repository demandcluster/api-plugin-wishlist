import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Account: "reaction/account",
  Address: "reaction/address",
  wishlist: "reaction/wishlist",
  wishlistItem: "reaction/wishlistItem",
  FulfillmentGroup: "reaction/fulfillmentGroup",
  Product: "reaction/product",
  Shop: "reaction/shop"
};

export const encodeAccountOpaqueId = encodeOpaqueId(namespaces.Account);
export const encodeAddressOpaqueId = encodeOpaqueId(namespaces.Address);
export const encodewishlistItemOpaqueId = encodeOpaqueId(namespaces.wishlistItem);
export const encodewishlistOpaqueId = encodeOpaqueId(namespaces.wishlist);
export const encodeFulfillmentGroupOpaqueId = encodeOpaqueId(namespaces.FulfillmentGroup);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

export const decodeAccountOpaqueId = decodeOpaqueIdForNamespace(namespaces.Account);
export const decodeAddressOpaqueId = decodeOpaqueIdForNamespace(namespaces.Address);
export const decodewishlistItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.wishlistItem);
export const decodewishlistOpaqueId = decodeOpaqueIdForNamespace(namespaces.wishlist);
export const decodeFulfillmentGroupOpaqueId = decodeOpaqueIdForNamespace(namespaces.FulfillmentGroup);
export const decodeProductOpaqueId = decodeOpaqueIdForNamespace(namespaces.Product);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);

/**
 * @param {Object[]} items Array of wishlistItemInput
 * @returns {Object[]} Same array with all IDs transformed to internal
 */
export function decodewishlistItemsOpaqueIds(items) {
  return items.map((item) => ({
    ...item,
    productConfiguration: {
      productId: decodeProductOpaqueId(item.productConfiguration.productId),
      productVariantId: decodeProductOpaqueId(item.productConfiguration.productVariantId)
    }
  }));
}
