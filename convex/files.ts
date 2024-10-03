import { ConvexError, v } from "convex/values"
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server"
import { getUser } from "./users"
import { fileTypes } from "./schema"

async function hasAccessToOrg(
    ctx: QueryCtx | MutationCtx,
    tokenIdentifier: string,
    orgId: string
) {
    const user = await getUser(ctx, tokenIdentifier)

    if (!user) {
        throw new ConvexError("Expect user to be defined")
    }

    const hasAccess = user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId)

    return hasAccess
}

export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
        throw new ConvexError('You must be logged in to create a file')
    }
    return await ctx.storage.generateUploadUrl()
})

export const createFile = mutation({
    args: {
        name: v.string(),
        fileId: v.id("_storage"),
        orgId: v.string(),
        type: fileTypes
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new ConvexError('You must be logged in to create a file')
        }

        const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, args.orgId)

        if (!hasAccess) {
            throw new ConvexError("You don't have access")
        }

        await ctx.db.insert('files', {
            name: args.name,
            orgId: args.orgId,
            fileId: args.fileId,
            type: args.type
        })
    }
})

export const deleteFile = mutation({
    args: {
        fileId: v.id('files')
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new ConvexError('You must be logged in')
        }

        const file = await ctx.db.get(args.fileId)

        if (!file) {
            throw new ConvexError('File does not exist')
        }

        const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, file.orgId)

        if (!hasAccess) {
            throw new ConvexError("You don't have access")
        }

        await ctx.db.delete(args.fileId)
        await ctx.storage.delete(file.fileId);
    }
})

export const getFiles = query({
    args: {
        orgId: v.string()
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            return []
        }

        const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, args.orgId)

        if (!hasAccess) {
            return []
        }

        const files = await ctx.db.query('files')
            .withIndex('by_orgId', q => q.eq('orgId', args.orgId))
            .collect()

        return Promise.all(
            files.map(async file => {
                return {
                    ...file,
                    url: await ctx.storage.getUrl(file.fileId)
                }
            })
        )
    } 
})