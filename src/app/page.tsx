"use client"
import { SignedIn, SignOutButton, useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { UploadBtn } from "./upload-btn";


export default function Home() {
  const organization = useOrganization()
  const user = useUser()

  const orgId = user.isLoaded && organization.isLoaded && (organization.organization?.id ?? user.user?.id)

  const files = useQuery(api.files.getFiles, orgId ? { orgId: orgId } : 'skip')

  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Your Files</h1>
        <UploadBtn />
      </div>
      <SignedIn>
        Good to see you here
        <SignOutButton>
          <Button>Tap to sign out</Button>
        </SignOutButton>
      </SignedIn>
      {
        files?.map(file => {
          return <div key={file._id}>
            {file.name}
          </div>
        })
      }
    </main>
  );
}
