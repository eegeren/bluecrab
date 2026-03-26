import type { Metadata } from "next"
import { Manrope, Space_Grotesk } from "next/font/google"
import "./globals.css"

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" })
const heading = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" })

export const metadata: Metadata = {
  title: "BlueCrab",
  description: "BlueCrab is a premium Reddit-like platform for communities, posts, comments, and discovery.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${sans.variable} ${heading.variable} bg-[#07111d] font-sans antialiased`}>{children}</body>
    </html>
  )
}
