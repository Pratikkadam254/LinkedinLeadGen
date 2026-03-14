import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
    path: "/stripe-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.text();
        // TODO: Verify webhook signature with STRIPE_WEBHOOK_SECRET in production
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

export default http;
