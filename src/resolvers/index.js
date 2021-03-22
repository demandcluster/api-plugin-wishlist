import wishlist from "./wishlist/index.js";
import wishlistItem from "./wishlistItem/index.js";
import FulfillmentGroup from "./FulfillmentGroup/index.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";

/**
 * wishlist related GraphQL resolvers
 * @namespace wishlist/GraphQL
 */

export default {
  wishlist,
  wishlistItem,
  FulfillmentGroup,
  Mutation,
  PaymentMethodData: {
    __resolveType(obj) {
      return obj.gqlType;
    }
  },
  PaymentData: {
    __resolveType(obj) {
      return obj.gqlType;
    }
  },
  Query
};
