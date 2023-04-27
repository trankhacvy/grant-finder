import { Noto_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/globals.css"
import type { AppProps } from "next/app"

const notosans = Noto_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
})

const MyApp = ({ Component, pageProps }: AppProps) => (
  <>
    <style jsx global>{`
      html {
        font-family: ${notosans.style.fontFamily};
      }
    `}</style>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
    </ThemeProvider>
  </>
)

export default MyApp
