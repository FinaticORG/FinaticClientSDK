import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/app/providers/ThemeProvider"
import { Suspense } from "react"
import { FinaticProvider } from "@/app/providers/FinaticProvider"
import { EnvironmentConfigProvider } from "@/app/providers/EnvironmentConfigProvider"

export const metadata: Metadata = {
  title: "DevPlatform - Developer Tools & Management",
  description: "Professional developer platform with authentication, data management, and trading tools",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <EnvironmentConfigProvider>
            <FinaticProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
              </ThemeProvider>
            </FinaticProvider>
          </EnvironmentConfigProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
