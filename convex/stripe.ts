import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const createCheckoutSession = action({
    args: {
        clerkId: v.string(),
        planId: v.union(v.literal("pro"), v.literal("elite")),
    },
    handler: async (ctx, args): Promise<{ url: string; sessionId: string }> => {
        const user = await ctx.runQuery(api.users.getByClerkId, { clerkId: args.clerkId });
        if (!user) throw new Error("User not found");

        const priceId: string = args.planId === "pro"
            ? process.env.STRIPE_PRO_PRICE_ID!
            : process.env.STRIPE_ELITE_PRICE_ID!;

        let customerId: string | undefined = user.stripeCustomerId;
        if (!customerId) {
            const customerRes: Response = await fetch("https://api.stripe.com/v1/customers", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    email: user.email,
                    "metadata[clerkId]": user.clerkId,
                }),
            });
            const customer: { id: string; error?: { message: string } } = await customerRes.json();
            if (customer.error) throw new Error(customer.error.message);
            customerId = customer.id;
        }

        const sessionRes: Response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                customer: customerId!,
                mode: "subscription",
                "line_items[0][price]": priceId,
                "line_items[0][quantity]": "1",
                "success_url": `${process.env.APP_URL || "http://localhost:5173"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
                "cancel_url": `${process.env.APP_URL || "http://localhost:5173"}/#pricing`,
                "metadata[clerkId]": args.clerkId,
                "metadata[planId]": args.planId,
            }),
        });

        const session: { url: string; id: string; error?: { message: string } } = await sessionRes.json();
        if (session.error) throw new Error(session.error.message);

        return { url: session.url, sessionId: session.id };
    },
});

export const createPortalSession = action({
    args: { clerkId: v.string() },
    handler: async (ctx, args): Promise<{ url: string }> => {
        const user = await ctx.runQuery(api.users.getByClerkId, { clerkId: args.clerkId });
        if (!user?.stripeCustomerId) throw new Error("No billing account found");

        const res: Response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                customer: user.stripeCustomerId,
                "return_url": `${process.env.APP_URL || "http://localhost:5173"}/dashboard/settings`,
            }),
        });

        const session: { url: string; error?: { message: string } } = await res.json();
        if (session.error) throw new Error(session.error.message);

        return { url: session.url };
    },
});
