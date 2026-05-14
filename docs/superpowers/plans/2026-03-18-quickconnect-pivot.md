# QuickConnect Pivot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform LeadFlow AI into QuickConnect — a dead-simple micro-SaaS where users upload a CSV of LinkedIn profiles, and we send connection requests via Unipile API with real-time tracking.

**Architecture:** Strip all AI/strategy/scoring/campaign code. Replace with a batch-oriented model: users upload CSVs as "batches", each batch gets processed by Convex cron actions that call Unipile API to send invites, then monitor for accepts/replies. Frontend becomes a simple dashboard with metric cards, progress bar, and activity feed.

**Tech Stack:** React 18 + Vite + Tailwind CSS + Convex (backend) + Clerk (auth) + Unipile API (LinkedIn). Remove `@google/generative-ai`.

**Reference code locations:**
- Unipile edge functions (proven, port to Convex): `D:\LeadGenSaaS\context\edgefunctions\`
- n8n sending workflow (API call reference): `D:\LeadGenSaaS\backend-n8n-workflowusedwithdashbaord.json`
- Full reference dashboard app: `/tmp/andrew-linkedin-dashboard/`

---

## File Structure

### Files to DELETE
```
convex/actions/strategy.ts          # AI strategy generation
convex/actions/autopilot.ts         # AI autopilot / n8n
convex/strategies.ts                # Strategy CRUD
convex/campaigns.ts                 # Campaign CRUD
src/pages/StrategyPage.tsx          # Strategy builder UI
src/pages/ConnectPage.tsx           # Old connect page (rebuild as onboarding step)
src/components/dashboard/AIMessageGenerator.tsx
src/lib/aiMessages.ts               # AI message generation
src/lib/messageGenerator.ts         # Message templates
src/lib/leadScoring.ts              # Lead scoring
src/lib/scoring.ts                  # Scoring utils
src/lib/unipile.ts                  # Mock Unipile (replace with real Convex actions)
src/contexts/UnipileContext.tsx     # Mock context (replace)
src/data/mockLeads.ts               # Mock data
src/data/onboardingQuestions.ts     # Old 8-step questions
src/pages/CampaignsPage.tsx        # Campaign page (if exists)
```

### Files to CREATE
```
convex/batches.ts                   # Batch CRUD + stats queries
convex/messages.ts                  # Reply message tracking
convex/actions/unipile.ts           # All Unipile API calls (send, check, detect, health)
convex/actions/outreach.ts          # Outreach processing engine (cron target)
convex/actions/monitoring.ts        # Connection/reply checking (cron target)
convex/lib/linkedin.ts              # Shared utility: extractIdentifier
src/pages/OnboardingPage.tsx        # REWRITE: 2-step (connect LinkedIn → upload CSV)
src/pages/BatchDetailPage.tsx       # Individual batch view with leads table
src/components/dashboard/MetricCards.tsx       # Sent/Accepted/Replies/etc cards
src/components/dashboard/BatchProgress.tsx    # Progress bar + ETA + controls
src/components/dashboard/ActivityFeed.tsx      # Recent activity list
src/components/dashboard/BatchHistory.tsx      # Past batches table
src/components/dashboard/StatusBanner.tsx      # Warning/error banners
src/components/onboarding/ConnectLinkedIn.tsx  # Unipile connection step
src/components/onboarding/UploadFirstCSV.tsx   # First CSV upload step
src/hooks/useBatches.ts             # Batch queries & mutations
src/hooks/usePolling.ts             # 30s auto-refresh hook
```

### Files to MODIFY
```
convex/schema.ts         # Complete rewrite (users, batches, leads, messages, activities)
convex/users.ts          # Simplify (remove preferences, add Unipile fields)
convex/leads.ts          # Major rewrite (remove scoring/messages, add batch support)
convex/activities.ts     # Update activity types
convex/crons.ts          # New cron schedule (outreach, connections, replies, health)
src/App.tsx              # New routes (remove strategy/connect, add batch/:id)
src/pages/DashboardPage.tsx   # Complete rewrite (metric cards, progress, activity)
src/pages/UploadPage.tsx      # Simplify (LinkedIn URL only required, message detection)
src/pages/LandingPage.tsx     # Simplify (strip AI messaging)
src/lib/csvParser.ts     # Simplify (only LinkedIn URL required, add message column detection)
src/components/layout/Sidebar.tsx  # Simplify nav (remove campaigns/strategy/leads)
src/hooks/useLeads.ts    # Adapt for batch context
package.json             # Remove @google/generative-ai
```

---

## Phase 1: Backend Cleanup & New Schema

### Task 1: Delete unused files and remove AI dependency

**Files:**
- Delete: `convex/actions/strategy.ts`, `convex/actions/autopilot.ts`, `convex/strategies.ts`, `convex/campaigns.ts`
- Delete: `src/pages/StrategyPage.tsx`, `src/pages/ConnectPage.tsx`
- Delete: `src/components/dashboard/AIMessageGenerator.tsx`
- Delete: `src/lib/aiMessages.ts`, `src/lib/messageGenerator.ts`, `src/lib/leadScoring.ts`, `src/lib/scoring.ts`
- Delete: `src/lib/unipile.ts`, `src/contexts/UnipileContext.tsx`
- Delete: `src/data/mockLeads.ts`, `src/data/onboardingQuestions.ts`
- Modify: `package.json`

- [ ] **Step 1: Delete all AI/strategy/campaign backend files**

```bash
rm convex/actions/strategy.ts convex/actions/autopilot.ts convex/strategies.ts convex/campaigns.ts
```

- [ ] **Step 2: Delete unused frontend files**

```bash
rm src/pages/StrategyPage.tsx src/pages/ConnectPage.tsx
rm src/components/dashboard/AIMessageGenerator.tsx
rm src/lib/aiMessages.ts src/lib/messageGenerator.ts src/lib/leadScoring.ts src/lib/scoring.ts
rm src/lib/unipile.ts src/contexts/UnipileContext.tsx
rm src/data/mockLeads.ts src/data/onboardingQuestions.ts
```

- [ ] **Step 3: Remove `@google/generative-ai` from package.json**

In `package.json`, remove the line:
```
"@google/generative-ai": "^0.24.1",
```

- [ ] **Step 4: Run `npm install` to update lockfile**

Run: `npm install`
Expected: Clean install without generative-ai

- [ ] **Step 5: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove AI, strategy, campaign, and mock code for QuickConnect pivot"
```

---

### Task 2: Rewrite Convex schema

**Files:**
- Modify: `convex/schema.ts` (complete rewrite)

- [ ] **Step 1: Write the new schema**

