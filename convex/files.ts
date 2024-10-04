import { ConvexError, v } from "convex/values"
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server"
import { getUser } from "./users"
import { fileTypes } from "./schema"
import { Id } from "./_generated/dataModel"

async function hasAccessToOrg(
    ctx: QueryCtx | MutationCtx,
    orgId: string
) {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null 

    const user = await getUser(ctx, identity.tokenIdentifier)
    if (!user) return null 

    const hasAccess = user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId)
    if (!hasAccess) return null 

    return { user }
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
        const hasAccess = await hasAccessToOrg(ctx, args.orgId)

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
        const access = await hasAccessToFile(ctx, args.fileId)

        if (!access) {
            throw new ConvexError("You don't have access")
        }

        await ctx.db.delete(args.fileId)
        await ctx.storage.delete(access.file.fileId);
    }
})

async function hasAccessToFile(ctx: QueryCtx | MutationCtx, fileId: Id<'files'>) {
    const file = await ctx.db.get(fileId)

    if (!file) {
        return null
    }

    const access = await hasAccessToOrg(ctx, file.orgId)

    if (!access) {
        return null
    }

    if (!access.user) {
        return null
    }

    return { user: access.user, file }
}

export const toggleFavorite = mutation({
    args: {
        fileId: v.id('files')
    },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId)

        if (!access) {
            throw new ConvexError('No access')
        }

        const favorite = await ctx.db
            .query('favorites')
            .withIndex(
                'by_userId_orgId_fieldId',
                q => q
                    .eq('userId', access.user._id)
                    .eq('orgId', access.file.orgId)
                    .eq('fileId', access.file._id)
            )
            .first()

        if (!favorite) {
            await ctx.db.insert("favorites", {
                fileId: access.file._id,
                userId: access.user._id,
                orgId: access.file.orgId
            })
        } else {
            await ctx.db.delete(favorite._id)
        }
    }
})

export const getFavorites = query({
    args: {
        orgId: v.string()
    },
    async handler(ctx, args) {
        const access = await hasAccessToOrg(ctx, args.orgId)

        if (!access) {
            return []
         }

        return await ctx.db
            .query('favorites')
            .withIndex(
                'by_userId_orgId_fieldId',
                q => q
                    .eq('userId', access.user._id)
                    .eq('orgId', args.orgId)
            )
            .collect()
    }
})

export const getFiles = query({
    args: {
        orgId: v.string(),
        query: v.optional(v.string()),
        favorites: v.optional(v.boolean())
    },
    async handler(ctx, args) {
        const access = await hasAccessToOrg(ctx, args.orgId)

        if (!access) {
            return []
        }

        let files = await ctx.db.query('files')
            .withIndex('by_orgId', q => q.eq('orgId', args.orgId))
            .collect()

        if (args.query && args.query !== '') {
            files = files.filter(file => file.name.toLocaleLowerCase().includes(args.query!.toLocaleLowerCase()))
        }

        if (args.favorites && access.user) {
            const favorites = await ctx.db
                .query('favorites')
                .withIndex(
                    'by_userId_orgId_fieldId', 
                    q => q.eq('userId', access.user._id).eq('orgId', args.orgId)
                )
                .collect()

            files = files.filter(
                file => favorites.some(fav => fav.fileId == file._id)
            )
        }

        return Promise.all(
            files
                .map(async file => {
                    return {
                        ...file,
                        url: await ctx.storage.getUrl(file.fileId)
                    }
                })
        )
    } 
})