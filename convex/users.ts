import { ConvexError, v } from "convex/values";
import { internalMutation, MutationCtx, QueryCtx } from "./_generated/server";
import { roles } from "./schema";


export async function getUser(ctx: QueryCtx | MutationCtx, tokenIdentifier: string) {
    return ctx.db.query('users')
        .withIndex('by_tokenIdentifier', (q) => q.eq("tokenIdentifier", tokenIdentifier))
        .first()
} 


export const createUser = internalMutation({
    args: {
        tokenIdentifier: v.string()
    },
    async handler(ctx, args) {
        await ctx.db.insert('users', {
            tokenIdentifier: args.tokenIdentifier,
            orgIds: []
        })
    },
})

export const addOrgIdToUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string(),
        role: roles
    },
    async handler(ctx, args) {
        const user = await getUser(ctx, args.tokenIdentifier)

        if (!user) {
            throw new ConvexError("Expect user to be defined")
        }

        await ctx.db.patch(user._id, {
            orgIds: [...user.orgIds, { orgId: args.orgId, role: args.role}]
        })
    },
})

export const updateUserRoleInOrg = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string(),
        role: roles
    },
    async handler(ctx, args) {
        const user = await getUser(ctx, args.tokenIdentifier)

        if (!user) {
            throw new ConvexError("Expect user to be defined")
        }

        const orgInfo = user.orgIds.find(org => org.orgId === args.orgId)

        if (!orgInfo) return

        orgInfo.role = args.role

        await ctx.db.patch(user._id, {
            orgIds: user.orgIds
        })
    },
})