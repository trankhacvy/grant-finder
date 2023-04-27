import { createClient } from "@supabase/supabase-js"
import { GrantItem } from "@/types/schema"
import { GrantCard } from "@/components/grant-card"
import { Layout } from "@/components/layout"
import { SearchDialog } from "@/components/search-dialog"

export default function IndexPage({ grants }: { grants: GrantItem[] }) {
  return (
    <Layout>
      <section className="max-w-screen-xl mx-auto px-4 py-24">
        <div className="max-w-screen-sm mx-auto text-center mb-10">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Web3 Grants
          </h1>
          <p className="text-xl mt-6">
            Grants are an equity-free source of funding to help builders of all
            types get to work.
          </p>
          <div className="mt-10">
            <SearchDialog />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {grants.map((item) => (
            <GrantCard grant={item} key={item.id} />
          ))}
        </div>
      </section>
    </Layout>
  )
}

export async function getStaticProps(context) {
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabaseClient.from("tbl_instagrants").select("*")

  return {
    props: {
      grants: data,
    },
  }
}
