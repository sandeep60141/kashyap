import type React from "react"
import Link from "next/link"
import { UserMenu } from "@/components/auth/user-menu"

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          My App
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <UserMenu />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
