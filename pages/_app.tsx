import { ThemeProvider } from "@/components/theme-provider"
import { fontSans } from "@/lib/fonts"
import "@/styles/globals.css"
import type { AppProps } from "next/app"

const MyApp = ({ Component, pageProps }: AppProps) => (
  <>
    <style jsx global>{`
      html {
        font-family: ${fontSans.style.fontFamily};
      }
    `}</style>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
    </ThemeProvider>
  </>
)

export default MyApp
