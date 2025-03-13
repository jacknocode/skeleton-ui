import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getData } from "@/lib/data"
import { ChevronRight } from "lucide-react"

export default function Home() {
  const { items } = getData()

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">アイテム一覧</h1>
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted px-4 py-3 font-medium flex">
          <div className="flex-1">タイトル</div>
          <div className="w-32 hidden md:block">カテゴリー</div>
          <div className="w-32 hidden md:block">作成日</div>
          <div className="w-24 text-right">アクション</div>
        </div>
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.id} className="px-4 py-3 flex items-center hover:bg-muted/50">
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground md:hidden">
                  {item.category} • {item.createdAt}
                </div>
              </div>
              <div className="w-32 hidden md:block text-muted-foreground">{item.category}</div>
              <div className="w-32 hidden md:block text-muted-foreground">{item.createdAt}</div>
              <div className="w-24 text-right">
                <Link href={`/items/${item.id}`}>
                  <Button variant="ghost" size="sm">
                    <span className="sr-only">詳細を見る</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

