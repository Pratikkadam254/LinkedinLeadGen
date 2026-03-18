/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_monitoring from "../actions/monitoring.js";
import type * as actions_outreach from "../actions/outreach.js";
import type * as actions_unipile from "../actions/unipile.js";
import type * as activities from "../activities.js";
import type * as batches from "../batches.js";
import type * as crons from "../crons.js";
import type * as leads from "../leads.js";
import type * as messages from "../messages.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/monitoring": typeof actions_monitoring;
  "actions/outreach": typeof actions_outreach;
  "actions/unipile": typeof actions_unipile;
  activities: typeof activities;
  batches: typeof batches;
  crons: typeof crons;
  leads: typeof leads;
  messages: typeof messages;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
