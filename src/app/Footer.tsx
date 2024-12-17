import Link from "next/link";

export function Footer() {
    return <div className="h-40 mt-12 bg-gray-100">
        <div className="container flex flex-col pt-8 ms-8 gap-4">
            <Link href='/about' className="text-blue-400 hover:text-blue-500" >About</Link>
            <Link href='/privacyPolicy' className="text-blue-400 hover:text-blue-500" >Privacy Policy</Link>
            <Link href='/termOfService' className="text-blue-400 hover:text-blue-500" >Terms of Service</Link>

        </div>
    </div>
}