Replace `convex/schema.ts` entirely with:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    // Unipile (multi-tenant: one master API key, per-user account_id)
    unipileConnected: v.boolean(),
    unipileAccountId: v.optional(v.string()),
    unipileHealthy: v.optional(v.boolean()),
    unipileLastChecked: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  batches: defineTable({
    userId: v.id("users"),
    fileName: v.string(),
    totalLeads: v.number(),
    globalMessage: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("running"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("daily_limit_reached"),
      v.literal("weekly_limit_reached"),
      v.literal("error_disconnected")
    ),
    rateTier: v.union(
      v.literal("conservative"),
      v.literal("normal"),
      v.literal("aggressive")
    ),
    stats: v.object({
      sent: v.number(),
      accepted: v.number(),
      replied: v.number(),
      alreadyConnected: v.number(),
      errors: v.number(),
      pending: v.number(),
    }),
    dailySentCount: v.number(),
    weeklySentCount: v.number(),
    lastSentAt: v.optional(v.number()),
    nextSendAt: v.optional(v.number()),
    estimatedCompletion: v.optional(v.number()),
    pauseReason: v.optional(v.string()),
    autoResumeAt: v.optional(v.number()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  leads: defineTable({
    batchId: v.id("batches"),
    userId: v.id("users"),
    linkedinUrl: v.string(),
    linkedinIdentifier: v.optional(v.string()),
    providerId: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    message: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("replied"),
      v.literal("already_connected"),
      v.literal("error"),
      v.literal("cancelled")
    ),
    errorType: v.optional(v.string()),
    errorDetail: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
    repliedAt: v.optional(v.number()),
  })
    .index("by_batch", ["batchId"])
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_linkedin_url", ["linkedinUrl"])
    .index("by_batch_and_status", ["batchId", "status"]),

  messages: defineTable({
    leadId: v.id("leads"),
    chatId: v.string(),
    messageText: v.string(),
    senderType: v.union(v.literal("us"), v.literal("them")),
    isReply: v.boolean(),
    receivedAt: v.number(),
    providerMessageId: v.string(),
  })
    .index("by_lead", ["leadId"])
    .index("by_provider_message", ["providerMessageId"]),

  activities: defineTable({
    userId: v.id("users"),
    batchId: v.optional(v.id("batches")),
    leadId: v.optional(v.id("leads")),
    type: v.union(
      v.literal("batch_created"),
      v.literal("outreach_started"),
      v.literal("connection_sent"),
      v.literal("connection_accepted"),
      v.literal("reply_received"),
      v.literal("error"),
      v.literal("batch_paused"),
      v.literal("batch_resumed"),
      v.literal("batch_cancelled"),
      v.literal("batch_completed"),
      v.literal("linkedin_disconnected"),
      v.literal("linkedin_reconnected"),
      v.literal("rate_limit_hit"),
      v.literal("weekly_limit_warning")
    ),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_recent", ["userId", "createdAt"])
    .index("by_batch", ["batchId"]),
});
```

- [ ] **Step 2: Verify schema compiles**

Run: `npx convex dev --once` (or check TypeScript compilation)
Expected: Schema accepted, types regenerated

- [ ] **Step 3: Commit**

```bash
git add convex/schema.ts convex/_generated/
git commit -m "feat: rewrite schema for QuickConnect (users, batches, leads, messages, activities)"
```

---

### Task 3: Rewrite Convex user functions

**Files:**
- Modify: `convex/users.ts`

- [ ] **Step 1: Rewrite users.ts**

Remove preferences/onboarding-questions logic. Keep: upsert, getByClerkId, current. Add: updateUnipileConnection, setUnipileHealth.

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

export const current = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      onboardingCompleted: false,
      unipileConnected: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const completeOnboarding = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, {
      onboardingCompleted: true,
      updatedAt: Date.now(),
    });
  },
});

export const updateUnipileConnection = mutation({
  args: {
    clerkId: v.string(),
    unipileConnected: v.boolean(),
    unipileAccountId: v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, unipileConnected, unipileAccountId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, {
      unipileConnected,
      unipileAccountId,
      unipileHealthy: unipileConnected ? true : undefined,
      updatedAt: Date.now(),
    });
  },
});

export const setUnipileHealth = mutation({
  args: {
    userId: v.id("users"),
    healthy: v.boolean(),
  },
  handler: async (ctx, { userId, healthy }) => {
    await ctx.db.patch(userId, {
      unipileHealthy: healthy,
      unipileLastChecked: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

- [ ] **Step 2: Verify compilation**

Run: `npx convex dev --once`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add convex/users.ts
git commit -m "feat: simplify user functions for QuickConnect"
```

---

### Task 4: Create batch functions

**Files:**
- Create: `convex/batches.ts`

- [ ] **Step 1: Write batches.ts**

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const emptyStats = {
  sent: 0,
  accepted: 0,
  replied: 0,
  alreadyConnected: 0,
  errors: 0,
  pending: 0,
};

export const create = mutation({
  args: {
    userId: v.id("users"),
    fileName: v.string(),
    totalLeads: v.number(),
    globalMessage: v.optional(v.string()),
    rateTier: v.union(
      v.literal("conservative"),
      v.literal("normal"),
      v.literal("aggressive")
    ),
  },
  handler: async (ctx, args) => {
    // Check no other batch is running for this user
    const running = await ctx.db
      .query("batches")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", args.userId).eq("status", "running")
      )
      .first();
    if (running) {
      throw new Error("You already have a running batch. Please wait for it to finish or cancel it.");
    }

    return await ctx.db.insert("batches", {
      userId: args.userId,
      fileName: args.fileName,
      totalLeads: args.totalLeads,
      globalMessage: args.globalMessage,
      status: "draft",
      rateTier: args.rateTier,
      stats: { ...emptyStats, pending: args.totalLeads },
      dailySentCount: 0,
      weeklySentCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("batches")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    return await ctx.db.get(batchId);
  },
});

// Active batch helper (shared logic)
async function findActiveBatch(ctx: any, userId: any) {
  const batches = await ctx.db
    .query("batches")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .order("desc")
    .collect();
  return batches.find((b: any) =>
    ["running", "paused", "daily_limit_reached", "weekly_limit_reached", "error_disconnected"].includes(b.status)
  ) ?? null;
}

// Public query for frontend
export const getActiveBatch = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => findActiveBatch(ctx, userId),
});

// Internal query for actions/monitoring
export const getActiveBatchInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => findActiveBatch(ctx, userId),
});

export const start = mutation({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) throw new Error("Batch not found");
    if (batch.status !== "draft") throw new Error("Batch already started");

    await ctx.db.patch(batchId, {
      status: "running",
      startedAt: Date.now(),
    });
  },
});

export const pause = mutation({
  args: { batchId: v.id("batches"), reason: v.optional(v.string()) },
  handler: async (ctx, { batchId, reason }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) throw new Error("Batch not found");

    await ctx.db.patch(batchId, {
      status: "paused",
      pauseReason: reason ?? "user_paused",
    });
  },
});

export const resume = mutation({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) throw new Error("Batch not found");

    await ctx.db.patch(batchId, {
      status: "running",
      pauseReason: undefined,
      autoResumeAt: undefined,
    });
  },
});

export const cancel = mutation({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) throw new Error("Batch not found");

    // Cancel all pending leads in this batch
    const pendingLeads = await ctx.db
      .query("leads")
      .withIndex("by_batch_and_status", (q) =>
        q.eq("batchId", batchId).eq("status", "pending")
      )
      .collect();

    for (const lead of pendingLeads) {
      await ctx.db.patch(lead._id, { status: "cancelled" });
    }

    await ctx.db.patch(batchId, {
      status: "cancelled",
      completedAt: Date.now(),
      stats: {
        ...batch.stats,
        pending: 0,
      },
    });
  },
});

