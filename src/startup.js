import Logger from "@reactioncommerce/logger";
import updatewishlistItemsForVariantChanges from "./util/updatewishlistItemsForVariantChanges.js";
import { MAX_wishlist_COUNT as SAVE_MANY_wishlistS_LIMIT } from "./mutations/saveManywishlists.js";

const logCtx = { name: "wishlist", file: "startup" };

/**
 * @param {Object[]} catalogProductVariants The `product.variants` array from a catalog item
 * @returns {Object[]} All variants and their options flattened in one array
 */
function getFlatVariantsAndOptions(catalogProductVariants) {
  const variants = [];

  catalogProductVariants.forEach((variant) => {
    variants.push(variant);
    if (variant.options) {
      variant.options.forEach((option) => {
        variants.push(option);
      });
    }
  });

  return variants;
}

/**
 * @param {Object} wishlist wishlist collection
 * @param {Object} context App context
 * @param {String} variant The catalog product variant or option
 * @returns {Promise<null>} Promise that resolves with null
 */
async function updateAllwishlistsForVariant({ wishlist, context, variant }) {
  const { mutations, queries } = context;
  const { variantId } = variant;

  Logger.debug({ ...logCtx, variantId, fn: "updateAllwishlistsForVariant" }, "Running updateAllwishlistsForVariant");

  let updatedwishlists = [];

  /**
   * @summary Bulk save an array of updated wishlists
   * @return {undefined}
   */
  async function savewishlists() {
    if (updatedwishlists.length === 0) return;
    await mutations.saveManywishlists(context, updatedwishlists);
    updatedwishlists = [];
  }

  /**
   * @summary Get updated prices for a single wishlist, and check whether there are any changes.
   *   If so, push into `bulkWrites` array.
   * @param {Object} wishlist The wishlist
   * @return {undefined}
   */
  async function updateOnewishlist(wishlist) {
    const prices = await queries.getVariantPrice(context, variant, wishlist.currencyCode);
    if (!prices) return;

    const { didUpdate, updatedItems } = updatewishlistItemsForVariantChanges(wishlist.items, variant, prices);
    if (!didUpdate) return;

    updatedwishlists.push({ ...wishlist, items: updatedItems });
  }

  // Do find + update because we need the `wishlist.currencyCode` to figure out pricing
  // and we need current quantity to recalculate `subtotal` for each item.
  // It should be fine to load all results into an array because even for large shops,
  // there will likely not be a huge number of the same product in wishlists at the same time.
  const wishlistsCursor = wishlist.find({ "items.variantId": variantId });

  /* eslint-disable no-await-in-loop */
  let wishlist = await wishlistsCursor.next();
  while (wishlist) {
    await updateOnewishlist(wishlist);

    if (updatedwishlists.length === SAVE_MANY_wishlistS_LIMIT) {
      await savewishlists();
    }

    wishlist = await wishlistsCursor.next();
  }
  /* eslint-enable no-await-in-loop */

  // Flush remaining wishlist updates
  await savewishlists();

  return null;
}

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function wishlistStartup(context) {
  const { appEvents, collections } = context;
  const { wishlist } = collections;

  // When an order is created, delete the source wishlist
  appEvents.on("afterOrderCreate", async ({ order }) => {
    const { wishlistId } = order;
    if (wishlistId) {
      const { result } = await wishlist.deleteOne({ _id: wishlistId });
      if (result.ok !== 1) {
        Logger.warn(`MongoDB error trying to delete wishlist ${wishlistId} in "afterOrderCreate" listener. Check MongoDB logs.`);
      }
    }
  });

  // Propagate any price changes to all corresponding wishlist items
  appEvents.on("afterPublishProductToCatalog", async ({ catalogProduct }) => {
    const { _id: catalogProductId, variants } = catalogProduct;

    Logger.debug({ ...logCtx, catalogProductId, fn: "startup" }, "Running afterPublishProductToCatalog");

    const variantsAndOptions = getFlatVariantsAndOptions(variants);

    // Update all wishlist items that are linked with the updated variants.
    await Promise.all(variantsAndOptions.map((variant) => updateAllwishlistsForVariant({ wishlist, context, variant })));
  });
}
