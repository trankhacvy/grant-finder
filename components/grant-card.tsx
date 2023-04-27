import * as React from "react"

import { GrantItem } from "@/types/schema"

import { Badge } from "./ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"

export function GrantCard({ grant }: { grant: GrantItem }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{grant.name}</CardTitle>
        <CardDescription className="font-medium">{grant.org}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-start justify-start flex-col">
        <Badge variant="secondary" className="mb-3">
          {grant.status}
        </Badge>
        <Badge className="mb-3" variant="destructive">
          {grant.reward}
        </Badge>
        <div className="flex flex-wrap mt-4 gap-2">
          {grant.tags.map((item) => (
            <Badge key={item}>{item}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