export const updateStats = mutation({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) return;

    // Count statuses from leads
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_batch", (q) => q.eq("batchId", batchId))
      .collect();

    const stats = {
      sent: leads.filter((l) => l.status === "sent").length,
      accepted: leads.filter((l) => l.status === "accepted").length,
      replied: leads.filter((l) => l.status === "replied").length,
      alreadyConnected: leads.filter((l) => l.status === "already_connected").length,
      errors: leads.filter((l) => l.status === "error").length,
      pending: leads.filter((l) => l.status === "pending").length,
    };

    // Calculate ETA based on rate tier
    const ratePerDay = batch.rateTier === "conservative" ? 16
      : batch.rateTier === "normal" ? 36
      : 72;
    const daysRemaining = stats.pending / ratePerDay;
    const estimatedCompletion = stats.pending > 0
      ? Date.now() + daysRemaining * 24 * 60 * 60 * 1000
      : undefined;

    // Check if batch is complete
    const isComplete = stats.pending === 0 && batch.status === "running";

    await ctx.db.patch(batchId, {
      stats,
      estimatedCompletion,
      ...(isComplete ? { status: "completed" as const, completedAt: Date.now() } : {}),
    });
  },
});
```

- [ ] **Step 2: Verify compilation**

Run: `npx convex dev --once`

- [ ] **Step 3: Commit**

```bash
git add convex/batches.ts
git commit -m "feat: add batch CRUD with start/pause/resume/cancel and stats"
```

---

### Task 5: Rewrite leads functions

**Files:**
- Modify: `convex/leads.ts` (major rewrite)

- [ ] **Step 1: Rewrite leads.ts**

Strip all scoring/message/campaign logic. Focus on batch-based CRUD.

```typescript
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const listByBatch = query({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_batch", (q) => q.eq("batchId", batchId))
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const bulkCreate = mutation({
  args: {
    batchId: v.id("batches"),
    userId: v.id("users"),
    leads: v.array(
      v.object({
        linkedinUrl: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        company: v.optional(v.string()),
        title: v.optional(v.string()),
        message: v.string(),
      })
    ),
  },
  handler: async (ctx, { batchId, userId, leads }) => {
    // Deduplicate within this batch by LinkedIn URL
    const seen = new Set<string>();
    const unique = leads.filter((l) => {
      const url = l.linkedinUrl.toLowerCase().trim();
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });

    // Check for duplicates across previous batches
    const duplicates: string[] = [];
    for (const lead of unique) {
      const existing = await ctx.db
        .query("leads")
        .withIndex("by_linkedin_url", (q) =>
          q.eq("linkedinUrl", lead.linkedinUrl.toLowerCase().trim())
        )
        .first();
      if (existing) {
        duplicates.push(lead.linkedinUrl);
      }
    }

    // Extract identifier from LinkedIn URL
    function extractIdentifier(url: string): string | null {
      try {
        const parts = url.split("/").filter(Boolean);
        const idx = parts.indexOf("in");
        if (idx === -1) return null;
        return parts[idx + 1]?.replace(/\?.*/, "")?.toLowerCase() || null;
      } catch {
        return null;
      }
    }

    let created = 0;
    for (const lead of unique) {
      const normalizedUrl = lead.linkedinUrl.toLowerCase().trim();
      // Skip cross-batch duplicates (they're flagged but still imported with a note)
      await ctx.db.insert("leads", {
        batchId,
        userId,
        linkedinUrl: normalizedUrl,
        linkedinIdentifier: extractIdentifier(normalizedUrl) ?? undefined,
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        title: lead.title,
        message: lead.message,
        status: "pending",
      });
      created++;
    }

    return {
      created,
      duplicatesInBatch: leads.length - unique.length,
      duplicatesAcrossBatches: duplicates.length,
      duplicateUrls: duplicates,
    };
  },
});

// Internal mutation used by outreach engine
export const updateStatus = internalMutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("replied"),
      v.literal("already_connected"),
      v.literal("error"),
      v.literal("cancelled")
    ),
    providerId: v.optional(v.string()),
    errorType: v.optional(v.string()),
    errorDetail: v.optional(v.string()),
  },
  handler: async (ctx, { leadId, status, providerId, errorType, errorDetail }) => {
    const updates: Record<string, unknown> = { status };
    if (providerId) updates.providerId = providerId;
    if (errorType) updates.errorType = errorType;
    if (errorDetail) updates.errorDetail = errorDetail;
    if (status === "sent") updates.sentAt = Date.now();
    if (status === "accepted") updates.acceptedAt = Date.now();
    if (status === "replied") updates.repliedAt = Date.now();
    await ctx.db.patch(leadId, updates);
  },
});

// Get next pending lead for outreach processing (internalQuery - read only)
export const getNextPending = internalQuery({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_batch_and_status", (q) =>
        q.eq("batchId", batchId).eq("status", "pending")
      )
      .first();
  },
});

// Get all sent leads for connection checking (internal - called from actions)
export const getSentLeads = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "sent")
      )
      .collect();
  },
});
```

- [ ] **Step 2: Verify compilation**

Run: `npx convex dev --once`

- [ ] **Step 3: Commit**

```bash
git add convex/leads.ts
git commit -m "feat: rewrite leads for batch-based model with dedup and internal mutations"
```

---

### Task 6: Create messages functions and update activities

**Files:**
- Create: `convex/messages.ts`
- Modify: `convex/activities.ts`

- [ ] **Step 1: Write messages.ts**

```typescript
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsert = internalMutation({
  args: {
    leadId: v.id("leads"),
    chatId: v.string(),
    messageText: v.string(),
    senderType: v.union(v.literal("us"), v.literal("them")),
    isReply: v.boolean(),
    receivedAt: v.number(),
    providerMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for existing message by provider ID (dedup)
    const existing = await ctx.db
      .query("messages")
      .withIndex("by_provider_message", (q) =>
        q.eq("providerMessageId", args.providerMessageId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("messages", args);
  },
});

export const getByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, { leadId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_lead", (q) => q.eq("leadId", leadId))
      .collect();
  },
});
```

- [ ] **Step 2: Rewrite activities.ts**

```typescript
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const log = internalMutation({
  args: {
    userId: v.id("users"),
    batchId: v.optional(v.id("batches")),
    leadId: v.optional(v.id("leads")),
    type: v.union(
      v.literal("batch_created"),
      v.literal("outreach_started"),
      v.literal("connection_sent"),
      v.literal("connection_accepted"),
      v.literal("reply_received"),
      v.literal("error"),
      v.literal("batch_paused"),
      v.literal("batch_resumed"),
      v.literal("batch_cancelled"),
      v.literal("batch_completed"),
      v.literal("linkedin_disconnected"),
      v.literal("linkedin_reconnected"),
      v.literal("rate_limit_hit"),
      v.literal("weekly_limit_warning")
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activities", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const logFromClient = mutation({
  args: {
    userId: v.id("users"),
    batchId: v.optional(v.id("batches")),
    type: v.union(
      v.literal("batch_created"),
      v.literal("outreach_started"),
      v.literal("batch_paused"),
      v.literal("batch_resumed"),
      v.literal("batch_cancelled")
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activities", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listRecent = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }) => {
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_user_recent", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? 20);
    return activities;
  },
});

export const listByBatch = query({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_batch", (q) => q.eq("batchId", batchId))
      .order("desc")
      .collect();
  },
});
```

- [ ] **Step 3: Verify compilation**

Run: `npx convex dev --once`

- [ ] **Step 4: Commit**

```bash
git add convex/messages.ts convex/activities.ts
git commit -m "feat: add messages table for reply tracking and update activity types"
```

---

## Phase 2: Unipile Integration (Convex Actions)

### Task 7: Create Unipile API helper action

**Files:**
- Create: `convex/actions/unipile.ts`

Reference: Port patterns from `D:\LeadGenSaaS\context\edgefunctions\` and n8n workflow.

- [ ] **Step 1: Write the Unipile API action module**

```typescript
"use node";

import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";

// Unipile API config from environment
function getConfig() {
  const baseUrl = process.env.UNIPILE_BASE_URL;
  const apiKey = process.env.UNIPILE_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("UNIPILE_BASE_URL and UNIPILE_API_KEY must be set");
  }
  return { baseUrl, apiKey };
}

async function unipileFetch(path: string, accountId: string, options?: RequestInit) {
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

// Extract LinkedIn identifier from URL (e.g., "/in/john-doe/" → "john-doe")
export function extractIdentifier(url: string): string | null {
  try {
    const parts = url.split("/").filter(Boolean);
    const idx = parts.indexOf("in");
    if (idx === -1) return null;
    return parts[idx + 1]?.replace(/\?.*/, "")?.toLowerCase() || null;
  } catch {
    return null;
  }
}

// Resolve LinkedIn URL to provider_id
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
      return { success: false, error: `${res.status}: ${text}`, providerId: null };
    }

    const profile = await res.json();
    return {
      success: true,
      providerId: profile.provider_id || profile.id || null,
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      headline: profile.headline || "",
    };
  },
});

