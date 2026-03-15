/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as campaigns from "../campaigns.js";
import type * as credits from "../credits.js";
import type * as extensions from "../extensions.js";
import type * as leads from "../leads.js";
import type * as strategies from "../strategies.js";
import type * as users from "../users.js";
import type * as actions_autopilot from "../actions/autopilot.js";
import type * as actions_strategy from "../actions/strategy.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  campaigns: typeof campaigns;
  credits: typeof credits;
  extensions: typeof extensions;
  leads: typeof leads;
  strategies: typeof strategies;
  users: typeof users;
  "actions/autopilot": typeof actions_autopilot;
  "actions/strategy": typeof actions_strategy;
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
