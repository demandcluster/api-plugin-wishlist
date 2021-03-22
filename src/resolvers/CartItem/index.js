import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodewishlistItemOpaqueId } from "../../xforms/id.js";
import productTags from "./productTags.js";

export default {
  _id: (node) => encodewishlistItemOpaqueId(node._id),
  productTags,
  shop: resolveShopFromShopId
};