// Send connection request invitation
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
        success: false,
        alreadyInvited: isAlreadyInvited,
        error: `${res.status}: ${text}`,
        statusCode: res.status,
      };
    }

    return { success: true, alreadyInvited: false, error: null, statusCode: 200 };
  },
});

// Fetch all relations (connections) - paginated
export const fetchRelations = internalAction({
  args: { accountId: v.string() },
  handler: async (_ctx, { accountId }) => {
    const relations: Array<{
      public_identifier?: string;
      provider_id?: string;
      member_id?: string;
      created_at?: string | number;
    }> = [];

    let cursor: string | null = null;
    do {
      const url = new URL(`${getConfig().baseUrl}/api/v1/users/relations`);
      url.searchParams.set("account_id", accountId);
      url.searchParams.set("limit", "100");
      if (cursor) url.searchParams.set("cursor", cursor);

      const res = await unipileFetch(url.toString(), accountId);
      if (!res.ok) break;

      const data = await res.json();
      relations.push(...(data.items || []));
      cursor = data.cursor || null;
    } while (cursor);

    return relations;
  },
});

// Fetch chats for reply detection
export const fetchChats = internalAction({
  args: { accountId: v.string() },
  handler: async (_ctx, { accountId }) => {
    const after = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const chats: Array<Record<string, unknown>> = [];

    let cursor: string | null = null;
    do {
      const url = new URL(`${getConfig().baseUrl}/api/v1/chats`);
      url.searchParams.set("account_id", accountId);
      url.searchParams.set("limit", "100");
      url.searchParams.set("after", after);
      if (cursor) url.searchParams.set("cursor", cursor);

      const res = await unipileFetch(url.toString(), accountId);
      if (!res.ok) break;

      const data = await res.json();
      chats.push(...(data.items || []));
      cursor = data.cursor || null;
    } while (cursor);

    return chats;
  },
});

// Fetch messages for a specific chat
export const fetchChatMessages = internalAction({
  args: { accountId: v.string(), chatId: v.string() },
  handler: async (_ctx, { accountId, chatId }) => {
    const res = await unipileFetch(
      `/chats/${chatId}/messages?account_id=${accountId}&limit=100`,
      accountId
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  },
});

// Health check
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
```

- [ ] **Step 2: Verify compilation**

Run: `npx convex dev --once`

- [ ] **Step 3: Set up environment variables (placeholder)**

```bash
npx convex env set UNIPILE_BASE_URL "https://api1.unipile.com:13111"
npx convex env set UNIPILE_API_KEY "placeholder-set-when-account-ready"
```

Note: Replace with real values once Unipile account is set up.

- [ ] **Step 4: Commit**

```bash
git add convex/actions/unipile.ts
git commit -m "feat: add Unipile API actions (send invite, relations, chats, health check)"
```

---

### Task 8: Create outreach processing engine

**Files:**
- Create: `convex/actions/outreach.ts`

This is the core engine that replaces the n8n workflow.

- [ ] **Step 1: Write outreach.ts**

```typescript
"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

// Inline Unipile HTTP calls directly in this action to avoid
// action-calling-action pattern (non-reversible side effects risk).
function getConfig() {
  const baseUrl = process.env.UNIPILE_BASE_URL;
  const apiKey = process.env.UNIPILE_API_KEY;
  if (!baseUrl || !apiKey) throw new Error("UNIPILE_BASE_URL and UNIPILE_API_KEY must be set");
  return { baseUrl, apiKey };
}

async function unipileFetch(path: string, options?: RequestInit) {
  const { baseUrl, apiKey } = getConfig();
  const url = path.startsWith("http") ? path : `${baseUrl}/api/v1${path}`;
  return fetch(url, {
    ...options,
    headers: {
      "X-API-KEY": apiKey,
      accept: "application/json",
      "content-type": "application/json",
      ...(options?.headers || {}),
    },
  });
}

// Rate tier delays in milliseconds (randomized between min and max)
const RATE_DELAYS = {
  conservative: { min: 45 * 60 * 1000, max: 90 * 60 * 1000 },    // 45-90 min
  normal:       { min: 20 * 60 * 1000, max: 40 * 60 * 1000 },     // 20-40 min
  aggressive:   { min: 10 * 60 * 1000, max: 20 * 60 * 1000 },     // 10-20 min
};

const DAILY_LIMITS = { conservative: 16, normal: 36, aggressive: 72 };
const WEEKLY_LIMIT = 200;

export const processOutreach = internalAction({
  handler: async (ctx) => {
    const allBatches = await ctx.runQuery(internal.batches.getRunningBatches);

    for (const batch of allBatches) {
      const user = await ctx.runQuery(internal.users.getById, { userId: batch.userId });
      if (!user || !user.unipileConnected || !user.unipileAccountId) continue;

      // Check daily limit
      const dailyLimit = DAILY_LIMITS[batch.rateTier];
      if (batch.dailySentCount >= dailyLimit) {
        await ctx.runMutation(internal.batches.setStatus, {
          batchId: batch._id,
          status: "daily_limit_reached",
          pauseReason: `Daily limit of ${dailyLimit} reached`,
        });
        continue;
      }

      // Check weekly limit
      if (batch.weeklySentCount >= WEEKLY_LIMIT) {
        await ctx.runMutation(internal.batches.setStatus, {
          batchId: batch._id,
          status: "weekly_limit_reached",
          pauseReason: "LinkedIn weekly limit of 200 reached",
        });
        await ctx.runMutation(internal.activities.log, {
          userId: batch.userId, batchId: batch._id, type: "weekly_limit_warning",
        });
        continue;
      }

      // Check rate limit timing
      if (batch.nextSendAt && Date.now() < batch.nextSendAt) continue;

      // Get next pending lead (query, not mutation)
      const lead = await ctx.runQuery(internal.leads.getNextPending, { batchId: batch._id });
      if (!lead) {
        await ctx.runMutation(internal.batches.updateStats, { batchId: batch._id });
        continue;
      }

      const identifier = lead.linkedinIdentifier;
      if (!identifier) {
        await ctx.runMutation(internal.leads.updateStatus, {
          leadId: lead._id, status: "error",
          errorType: "invalid_url", errorDetail: "Could not extract LinkedIn identifier",
        });
        await ctx.runMutation(internal.batches.updateStats, { batchId: batch._id });
        continue;
      }

      // Step 1: Resolve provider_id (inline HTTP call)
      let providerId: string | null = null;
      try {
        const profileRes = await unipileFetch(
          `/users/${identifier}?account_id=${user.unipileAccountId}`
        );
        if (!profileRes.ok) {
          await ctx.runMutation(internal.leads.updateStatus, {
            leadId: lead._id, status: "error",
            errorType: "profile_not_found", errorDetail: `${profileRes.status}`,
          });
          await ctx.runMutation(internal.activities.log, {
            userId: batch.userId, batchId: batch._id, leadId: lead._id,
            type: "error", metadata: { error: "profile_not_found", identifier },
          });
          await ctx.runMutation(internal.batches.updateStats, { batchId: batch._id });
          continue;
        }
        const profile = await profileRes.json();
        providerId = profile.provider_id || profile.id || null;
      } catch (err) {
        await ctx.runMutation(internal.leads.updateStatus, {
          leadId: lead._id, status: "error",
          errorType: "api_error", errorDetail: String(err),
        });
        await ctx.runMutation(internal.batches.updateStats, { batchId: batch._id });
        continue;
      }

      if (!providerId) {
        await ctx.runMutation(internal.leads.updateStatus, {
          leadId: lead._id, status: "error",
          errorType: "profile_not_found", errorDetail: "No provider_id returned",
        });
        await ctx.runMutation(internal.batches.updateStats, { batchId: batch._id });
        continue;
      }

      // Step 2: Send invite (inline HTTP call)
      try {
        // Truncate message to 300 chars as safety net
        const message = lead.message ? lead.message.slice(0, 300) : undefined;
        const body: Record<string, string> = {
          provider_id: providerId,
          account_id: user.unipileAccountId,
        };
        if (message) body.message = message;

        const inviteRes = await unipileFetch("/users/invite", {
          method: "POST",
          body: JSON.stringify(body),
        });

        if (!inviteRes.ok) {
          const errText = await inviteRes.text();
          const isAlreadyInvited = errText.toLowerCase().includes("already_invited");

          if (isAlreadyInvited) {
            await ctx.runMutation(internal.leads.updateStatus, {
              leadId: lead._id, status: "already_connected", providerId,
            });
            await ctx.runMutation(internal.activities.log, {
              userId: batch.userId, batchId: batch._id, leadId: lead._id,
              type: "connection_sent", metadata: { alreadyConnected: true },
            });
          } else if (inviteRes.status === 422) {
            // Rate limited by LinkedIn - pause batch
            await ctx.runMutation(internal.batches.setStatus, {
              batchId: batch._id, status: "paused",
              pauseReason: "rate_limited",
              autoResumeAt: Date.now() + 60 * 60 * 1000,
            });
            await ctx.runMutation(internal.activities.log, {
              userId: batch.userId, batchId: batch._id, type: "rate_limit_hit",
            });
          } else {
            await ctx.runMutation(internal.leads.updateStatus, {
              leadId: lead._id, status: "error",
              errorType: "api_error", errorDetail: `${inviteRes.status}: ${errText.slice(0, 200)}`,
              providerId,
            });
            await ctx.runMutation(internal.activities.log, {
              userId: batch.userId, batchId: batch._id, leadId: lead._id,
              type: "error", metadata: { error: errText.slice(0, 200) },
            });
          }
        } else {
          // Success!
          await ctx.runMutation(internal.leads.updateStatus, {
            leadId: lead._id, status: "sent", providerId,
          });
          await ctx.runMutation(internal.activities.log, {
            userId: batch.userId, batchId: batch._id, leadId: lead._id,
            type: "connection_sent",
          });

          // Schedule next send with randomized delay
          const delay = RATE_DELAYS[batch.rateTier];
          const nextDelay = Math.floor(Math.random() * (delay.max - delay.min)) + delay.min;
          await ctx.runMutation(internal.batches.incrementSentCount, {
            batchId: batch._id, nextSendAt: Date.now() + nextDelay,
          });
        }
      } catch (err) {
        await ctx.runMutation(internal.leads.updateStatus, {
          leadId: lead._id, status: "error",
          errorType: "api_error", errorDetail: String(err), providerId,
        });
      }

      await ctx.runMutation(internal.batches.updateStats, { batchId: batch._id });
    }
  },
});
```

- [ ] **Step 2: Add internal helpers needed by outreach**

Add to `convex/batches.ts`:

```typescript
// NOTE: Add these imports at the top of batches.ts alongside existing imports:
// import { mutation, query, internalQuery, internalMutation } from "./_generated/server";

export const getRunningBatches = internalQuery({
  handler: async (ctx) => {
    return await ctx.db
      .query("batches")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .collect();
  },
});

export const setStatus = internalMutation({
  args: {
    batchId: v.id("batches"),
    status: v.union(
      v.literal("draft"),
      v.literal("running"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("daily_limit_reached"),
      v.literal("weekly_limit_reached"),
      v.literal("error_disconnected")
    ),
    pauseReason: v.optional(v.string()),
    autoResumeAt: v.optional(v.number()),
  },
  handler: async (ctx, { batchId, status, pauseReason, autoResumeAt }) => {
    await ctx.db.patch(batchId, {
      status,
      pauseReason,
      autoResumeAt,
    });
  },
});

export const incrementSentCount = internalMutation({
  args: {
    batchId: v.id("batches"),
    nextSendAt: v.number(),
  },
  handler: async (ctx, { batchId, nextSendAt }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) return;
    await ctx.db.patch(batchId, {
      dailySentCount: batch.dailySentCount + 1,
      weeklySentCount: batch.weeklySentCount + 1,
      lastSentAt: Date.now(),
      nextSendAt,
    });
  },
});
```

Add to `convex/users.ts`:

```typescript
import { internalQuery } from "./_generated/server";

export const getById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});
```

- [ ] **Step 3: Verify compilation**

Run: `npx convex dev --once`

- [ ] **Step 4: Commit**

```bash
git add convex/actions/outreach.ts convex/batches.ts convex/users.ts
git commit -m "feat: add outreach processing engine (replaces n8n workflow)"
```

---

### Task 9: Create monitoring actions and update crons

**Files:**
- Create: `convex/actions/monitoring.ts`
- Modify: `convex/crons.ts`

- [ ] **Step 1: Write monitoring.ts**

Port check-connections and detect-replies logic from edge functions.

```typescript
"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

