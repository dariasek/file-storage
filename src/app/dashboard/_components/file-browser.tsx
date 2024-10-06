"use client"
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Image from "next/image";
import { GridIcon, Loader2, Rows } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { SearchBar } from "@/app/dashboard/files/search-bar";
import { FileCard } from "@/app/dashboard/files/file-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UploadBtn } from "../files/upload-btn";
import { DataTable } from "./file-table";
import { columns } from "./columns";


export default function FileBrowser({
  title,
  favorites,
  trash
}: {
  title: string,
  favorites?: boolean,
  trash?: boolean,
}) {
  const organization = useOrganization()
  const user = useUser()
  const [query, setQuery] = useState('')

  const orgId = user.isLoaded && organization.isLoaded && (organization.organization?.id ?? user.user?.id)

  const favoriteFiles = useQuery(api.files.getFavorites, orgId ? { orgId } : 'skip')

  let files = useQuery(api.files.getFiles, orgId ? { orgId, query, favorites, trash } : 'skip')
  // const files = useQuery(api.files.getFiles, 'skip')
  if (files) {
    files = files.map(file => {
      return {
        ...file,
        isFavorite: favoriteFiles?.some(fav => fav.fileId == file._id)
      }
    })
  }

  return (
    <div>
      {
        files === undefined
          ? <div className="flex flex-col gap-8 items-center justify-center mt-20 text-gray-400">
            <Loader2 className="w-32 h-32 animate-spin" />
            <div className="text-2xl">Loading...</div>
          </div>
          : ''
      }
      {
        files && files.length > 0 || query !== ''
          ? <>
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold">{title}</h1>
              <SearchBar setQuery={setQuery} />
              <UploadBtn />
            </div>
            <Tabs defaultValue="grid">
              <TabsList className="mt-4">
                <TabsTrigger value="grid" className="gap-2">
                  <GridIcon />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="table" className="gap-2">
                  <Rows />
                  Table
                </TabsTrigger>
              </TabsList>
              <TabsContent value="grid">
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {
                    files?.map(file => {
                      return <FileCard key={file._id} file={file} />
                    })
                  }
                </div>
              </TabsContent>
              <TabsContent value="table">
                <DataTable columns={columns} data={files ?? []} />
              </TabsContent>
            </Tabs>
          </>
          : files ? <div className="flex flex-col gap-8 items-center justify-center mt-20 ">
            <Image
              alt="Cats that sit by a Welcome word"
              src='/undraw_welcome_cats_thqn.svg'
              width={400}
              height={400}
            />
            <div className="text-2xl">You have no files, upload one now</div>
            <UploadBtn />
          </div> : ''
      }
    </div>
  );
}
