import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";

import {
  wishlist,
  wishlistAddress,
  wishlistInvoice,
  wishlistItem,
  ShipmentQuote
} from "../simpleSchemas.js";

const schemasToAddToFactory = {
  wishlist,
  wishlistAddress,
  wishlistInvoice,
  wishlistItem,
  ShipmentQuote
};

// Adds each to `Factory` object. For example, `Factory.wishlist`
// will be the factory that builds an object that matches the
// `wishlist` schema.
Object.keys(schemasToAddToFactory).forEach((key) => {
  createFactoryForSchema(key, schemasToAddToFactory[key]);
});

export default Factory;