// Check for accepted connections across all users with sent leads
export const checkConnections = internalAction({
  handler: async (ctx) => {
    // Get all users with unipile connected
    const users = await ctx.runQuery(internal.users.getConnectedUsers);

    for (const user of users) {
      if (!user.unipileAccountId) continue;

      // Get sent leads for this user
      const sentLeads = await ctx.runQuery(internal.leads.getSentLeads, {
        userId: user._id,
      });
      if (sentLeads.length === 0) continue;

      // Build lookup maps
      const byIdentifier = new Map<string, string>();
      const byProviderId = new Map<string, string>();
      for (const lead of sentLeads) {
        if (lead.linkedinIdentifier) {
          byIdentifier.set(lead.linkedinIdentifier.toLowerCase(), lead._id);
        }
        if (lead.providerId) {
          byProviderId.set(lead.providerId, lead._id);
        }
      }

      // Fetch relations from Unipile
      const relations = await ctx.runAction(
        internal.actions.unipile.fetchRelations,
        { accountId: user.unipileAccountId }
      );

      for (const relation of relations) {
        const identifier = relation.public_identifier?.toLowerCase();
        const leadId =
          (identifier && byIdentifier.get(identifier)) ||
          byProviderId.get(relation.member_id || "") ||
          byProviderId.get(relation.provider_id || "");

        if (leadId) {
          await ctx.runMutation(internal.leads.updateStatus, {
            leadId: leadId as any,
            status: "accepted",
          });
          await ctx.runMutation(internal.activities.log, {
            userId: user._id,
            leadId: leadId as any,
            type: "connection_accepted",
          });
        }
      }
    }
  },
});

