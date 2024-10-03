import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Doc } from "../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { GanttChartIcon, ImageIcon, MoreVertical, TextIcon, TrashIcon } from "lucide-react"
import { ReactNode, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"


function FileCardActions({file}: {file: Doc<'files'>}) {
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const deleteFile = useMutation(api.files.deleteFile)
    const { toast } = useToast()

    return <>
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => {
                            try {
                                await deleteFile({ fileId: file._id })
                                toast({
                                    title: 'File Deleted',
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
                 className="flex gap-1 items-center text-red-600 cursor-pointer"
                 onClick={() => {setDeleteConfirmOpen(true)}}
                >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </>
}

type FileWithUrl = Doc<"files"> & { url: string }

export function FileCard({ file }: { file: FileWithUrl }) {
    const typeIcons = {
        'image': <ImageIcon />,
        'csv': <GanttChartIcon />,
        'pdf': <TextIcon />
    } as Record<Doc<'files'>['type'], ReactNode>

    return <Card>
        <CardHeader className="relative">
            <CardTitle className="flex gap-2">
                {typeIcons[file.type]}
                {file.name}
            </CardTitle>
            <div className="absolute top-2 right-1">
                <FileCardActions file={file} />
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
        <CardFooter className="flex justify-center">
            {/* TODO: Add real download */}
            <Button onClick={() => {
                window.open(file.url, '_blank')
            }}>Download</Button>
        </CardFooter>
    </Card>
}