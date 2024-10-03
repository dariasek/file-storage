"use client"
import { SignedIn, SignOutButton, useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UploadBtn } from "./upload-btn";
import { FileCard } from "./file-card";
import Image from "next/image";
import { Loader2 } from "lucide-react";


export default function Home() {
  const organization = useOrganization()
  const user = useUser()

  const orgId = user.isLoaded && organization.isLoaded && (organization.organization?.id ?? user.user?.id)

  const files = useQuery(api.files.getFiles, orgId ? { orgId: orgId } : 'skip')
  // const files = useQuery(api.files.getFiles, 'skip')

  return (
    <main className="container mx-auto pt-12">
      {/* <SignedIn>
        Good to see you here
        <SignOutButton>
          <Button>Tap to sign out</Button>
        </SignOutButton>
      </SignedIn> */}
      {
        files === undefined
          ? <div className="flex flex-col gap-8 items-center justify-center mt-20 text-gray-400">
            <Loader2 className="w-32 h-32 animate-spin" />
            <div className="text-2xl">Loading...</div>
          </div>
          : ''
      }
      {
        files && files.length > 0
          ? <>
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold">Your Files</h1>
              <UploadBtn />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-8">
              {
                files?.map(file => {
                  return <FileCard key={file._id} file={file} />
                })
              }
            </div>
          </>
          : files ? <div className="flex flex-col gap-8 items-center justify-center mt-20 ">
            <Image
              alt="Cats that sit by a Welcome word"
              src='./undraw_welcome_cats_thqn.svg'
              width={400}
              height={400}
            />
            <div className="text-2xl">You have no files, upload one now</div>
            <UploadBtn />
          </div> : ''

      }

    </main>
  );
}
