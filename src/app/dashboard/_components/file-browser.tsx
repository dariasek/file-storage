"use client"
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { SearchBar } from "@/app/dashboard/files/search-bar";
import { FileCard } from "@/app/dashboard/files/file-card";
import { UploadBtn } from "../files/upload-btn";


export default function FileBrowser({title, favorites}: {title: string, favorites?: boolean}) {
  const organization = useOrganization()
  const user = useUser()
  const [query, setQuery] = useState('')

  const orgId = user.isLoaded && organization.isLoaded && (organization.organization?.id ?? user.user?.id)

  const favoriteFiles = useQuery(api.files.getFavorites, orgId ? { orgId } : 'skip')

  const files = useQuery(api.files.getFiles, orgId ? { orgId, query, favorites } : 'skip')
  // const files = useQuery(api.files.getFiles, 'skip')



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
            <div className="grid grid-cols-3 gap-4 mt-8">
              {
                files?.map(file => {
                  return <FileCard key={file._id} file={file} isFavorite={favoriteFiles?.some(fav => fav.fileId == file._id)} />
                })
              }
            </div>
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
