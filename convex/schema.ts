import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileTypes = v.union(v.literal('pdf'), v.literal('csv'), v.literal('image'))
export const roles = v.union(v.literal('admin'), v.literal('member'))

export default defineSchema({
  files: defineTable({
    name: v.string(),
    orgId: v.string(),
    fileId: v.id("_storage"),
    type: fileTypes,
    toDelete: v.optional(v.boolean()),
    userId: v.id('users')
  })
    .index("by_orgId", ['orgId'])
    .index('by_toDelete', ['toDelete']),
  favorites: defineTable({
    fileId: v.id('files'),
    orgId: v.string(),
    userId: v.id('users')
  }).index('by_userId_orgId_fieldId', ['userId', 'orgId', 'fileId']),
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(v.object({
      orgId: v.string(),
      role: roles
    })),
    name: v.optional(v.string()),
    image: v.optional(v.string())
  }).index("by_tokenIdentifier", ['tokenIdentifier'])
});