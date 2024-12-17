"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Id } from "../../../../convex/_generated/dataModel"
import { formatRelative } from "date-fns"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { FileCardActions, FileWithUrl } from "../files/file-card"

function UserCell({userId}:{ userId: Id<'users'>}) {
    const userProfile = useQuery(api.users.getUserProfile, { userId: userId})

    return <div className="flex gap-2 items-center">
        <Avatar className="w-8 h-8">
            <AvatarImage src={userProfile?.image} />
        </Avatar>
        {userProfile?.name}
    </div>
}

export const columns: ColumnDef<FileWithUrl, string>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    header: 'Uploaded On',
    cell: ({ row }) => {
        return <div>
            {formatRelative(new Date(row.original._creationTime), new Date())}
        </div>
    }
  },
  {
    header: 'User',
    cell: ({ row }) => {
        return <UserCell userId={row.original.userId} />
    }
  },
  {
    header: 'Actions',
    cell: ({ row }) => {
        return <FileCardActions file={row.original}  isFavorite={row.original.isFavorite} />
    }
  }
]
