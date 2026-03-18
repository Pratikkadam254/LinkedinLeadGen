"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";

function getConfig() {
  const baseUrl = process.env.UNIPILE_BASE_URL;
  const apiKey = process.env.UNIPILE_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("UNIPILE_BASE_URL and UNIPILE_API_KEY must be set");
  }
  return { baseUrl, apiKey };
}

async function unipileFetch(path: string, _accountId: string, options?: RequestInit) {
  const { baseUrl, apiKey } = getConfig();
  const url = path.startsWith("http") ? path : `${baseUrl}/api/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "X-API-KEY": apiKey,
      accept: "application/json",
      "content-type": "application/json",
      ...(options?.headers || {}),
    },
  });
  return res;
}

export const resolveProviderId = internalAction({
  args: {
    linkedinIdentifier: v.string(),
    accountId: v.string(),
  },
  handler: async (_ctx, { linkedinIdentifier, accountId }) => {
    const res = await unipileFetch(
      `/users/${linkedinIdentifier}?account_id=${accountId}`,
      accountId
    );
    if (!res.ok) {
      const text = await res.text();
      return { success: false as const, error: `${res.status}: ${text}`, providerId: null };
    }
    const profile = await res.json();
    return {
      success: true as const,
      providerId: (profile.provider_id || profile.id || null) as string | null,
      firstName: (profile.first_name || "") as string,
      lastName: (profile.last_name || "") as string,
      headline: (profile.headline || "") as string,
    };
  },
});

export const sendInvite = internalAction({
  args: {
    providerId: v.string(),
    accountId: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (_ctx, { providerId, accountId, message }) => {
    const body: Record<string, string> = {
      provider_id: providerId,
      account_id: accountId,
    };
    if (message) body.message = message;
    const res = await unipileFetch("/users/invite", accountId, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      const isAlreadyInvited = text.toLowerCase().includes("already_invited");
      return {
        success: false as const,
        alreadyInvited: isAlreadyInvited,
        error: `${res.status}: ${text}`,
        statusCode: res.status,
      };
    }
    return { success: true as const, alreadyInvited: false, error: null, statusCode: 200 };
  },
});

export const fetchRelations = internalAction({
  args: { accountId: v.string() },
  handler: async (_ctx, { accountId }) => {
    const { baseUrl, apiKey } = getConfig();
    const relations: Array<{
      public_identifier?: string;
      provider_id?: string;
      member_id?: string;
      created_at?: string | number;
    }> = [];
    let cursor: string | null = null;
    do {
      const url = new URL(`${baseUrl}/api/v1/users/relations`);
      url.searchParams.set("account_id", accountId);
      url.searchParams.set("limit", "100");
      if (cursor) url.searchParams.set("cursor", cursor);
      const res = await fetch(url.toString(), {
        headers: { "X-API-KEY": apiKey, accept: "application/json" },
      });
      if (!res.ok) break;
      const data = await res.json();
      relations.push(...(data.items || []));
      cursor = data.cursor || null;
    } while (cursor);
    return relations;
  },
});

export const fetchChats = internalAction({
  args: { accountId: v.string() },
  handler: async (_ctx, { accountId }) => {
    const { baseUrl, apiKey } = getConfig();
    const after = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const chats: Array<Record<string, unknown>> = [];
    let cursor: string | null = null;
    do {
      const url = new URL(`${baseUrl}/api/v1/chats`);
      url.searchParams.set("account_id", accountId);
      url.searchParams.set("limit", "100");
      url.searchParams.set("after", after);
      if (cursor) url.searchParams.set("cursor", cursor);
      const res = await fetch(url.toString(), {
        headers: { "X-API-KEY": apiKey, accept: "application/json" },
      });
      if (!res.ok) break;
      const data = await res.json();
      chats.push(...(data.items || []));
      cursor = data.cursor || null;
    } while (cursor);
    return chats;
  },
});

export const fetchChatMessages = internalAction({
  args: { accountId: v.string(), chatId: v.string() },
  handler: async (_ctx, { accountId, chatId }) => {
    const res = await unipileFetch(
      `/chats/${chatId}/messages?account_id=${accountId}&limit=100`,
      accountId
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []) as Array<Record<string, unknown>>;
  },
});

export const healthCheck = internalAction({
  args: { accountId: v.string() },
  handler: async (_ctx, { accountId }) => {
    const res = await unipileFetch(`/accounts/${accountId}`, accountId);
    if (!res.ok) {
      return { healthy: false, error: `API returned ${res.status}` };
    }
    const account = await res.json();
    const sources = account.sources || [];
    const allOK = sources.length > 0 &&
      sources.every((s: { status: string }) => s.status === "OK");
    return {
      healthy: allOK,
      error: allOK ? null : `Source statuses: ${sources.map((s: { status: string }) => s.status).join(", ")}`,
    };
  },
});