// Check for replies in accepted leads' chats
export const detectReplies = internalAction({
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.users.getConnectedUsers);

    for (const user of users) {
      if (!user.unipileAccountId) continue;

      // Get accepted leads
      const acceptedLeads = await ctx.runQuery(internal.leads.getAcceptedLeads, {
        userId: user._id,
      });
      if (acceptedLeads.length === 0) continue;

      // Build provider_id map
      const providerIdToLeadId = new Map<string, string>();
      const nameToLeadId = new Map<string, string>();
      for (const lead of acceptedLeads) {
        if (lead.providerId) {
          providerIdToLeadId.set(lead.providerId, lead._id);
        }
        const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ").toLowerCase();
        if (name) nameToLeadId.set(name, lead._id);
      }

      // Fetch chats
      const chats = await ctx.runAction(internal.actions.unipile.fetchChats, {
        accountId: user.unipileAccountId,
      });

      for (const chat of chats) {
        // Match chat to lead (4-level strategy from reference)
        let matchedLeadId: string | null = null;

        // Strategy 1: attendee_provider_id
        if (chat.attendee_provider_id) {
          matchedLeadId = providerIdToLeadId.get(chat.attendee_provider_id as string) || null;
        }

        // Strategy 2: attendees array provider_id
        if (!matchedLeadId && Array.isArray(chat.attendees)) {
          for (const a of chat.attendees as Array<Record<string, unknown>>) {
            if (a.provider_id) {
              matchedLeadId = providerIdToLeadId.get(a.provider_id as string) || null;
              if (matchedLeadId) break;
            }
          }
        }

        // Strategy 3: display name
        if (!matchedLeadId) {
          const displayName = (chat.attendee_display_name || chat.name) as string;
          if (displayName) {
            matchedLeadId = nameToLeadId.get(displayName.toLowerCase().trim()) || null;
          }
        }

        // Strategy 4: attendees array name
        if (!matchedLeadId && Array.isArray(chat.attendees)) {
          for (const a of chat.attendees as Array<Record<string, unknown>>) {
            const name = (a.display_name || a.name) as string;
            if (name) {
              matchedLeadId = nameToLeadId.get(name.toLowerCase().trim()) || null;
              if (matchedLeadId) break;
            }
          }
        }

        if (!matchedLeadId) continue;

        // Fetch messages for matched chat
        const messages = await ctx.runAction(
          internal.actions.unipile.fetchChatMessages,
          { accountId: user.unipileAccountId, chatId: chat.id as string }
        );

        let hasReply = false;
        for (const msg of messages) {
          const isReply = msg.is_sender === 0 || msg.is_sender === false;
          const messageText = msg.text || msg.body || "";
          if (!messageText) continue;

          const providerMessageId = msg.id ||
            `synth_${matchedLeadId}_${chat.id}_${Date.now()}`;

          await ctx.runMutation(internal.messages.upsert, {
            leadId: matchedLeadId as any,
            chatId: chat.id as string,
            messageText,
            senderType: isReply ? "them" : "us",
            isReply,
            receivedAt: msg.timestamp
              ? new Date(msg.timestamp).getTime()
              : Date.now(),
            providerMessageId,
          });

          if (isReply) hasReply = true;
        }

        if (hasReply) {
          await ctx.runMutation(internal.leads.updateStatus, {
            leadId: matchedLeadId as any,
            status: "replied",
          });
          await ctx.runMutation(internal.activities.log, {
            userId: user._id,
            leadId: matchedLeadId as any,
            type: "reply_received",
          });
        }
      }
    }
  },
});

// Health check all connected users
export const healthCheckAll = internalAction({
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.users.getConnectedUsers);

    for (const user of users) {
      if (!user.unipileAccountId) continue;

      const result = await ctx.runAction(internal.actions.unipile.healthCheck, {
        accountId: user.unipileAccountId,
      });

      await ctx.runMutation(internal.users.setUnipileHealth, {
        userId: user._id,
        healthy: result.healthy,
      });

      if (!result.healthy) {
        // Pause any running batch for this user
        const batch = await ctx.runQuery(internal.batches.getActiveBatchInternal, {
          userId: user._id,
        });
        if (batch && batch.status === "running") {
          await ctx.runMutation(internal.batches.setStatus, {
            batchId: batch._id,
            status: "error_disconnected",
            pauseReason: "LinkedIn disconnected",
          });
          await ctx.runMutation(internal.activities.log, {
            userId: user._id,
            batchId: batch._id,
            type: "linkedin_disconnected",
            metadata: { error: result.error },
          });
        }
      }
    }
  },
});

// Auto-resume batches that were rate-limited
export const autoResume = internalAction({
  handler: async (ctx) => {
    const pausedBatches = await ctx.runQuery(internal.batches.getPausedWithAutoResume);
    const now = Date.now();

    for (const batch of pausedBatches) {
      if (batch.autoResumeAt && batch.autoResumeAt <= now) {
        await ctx.runMutation(internal.batches.setStatus, {
          batchId: batch._id,
          status: "running",
          pauseReason: undefined,
        });
        await ctx.runMutation(internal.activities.log, {
          userId: batch.userId,
          batchId: batch._id,
          type: "batch_resumed",
          metadata: { autoResumed: true },
        });
      }
    }
  },
});

// Reset daily sent counts (run at midnight)
export const resetDailyCounts = internalAction({
  handler: async (ctx) => {
    await ctx.runMutation(internal.batches.resetAllDailyCounts);
  },
});

// Reset weekly sent counts (run Monday midnight)
export const resetWeeklyCounts = internalAction({
  handler: async (ctx) => {
    await ctx.runMutation(internal.batches.resetAllWeeklyCounts);
  },
});
```

- [ ] **Step 2: Add internal queries needed by monitoring**

Add to `convex/users.ts`:

```typescript
export const getConnectedUsers = internalQuery({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => u.unipileConnected && u.unipileAccountId);
  },
});
```

Add to `convex/leads.ts`:

```typescript
export const getAcceptedLeads = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "accepted")
      )
      .collect();
  },
});
```

Add to `convex/batches.ts`:

```typescript
export const getPausedWithAutoResume = internalQuery({
  handler: async (ctx) => {
    const paused = await ctx.db
      .query("batches")
      .withIndex("by_status", (q) => q.eq("status", "paused"))
      .collect();
    return paused.filter((b) => b.autoResumeAt);
  },
});

export const resetAllDailyCounts = internalMutation({
  handler: async (ctx) => {
    // Only reset active batches (not completed/cancelled)
    const activeStatuses = ["running", "paused", "daily_limit_reached", "weekly_limit_reached", "error_disconnected"];
    const batches = await ctx.db.query("batches").collect();
    for (const batch of batches) {
      if (!activeStatuses.includes(batch.status)) continue;
      const updates: Record<string, unknown> = {};
      if (batch.dailySentCount > 0) updates.dailySentCount = 0;
      if (batch.status === "daily_limit_reached") {
        updates.status = "running";
        updates.pauseReason = undefined;
      }
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(batch._id, updates);
      }
    }
  },
});

export const resetAllWeeklyCounts = internalMutation({
  handler: async (ctx) => {
    const activeStatuses = ["running", "paused", "daily_limit_reached", "weekly_limit_reached", "error_disconnected"];
    const batches = await ctx.db.query("batches").collect();
    for (const batch of batches) {
      if (!activeStatuses.includes(batch.status)) continue;
      const updates: Record<string, unknown> = {};
      if (batch.weeklySentCount > 0) updates.weeklySentCount = 0;
      if (batch.status === "weekly_limit_reached") {
        updates.status = "running";
        updates.pauseReason = undefined;
      }
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(batch._id, updates);
      }
    }
  },
});
```

- [ ] **Step 3: Rewrite crons.ts**

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Process outreach: send connection requests
crons.interval(
  "process_outreach",
  { minutes: 2 },
  internal.actions.outreach.processOutreach,
  {}
);

// Check for accepted connections
crons.interval(
  "check_connections",
  { minutes: 10 },
  internal.actions.monitoring.checkConnections,
  {}
);

// Detect replies in chats
crons.interval(
  "detect_replies",
  { minutes: 15 },
  internal.actions.monitoring.detectReplies,
  {}
);

// Health check all connected accounts
crons.interval(
  "health_check",
  { minutes: 30 },
  internal.actions.monitoring.healthCheckAll,
  {}
);

// Auto-resume rate-limited batches
crons.interval(
  "auto_resume",
  { minutes: 5 },
  internal.actions.monitoring.autoResume,
  {}
);

// Reset daily sent counts at midnight
crons.cron(
  "reset_daily_counts",
  "0 0 * * *",
  internal.actions.monitoring.resetDailyCounts,
  {}
);

// Reset weekly sent counts every Monday at midnight
crons.cron(
  "reset_weekly_counts",
  "0 0 * * 1",
  internal.actions.monitoring.resetWeeklyCounts,
  {}
);

export default crons;
```

