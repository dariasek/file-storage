import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Doc } from "../../../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { DownloadIcon, GanttChartIcon, ImageIcon, MoreVertical, StarIcon, TextIcon, TrashIcon, Undo } from "lucide-react"
import { ReactNode, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Protect } from "@clerk/nextjs"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { formatRelative } from 'date-fns'


function FileCardActions({file, isFavorite}: {file: FileWithUrl, isFavorite?: boolean}) {
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const deleteFile = useMutation(api.files.deleteFile)
    const restoreFile = useMutation(api.files.restoreFile)
    const toggleFavorites = useMutation(api.files.toggleFavorite)
    const { toast } = useToast()


    return <>
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will mark file for deletion.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => {
                            try {
                                await deleteFile({ fileId: file._id })
                                toast({
                                    title: 'File marked to be deleted',
                                    variant: 'default',
                                    // description: ''
                                })
                            } catch (e) {
                                console.log(e)
                                toast({
                                    title: 'Something went wrong',
                                    variant: 'destructive',
                                })
                            }
                        }}
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <DropdownMenu>
            <DropdownMenuTrigger><MoreVertical /></DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                 className="flex gap-1 items-center cursor-pointer"
                 onClick={async () => {
                    try {
                        await toggleFavorites({
                            fileId: file._id
                        })
                    } catch (e) {
                        toast({
                            title: 'Something went wrong',
                            variant: 'destructive',
                        })
                    }
                 }}
                >
                    <StarIcon className={`w-4 h-4 ${isFavorite ? 'text-yellow-400' : ''}`} />
                    Favorite
                </DropdownMenuItem>
                <DropdownMenuItem
                 className="flex gap-1 items-center cursor-pointer"
                 onClick={() => {
                    return file.url && window.open(file.url, '_blank')
                }}
                >
                    <DownloadIcon className="w-4 h-4" />
                    Download
                </DropdownMenuItem>
                <Protect
                    role="org:admin"
                >
                    <DropdownMenuSeparator />
                    {
                        file.toDelete
                            ? <DropdownMenuItem
                                className="flex gap-1 items-center text-green-400 cursor-pointer"
                                onClick={() => { restoreFile({fileId: file._id}) }}
                            >
                                <Undo className="w-4 h-4" />
                                Restore
                            </DropdownMenuItem>
                            : <DropdownMenuItem
                                className="flex gap-1 items-center text-red-600 cursor-pointer"
                                onClick={() => { setDeleteConfirmOpen(true) }}
                            >
                                <TrashIcon className="w-4 h-4" />
                                Delete
                            </DropdownMenuItem>
                    }
                </Protect>
            </DropdownMenuContent>
        </DropdownMenu>
    </>
}

type FileWithUrl = Doc<"files"> & { url: string | null }

export function FileCard({ file, isFavorite }: { file: FileWithUrl, isFavorite?: boolean }) {
    const typeIcons = {
        'image': <ImageIcon />,
        'csv': <GanttChartIcon />,
        'pdf': <TextIcon />
    } as Record<Doc<'files'>['type'], ReactNode>

    const userProfile = useQuery(api.users.getUserProfile, { userId: file.userId })


    return <Card>
        <CardHeader className="relative">
            <CardTitle className="flex gap-2">
                {typeIcons[file.type]}
                {file.name}
            </CardTitle>
            <div className="absolute top-2 right-1">
                <FileCardActions file={file} isFavorite={isFavorite} />
            </div>
        </CardHeader>
        <CardContent className="h-[200px] flex justify-center">
            {/* TODO: Add preview for other formats */}
            {
                file.type == 'image' && file.url
                    ? <Image src={file.url} alt={file.name} width={200} height={100} />
                    : ''
            }
        </CardContent>
        <CardFooter className="flex justify-between">
            {/* TODO: Add real download */}
            <div className="flex text-xs text-gray-400 gap-2 items-center">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={userProfile?.image} />
                </Avatar>
                {userProfile?.name}
            </div>
            <div className="text-xs text-gray-400">
                Uploaded on {formatRelative(new Date(file._creationTime), new Date())}
            </div>
        </CardFooter>
    </Card>
}