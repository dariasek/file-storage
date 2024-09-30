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
import { MoreVertical, TrashIcon } from "lucide-react"
import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useToast } from "@/hooks/use-toast"


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


export function FileCard({ file }: { file: Doc<"files"> }) {

    return <Card>
        <CardHeader className="relative">
            <CardTitle>
                {file.name}
            </CardTitle>
            <div className="absolute top-2 right-1">
                <FileCardActions file={file} />
            </div>
        </CardHeader>
        <CardContent>
            <p>Card Content</p>
        </CardContent>
        <CardFooter>
            <Button>Download</Button>
        </CardFooter>
    </Card>
}