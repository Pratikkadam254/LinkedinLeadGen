import { action } from "../_generated/server";
import { v } from "convex/values";

// Generate a Unipile hosted auth link for LinkedIn account connection
export const getConnectionLink = action({
    args: {
        callbackUrl: v.string(),
    },
    handler: async (_ctx, args) => {
        const dsn = process.env.UNIPILE_DSN;
        const apiKey = process.env.UNIPILE_API_KEY;

        if (!dsn || !apiKey) {
            throw new Error("Unipile is not configured. Set UNIPILE_DSN and UNIPILE_API_KEY in Convex environment variables.");
        }

        const response = await fetch(`https://${dsn}/api/v1/hosted/accounts/link`, {
            method: "POST",
            headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                providers: ["LINKEDIN"],
                success_redirect_url: args.callbackUrl,
                failure_redirect_url: args.callbackUrl,
                notify_url: `${process.env.APP_URL || args.callbackUrl}/api/unipile-webhook`,
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Unipile link generation failed:", response.status, errBody);
            throw new Error(`Failed to generate connection link: ${response.status}`);
        }

        const data = await response.json();
        return { url: data.url };
    },
});

// Check if a Unipile account is connected and get its status
export const checkConnectionStatus = action({
    args: {
        accountId: v.string(),
    },
    handler: async (_ctx, args) => {
        const dsn = process.env.UNIPILE_DSN;
        const apiKey = process.env.UNIPILE_API_KEY;

        if (!dsn || !apiKey) {
            return { connected: false, error: "Unipile not configured" };
        }

        try {
            const response = await fetch(`https://${dsn}/api/v1/accounts/${args.accountId}`, {
                method: "GET",
                headers: {
                    "X-API-KEY": apiKey,
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                return { connected: false, error: `Account check failed: ${response.status}` };
            }

            const account = await response.json();
            return {
                connected: account.status === "OK" || account.status === "connected",
                status: account.status,
                provider: account.provider,
            };
        } catch (err) {
            console.error("Unipile connection check failed:", err);
            return { connected: false, error: "Network error" };
        }
    },
});