- [ ] **Step 4: Verify compilation**

Run: `npx convex dev --once`

- [ ] **Step 5: Commit**

```bash
git add convex/actions/monitoring.ts convex/actions/outreach.ts convex/crons.ts convex/batches.ts convex/users.ts convex/leads.ts
git commit -m "feat: add monitoring crons (connections, replies, health) and auto-resume"
```

---

## Phase 3: Frontend Core

### Task 10: Simplify CSV parser

**Files:**
- Modify: `src/lib/csvParser.ts`

- [ ] **Step 1: Rewrite csvParser.ts**

Only LinkedIn URL is required. Detect message column. Validate 300-char limit.

```typescript
export interface ParsedLead {
  linkedinUrl: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  message?: string;
}

export interface ParseResult {
  leads: ParsedLead[];
  errors: ParseError[];
  totalRows: number;
  skippedRows: number;
  headers: string[];
  hasMessageColumn: boolean;
  messageTooLong: ParseError[];
  duplicatesRemoved: number;
}

export interface ParseError {
  row: number;
  field: string;
  message: string;
}

const COLUMN_MAPPINGS: Record<string, keyof ParsedLead> = {
  "linkedin": "linkedinUrl",
  "linkedin url": "linkedinUrl",
  "linkedin_url": "linkedinUrl",
  "linkedin profile": "linkedinUrl",
  "linkedin profile url": "linkedinUrl",
  "linkedin profile url of the company's owner or ceo": "linkedinUrl",
  "profile url": "linkedinUrl",
  "url": "linkedinUrl",
  "first name": "firstName",
  "firstname": "firstName",
  "first_name": "firstName",
  "name": "firstName",
  "last name": "lastName",
  "lastname": "lastName",
  "last_name": "lastName",
  "company": "company",
  "company name": "company",
  "organization": "company",
  "title": "title",
  "job title": "title",
  "position": "title",
  "role": "title",
  "message": "message",
  "draft message": "message",
  "draft_message": "message",
  "connection message": "message",
  "note": "message",
};

export function parseCSV(text: string): ParseResult {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return {
      leads: [], errors: [{ row: 0, field: "", message: "Empty file" }],
      totalRows: 0, skippedRows: 0, headers: [],
      hasMessageColumn: false, messageTooLong: [], duplicatesRemoved: 0,
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = parseLine(lines[0], delimiter);
  const headers = rawHeaders.map((h) => h.trim());
  const fieldMap = mapHeaders(headers);
  const hasMessageColumn = Object.values(fieldMap).includes("message");

  const leads: ParsedLead[] = [];
  const errors: ParseError[] = [];
  const messageTooLong: ParseError[] = [];
  let skippedRows = 0;

  const seenUrls = new Set<string>();
  let duplicatesRemoved = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i], delimiter);
    if (values.length === 0 || values.every((v) => !v.trim())) {
      skippedRows++;
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((_, idx) => {
      const fieldName = fieldMap[idx];
      if (fieldName && values[idx]) {
        row[fieldName] = values[idx].trim();
      }
    });

    // Handle "name" field split
    if (row.firstName && !row.lastName && row.firstName.includes(" ")) {
      const parts = row.firstName.split(" ");
      row.firstName = parts[0];
      row.lastName = parts.slice(1).join(" ");
    }

    // Validate LinkedIn URL (required)
    if (!row.linkedinUrl || !isValidLinkedInUrl(row.linkedinUrl)) {
      errors.push({ row: i + 1, field: "linkedinUrl", message: "Missing or invalid LinkedIn URL" });
      skippedRows++;
      continue;
    }

    // Deduplicate by URL
    const normalizedUrl = row.linkedinUrl.toLowerCase().trim();
    if (seenUrls.has(normalizedUrl)) {
      duplicatesRemoved++;
      continue;
    }
    seenUrls.add(normalizedUrl);

    // Check message length
    if (row.message && row.message.length > 300) {
      messageTooLong.push({
        row: i + 1,
        field: "message",
        message: `Message is ${row.message.length} chars (max 300)`,
      });
    }

    leads.push({
      linkedinUrl: row.linkedinUrl,
      firstName: row.firstName,
      lastName: row.lastName,
      company: row.company,
      title: row.title,
      message: row.message,
    });
  }

  return {
    leads, errors, totalRows: lines.length - 1, skippedRows,
    headers, hasMessageColumn, messageTooLong, duplicatesRemoved,
  };
}

function isValidLinkedInUrl(url: string): boolean {
  return url.includes("linkedin.com/in/");
}

function detectDelimiter(headerLine: string): string {
  const delimiters = [",", ";", "\t", "|"];
  let best = ",";
  let maxCount = 0;
  for (const d of delimiters) {
    const count = (headerLine.match(new RegExp(d === "|" ? "\\|" : d, "g")) || []).length;
    if (count > maxCount) { maxCount = count; best = d; }
  }
  return best;
}

function parseLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === delimiter && !inQuotes) {
      result.push(current); current = "";
    } else { current += char; }
  }
  result.push(current);
  return result;
}

function mapHeaders(headers: string[]): Record<number, keyof ParsedLead> {
  const map: Record<number, keyof ParsedLead> = {};
  headers.forEach((header, idx) => {
    const normalized = header.toLowerCase().trim().replace(/['"]/g, "");
    const fieldName = COLUMN_MAPPINGS[normalized];
    if (fieldName) map[idx] = fieldName;
  });
  return map;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) return { valid: false, error: "File exceeds 10MB" };
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (![".csv", ".txt", ".tsv"].includes(ext)) {
    return { valid: false, error: "Please upload a CSV file" };
  }
  return { valid: true };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/csvParser.ts
git commit -m "feat: simplify CSV parser - only LinkedIn URL required, message column detection"
```

---

### Task 11: Update App.tsx routing and Sidebar

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Update App.tsx**

Remove StrategyPage, ConnectPage imports. Add BatchDetailPage route. Add onboarding redirect logic.

Replace routes to use:
- `/` → LandingPage
- `/signin/*` → SignInPage
- `/signup/*` → SignUpPage
- `/onboarding` → OnboardingPage (2-step)
- `/dashboard` → DashboardPage
- `/dashboard/upload` → UploadPage
- `/dashboard/batch/:id` → BatchDetailPage

Remove: `/dashboard/leads`, `/dashboard/connect`, any strategy routes.

- [ ] **Step 2: Simplify Sidebar.tsx**

