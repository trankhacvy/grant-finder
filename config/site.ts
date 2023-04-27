export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Superteam Instagrants",
  description:
    "Beautifully designed components built with Radix UI and Tailwind CSS.",
  mainNav: [
    {
      title: "Instagrants",
      href: "/",
    },
    {
      title: "All Bounties",
      href: "/",
    },
    {
      title: "All Jobs",
      href: "/",
    },
  ],
  links: {
    twitter: "https://twitter.com/home",
    github: "https://github.com/trankhacvy/grant-finder",
  },
}
