import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getData } from "@/lib/data"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function ItemPage({ params }: { params: { id: string } }) {
  const { items } = getData()
  const item = items.find((item) => item.id === params.id)

  if (!item) {
    notFound()
  }

  return (
    <main className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">{item.title}</CardTitle>
          <CardDescription>{item.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>{item.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">カテゴリー</h3>
                <p className="text-muted-foreground">{item.category}</p>
              </div>
              <div>
                <h3 className="font-medium">作成日</h3>
                <p className="text-muted-foreground">{item.createdAt}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              一覧に戻る
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}

export function generateStaticParams() {
  const { items } = getData()
  return items.map((item) => ({
    id: item.id,
  }))
}