Remove Campaign, Strategy, Leads nav items. Keep: Dashboard, Upload CSV, Settings (coming soon). Change logo text from "LeadFlow" to "QuickConnect".

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx src/components/layout/Sidebar.tsx
git commit -m "feat: update routing and sidebar for QuickConnect"
```

---

### Task 12: Rewrite DashboardPage

**Files:**
- Modify: `src/pages/DashboardPage.tsx`
- Create: `src/components/dashboard/MetricCards.tsx`
- Create: `src/components/dashboard/BatchProgress.tsx`
- Create: `src/components/dashboard/ActivityFeed.tsx`
- Create: `src/components/dashboard/BatchHistory.tsx`
- Create: `src/components/dashboard/StatusBanner.tsx`
- Create: `src/hooks/useBatches.ts`
- Create: `src/hooks/usePolling.ts`

This is the largest frontend task. Build the new dashboard with: status banners, active batch progress, metric cards, activity feed, batch history.

- [ ] **Step 1: Create usePolling hook**

Simple hook that re-triggers queries every 30 seconds.

- [ ] **Step 2: Create useBatches hook**

Wraps Convex queries for batches, active batch, stats.

- [ ] **Step 3: Create StatusBanner component**

Shows: LinkedIn disconnected, rate limit paused (with timer), batch complete. Reads from active batch status and user.unipileHealthy.

- [ ] **Step 4: Create MetricCards component**

Six cards: Sent, Accepted, Replies, Already Connected, Errors, Pending. Each shows count + percentage. Supports global vs per-batch view toggle.

- [ ] **Step 5: Create BatchProgress component**

Progress bar (sent+errors+alreadyConnected / total), ETA, rate tier label, weekly limit tracker ("This week: 147/200"), Pause/Resume/Cancel buttons.

- [ ] **Step 6: Create ActivityFeed component**

List of recent activities with type icons, timestamps, lead names. Max 20 items.

- [ ] **Step 7: Create BatchHistory component**

Table of past batches: fileName, status badge, stats summary, date. Click to navigate to `/dashboard/batch/:id`.

- [ ] **Step 8: Compose DashboardPage**

Wire all components together. Add global vs per-batch view toggle. Add "Upload New CSV" button.

- [ ] **Step 9: Commit**

```bash
git add src/pages/DashboardPage.tsx src/components/dashboard/ src/hooks/useBatches.ts src/hooks/usePolling.ts
git commit -m "feat: rebuild dashboard with metric cards, batch progress, activity feed"
```

---

### Task 13: Rewrite UploadPage and create BatchDetailPage

**Files:**
- Modify: `src/pages/UploadPage.tsx`
- Create: `src/pages/BatchDetailPage.tsx`

- [ ] **Step 1: Simplify UploadPage**

Flow:
1. Drag & drop CSV
2. Parse and show preview table (LinkedIn URL, Name, Message)
3. If no message column → show textarea "Write your connection message (max 300 chars)"
4. Show validation: row count, duplicates removed, any message-too-long errors
5. Rate tier selector (Conservative/Normal/Aggressive) with descriptions
6. "Should we start connecting?" button (disabled if validation errors)
7. On click → check Unipile connected → create batch + leads → start batch → redirect to dashboard

- [ ] **Step 2: Create BatchDetailPage**

Shows: batch info (fileName, date, status, rate tier), MetricCards for this batch, leads table (LinkedIn URL, name, status, error detail, sent time), filter by status.

- [ ] **Step 3: Commit**

```bash
git add src/pages/UploadPage.tsx src/pages/BatchDetailPage.tsx
git commit -m "feat: simplify upload page and add batch detail view"
```

---

### Task 14: Rewrite OnboardingPage (2-step)

**Files:**
- Modify: `src/pages/OnboardingPage.tsx`
- Create: `src/components/onboarding/ConnectLinkedIn.tsx`
- Create: `src/components/onboarding/UploadFirstCSV.tsx`

- [ ] **Step 1: Create ConnectLinkedIn component**

Step 1 of onboarding. Shows: explanation of Unipile connection, "Connect LinkedIn" button, success/error states. On success → advance to step 2.

Note: Actual Unipile OAuth/connect flow TBD until Unipile account is set up. For now, create the UI with a placeholder that calls `users.updateUnipileConnection`.

- [ ] **Step 2: Create UploadFirstCSV component**

Step 2 of onboarding. Reuses CSV upload logic from UploadPage. On successful upload → mark onboarding complete → redirect to dashboard.

- [ ] **Step 3: Compose OnboardingPage**

2-step progress indicator. Step 1: ConnectLinkedIn. Step 2: UploadFirstCSV.

- [ ] **Step 4: Commit**

```bash
git add src/pages/OnboardingPage.tsx src/components/onboarding/
git commit -m "feat: 2-step onboarding (connect LinkedIn + upload first CSV)"
```

---

## Phase 4: Landing Page & Cleanup

### Task 15: Simplify landing page

**Files:**
- Modify: `src/pages/LandingPage.tsx`
- Modify: `src/components/landing/HeroSection.tsx`
- Modify: `src/components/landing/FeaturesSection.tsx`
- Modify: `src/components/landing/HowItWorksSection.tsx`
- Modify: `src/components/landing/PricingSection.tsx`
- Modify: `src/components/landing/TestimonialSection.tsx`
- Modify: `src/components/landing/FAQSection.tsx`

- [ ] **Step 1: Update HeroSection**

Change headline from AI-focused to "Automate LinkedIn Connection Requests in Minutes". Remove all AI language. Change CTA to "Start Connecting".

- [ ] **Step 2: Update FeaturesSection**

Three features: (1) Upload CSV, (2) Auto-send connections, (3) Track results. Remove scoring, AI messages, etc.

- [ ] **Step 3: Update HowItWorksSection**

Three steps: Upload CSV → Click Start → Watch Dashboard.

- [ ] **Step 4: Update brand name throughout**

Change "LeadFlow AI" → "QuickConnect" in all landing components, Logo component, page titles.

- [ ] **Step 5: Simplify PricingSection**

Remove detailed pricing (TBD). Show a simple "Coming soon" or single plan.

- [ ] **Step 6: Update FAQ and Testimonials**

Remove AI-specific questions. Add relevant ones (rate limits, safety, CSV format).

- [ ] **Step 7: Commit**

```bash
git add src/pages/LandingPage.tsx src/components/landing/ src/components/ui/Logo.tsx
git commit -m "feat: rebrand landing page to QuickConnect, remove AI messaging"
```

---

### Task 16: Remove LeadsPage, clean up dead imports, final verification

**Files:**
- Delete: `src/pages/LeadsPage.tsx` (replaced by BatchDetailPage)
- Delete: `src/components/dashboard/LeadsTable.tsx` (if not reused)
- Delete: `src/components/dashboard/LeadDetailPanel.tsx` (if not reused)
- Modify: Various files for dead import cleanup

- [ ] **Step 1: Delete unused page and component files**

```bash
rm src/pages/LeadsPage.tsx
```

- [ ] **Step 2: Search for dead imports**

Run: `npx tsc --noEmit` to find all TypeScript errors from missing imports.

- [ ] **Step 3: Fix all remaining TypeScript errors**

Remove imports of deleted files, fix any type mismatches.

- [ ] **Step 4: Run `npm run build` to verify production build**

Run: `npm run build`
Expected: Clean build with no errors

- [ ] **Step 5: Run existing E2E tests**

Run: `npx playwright test`
Expected: Landing page tests should still pass (may need updates for new copy)

- [ ] **Step 6: Fix any failing E2E tests**

Update test assertions to match new "QuickConnect" branding and simplified content.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: clean up dead imports, fix tests, verify build"
```

---

## Summary

| Phase | Tasks | What it produces |
|-------|-------|------------------|
| Phase 1: Backend | Tasks 1-6 | Clean schema, batch/lead/message/activity functions |
| Phase 2: Unipile | Tasks 7-9 | Sending engine, connection/reply monitoring, health checks, crons |
| Phase 3: Frontend | Tasks 10-14 | Dashboard, upload, batch detail, onboarding |
| Phase 4: Polish | Tasks 15-16 | Rebranded landing page, cleanup, verified build |

**Total: 16 tasks, ~60 steps**

Each phase produces a working (or at least compiling) codebase. Phase 1+2 can be tested via Convex dashboard. Phase 3+4 produces the full user-facing app.
