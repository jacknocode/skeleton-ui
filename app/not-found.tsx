import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 text-center">
      <h2 className="text-3xl font-bold mb-4">ページが見つかりません</h2>
      <p className="text-muted-foreground mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
      <Link href="/">
        <Button>ホームに戻る</Button>
      </Link>
    </div>
  )
}

