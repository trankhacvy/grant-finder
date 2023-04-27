import { useEffect, useState } from "react"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import {
  CornerDownLeft,
  Frown,
  Loader,
  Search,
  User,
  Wand,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState<string>("")
  const [question, setQuestion] = useState<string>("")
  const [answer, setAnswer] = useState<string | undefined>("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  function handleModalToggle() {
    setOpen(!open)
    setSearch("")
    setQuestion("")
    setAnswer(undefined)
    setHasError(false)
    setIsLoading(false)
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    console.log(search)
    if (!search) return

    setAnswer(undefined)
    setQuestion(search)
    setSearch("")
    setHasError(false)
    setIsLoading(true)

    try {
      let message = ""
      await fetchEventSource("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: search,
        }),

        onmessage(event) {
          setIsLoading(false)

          if (event.data !== "" && event.data !== "CLOSE") {
            message += event.data
            setAnswer(message)
          }

          if (event.data === "CLOSE") {
          }
        },
        onclose() {
          console.log("closed")
        },
        onerror(error) {
          console.log("onerror", error)
        },
      })
    } catch (error) {}
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && e.metaKey) {
        setOpen(true)
      }

      if (e.key === "Escape") {
        console.log("esc")
        handleModalToggle()
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xl flex gap-2 items-center px-6 py-4 z-50 relative
        text-slate-500 dark:text-slate-400  hover:text-slate-700 dark:hover:text-slate-300
        transition-colors
        rounded-md
        border border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-500
        max-w-xl w-full mx-auto "
      >
        <Search width={24} />
        <span className="inline-block ml-4">Search...</span>
        <kbd
          className="absolute right-6 top-3.5
          pointer-events-none inline-flex h-8 select-none items-center gap-1
          rounded border border-slate-100 bg-slate-100 px-3
          font-mono text-sm font-medium
          text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400
          opacity-100 "
        >
          <span className="text-xs">⌘</span>K
        </kbd>{" "}
      </button>

      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-xl text-black">
          <DialogHeader>
            <DialogTitle>OpenAI powered grants search</DialogTitle>
            <hr />
            <button
              className="absolute top-0 right-2 p-2"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4 dark:text-gray-100" />
            </button>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 text-slate-700">
              {question && (
                <div className="flex gap-4">
                  <span className="bg-slate-100 dark:bg-slate-300 p-2 w-8 h-8 rounded-full text-center flex items-center justify-center">
                    <User width={18} />{" "}
                  </span>
                  <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-100">
                    {question}
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="animate-spin relative flex w-5 h-5 ml-2">
                  <Loader />
                </div>
              )}

              {hasError && (
                <div className="flex items-center gap-4">
                  <span className="bg-red-100 p-2 w-8 h-8 rounded-full text-center flex items-center justify-center">
                    <Frown width={18} />
                  </span>
                  <span className="text-slate-700 dark:text-slate-100">
                    Sad news, the search has failed! Please try again.
                  </span>
                </div>
              )}

              {answer && !hasError ? (
                <div className="flex gap-4 dark:text-white">
                  <span className="bg-green-500 p-2 w-8 h-8 rounded-full text-center flex items-center justify-center">
                    <Wand width={18} className="text-white" />
                  </span>
                  {answer}
                </div>
              ) : null}

              <div className="relative">
                <Input
                  placeholder="Ask a question..."
                  name="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="col-span-3"
                />
                <CornerDownLeft
                  className={`absolute top-3 right-5 h-4 w-4 text-gray-300 transition-opacity ${
                    search ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-100">
                Or try:{" "}
                <button
                  type="button"
                  className="px-1.5 py-0.5
                  bg-slate-50 dark:bg-gray-500
                  hover:bg-slate-100 dark:hover:bg-gray-600
                  rounded border border-slate-200 dark:border-slate-600
                  transition-colors"
                  onClick={(_) => setSearch("What is instagrant?")}
                >
                  What is instagrant?
                </button>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="bg-red-500">
                Ask
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
