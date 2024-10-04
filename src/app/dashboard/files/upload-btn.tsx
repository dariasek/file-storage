"use client"
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Doc } from "../../../../convex/_generated/dataModel";

const formSchema = z.object({
    title: z.string().min(1).max(200),
    files: z
        .custom<FileList | null>(val => val instanceof FileList)
        .refine(files => files && files.length > 0, 'Required Field')
})

export function UploadBtn() {
    const organization = useOrganization()
    const user = useUser()

    const orgId = user.isLoaded && organization.isLoaded && (organization.organization?.id ?? user.user?.id)

    const createFile = useMutation(api.files.createFile)
    const generateUploadUrl = useMutation(api.files.generateUploadUrl)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            files: null
        },
    })
    const fileRef = form.register('files')

    const [fileDialogOpen, setFileDialogOpen] = useState(false)
    const { toast } = useToast()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!values.files || !orgId) return

        const postUrl = await generateUploadUrl()
        const fileType = values.files[0].type

        const result = await fetch(postUrl, {
            method: 'POST',
            headers: { "Content-Type": fileType },
            body: values.files[0],
        })

        const { storageId } = await result.json()

        const types = {
            'image/png': 'image',
            'image/svg+xml': 'image',
            'text/csv': 'csv',
            'application/pdf': 'pdf'
        } as Record<string, Doc<"files">["type"]>

        try {
            await createFile({
                name: values.title,
                fileId: storageId,
                orgId,
                type: types[fileType]
            })

            setFileDialogOpen(false)
            form.reset()

            toast({
                variant: 'success',
                title: 'File Uploaded',
                description: 'Meow meow meow'
            })
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Smth went wrond',
                description: 'Not meow meow meow'
            })
        }

    }


    return (
        <Dialog open={fileDialogOpen} onOpenChange={(isOpen) => {
            setFileDialogOpen(isOpen)
            form.reset()
        }}>
            <DialogTrigger asChild>
                <Button
                    onClick={() => {
                        if (!orgId) return
                    }}>Upload File</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="mb-4">Upload your file here</DialogTitle>
                    <DialogDescription>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="files"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>File</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    {...fileRef}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ''}
                                    Submit
                                </Button>
                            </form>
                        </Form>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
