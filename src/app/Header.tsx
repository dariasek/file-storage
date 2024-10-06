import { Button } from "@/components/ui/button";
import { OrganizationSwitcher, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export function Header() {
    return <div className="border-b py-4 bg-gray-50">
        <div className="flex justify-between items-center container mx-auto">
            <Link href='/' className="flex gap-2 items-center">
                <Image src='/logo.svg' alt="Cat Image" width='80' height='80' />
                File Drive
            </Link>
            <Link href='/dashboard/files'>
                <Button variant='outline'>
                    Your Files
                </Button>
            </Link>
            <div className="flex gap-2">
                <OrganizationSwitcher />
                <UserButton />
                <SignedOut>
                    <SignInButton>
                        <Button>Sign In</Button>
                    </SignInButton>
                </SignedOut>
            </div>
        </div>
    </div>
}