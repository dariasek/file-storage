"use client"
import { SignedIn, SignedOut, SignInButton, SignOutButton, useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function Home() {
  const organization = useOrganization()
  const user = useUser()

  const orgId =  user.isLoaded && organization.isLoaded && (organization.organization?.id ?? user.user?.id)

  const files = useQuery(api.files.getFiles, orgId ? { orgId: orgId } : 'skip')
  const createFile = useMutation(api.files.createFile)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SignedIn>
        Good to see you here
        <SignOutButton>
          <Button>Tap to sign out</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal"></SignInButton>
      </SignedOut>
      {
        files?.map(file => {
          return <div key={file._id}>
            {file.name}
          </div>
        })
      }
      <Button onClick={() => {
        if (!orgId) return
        createFile({ name: 'Test Name With org Id', orgId })
      }}>Click me</Button>
    </main>
  );
}
