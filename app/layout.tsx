import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'
import { eventAppearance } from '@/lib/theme.config'

export const metadata: Metadata = {
  title: 'Trip Planner',
  description: 'Plan your trip here',
  generator: 'smartdestinations.ai',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
     <html lang="en">
   <body suppressHydrationWarning={true}>
     <ThemeProvider appearance={eventAppearance}>{children}</ThemeProvider>
   </body>
    </html>
  )
}
