'use client'
import { Button } from "@/components/ui/button";
import { FileIcon, StarIcon, Trash } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SideNav() {
  const pathname = usePathname()

    return <div className="w-40 flex flex-col gap-2">
    <Link href='/dashboard/files'>
      <Button variant='link' className={`flex gap-2 ${pathname.includes('/dashboard/files') ? 'text-blue-400' : ''}`}>
        <FileIcon />
        All Files
      </Button>
    </Link>

    <Link href='/dashboard/favorites'>
      <Button variant='link' className={`flex gap-2 ${pathname.includes('/dashboard/favorites') ? 'text-blue-400' : ''}`}>
        <StarIcon />
        Favorites
      </Button>
    </Link>

    <Link href='/dashboard/trash'>
      <Button variant='link' className={`flex gap-2 ${pathname.includes('/dashboard/trash') ? 'text-blue-400' : ''}`}>
        <Trash />
        Trash
      </Button>
    </Link>
  </div>
}