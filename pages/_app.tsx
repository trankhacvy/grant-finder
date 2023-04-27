import { fontSans } from "@/lib/fonts"
import { ThemeProvider } from "@/components/theme-provider"

import "@/styles/globals.css"
import type { AppProps } from "next/app"

const MyApp = ({ Component, pageProps }: AppProps) => (
  <div className={fontSans.variable}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
    </ThemeProvider>
  </div>
)

export default MyApp
