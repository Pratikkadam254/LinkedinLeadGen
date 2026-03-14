import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
    path: "/stripe-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.text();

        // Verify Stripe webhook signature
        const sigHeader = request.headers.get("stripe-signature");
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (webhookSecret && sigHeader) {
            const parts = Object.fromEntries(
                sigHeader.split(",").map((p) => {
                    const [k, v] = p.split("=");
                    return [k, v];
                })
            );
            const timestamp = parts["t"];
            const expectedSig = parts["v1"];
            if (!timestamp || !expectedSig) {
                return new Response("Invalid signature header", { status: 400 });
            }
            const payload = `${timestamp}.${body}`;
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(webhookSecret),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );
            const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
            const computedSig = Array.from(new Uint8Array(sigBuffer))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
            if (computedSig !== expectedSig) {
                return new Response("Invalid signature", { status: 400 });
            }
            // Reject if timestamp is older than 5 minutes
            const tolerance = 300;
            const now = Math.floor(Date.now() / 1000);
            if (Math.abs(now - parseInt(timestamp)) > tolerance) {
                return new Response("Timestamp too old", { status: 400 });
            }
        }

        const event = JSON.parse(body);

        const PLAN_LIMITS = {
            pro: { leadsPerMonth: 500, outreachPerMonth: 200, linkedInAccounts: 1 },
            elite: { leadsPerMonth: 2000, outreachPerMonth: 800, linkedInAccounts: 3 },
        };

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const clerkId = session.metadata?.clerkId;
                const planId = session.metadata?.planId as "pro" | "elite";

                if (!clerkId || !planId) break;

                await ctx.runMutation(api.users.updateSubscription, {
                    clerkId,
                    plan: planId,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    subscriptionStatus: "active",
                    planLimits: PLAN_LIMITS[planId],
                });
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object;
                if (subscription.status === "past_due" || subscription.status === "canceled") {
                    await ctx.runMutation(api.users.cancelSubscription, {
                        stripeCustomerId: subscription.customer,
                    });
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                await ctx.runMutation(api.users.cancelSubscription, {
                    stripeCustomerId: subscription.customer,
                });
                break;
            }
        }

        return new Response("OK", { status: 200 });
    }),
});

// Unipile webhook — handles LinkedIn connection and message events
http.route({
    path: "/unipile-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.text();
        const event = JSON.parse(body);

        const eventType = event.event || event.type;
        const data = event.data || event;

        switch (eventType) {
            case "connection.accepted": {
                // A connection request was accepted by the recipient
                const linkedInUrl = data.recipient_url || data.profile_url;
                if (linkedInUrl) {
                    await ctx.runMutation(api.leads.updateOutreachStatus, {
                        linkedInUrl,
                        status: "accepted",
                    });
                }
                break;
            }

            case "message.delivered": {
                // A message was successfully delivered
                const linkedInUrl = data.recipient_url || data.profile_url;
                if (linkedInUrl) {
                    await ctx.runMutation(api.leads.updateOutreachStatus, {
                        linkedInUrl,
                        status: "sent",
                    });
                }
                break;
            }

            case "message.received": {
                // The lead replied to our message
                const linkedInUrl = data.sender_url || data.profile_url;
                if (linkedInUrl) {
                    await ctx.runMutation(api.leads.updateOutreachStatus, {
                        linkedInUrl,
                        status: "replied",
                    });
                }
                break;
            }

            case "account.disconnected": {
                // LinkedIn account was disconnected — notify via console
                console.warn("Unipile: LinkedIn account disconnected", data.account_id);
                break;
            }
        }

        return new Response("OK", { status: 200 });
    }),
});

export default http;
