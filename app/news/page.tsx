import { Card, CardContent } from '@/components/ui/card';
import { fetchEconomicArticles } from '@/lib/api/article';
import Image from 'next/image';

export default async function NewsPage() {
  const { data: articles, error } = await fetchEconomicArticles();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">경제 뉴스</h1>
      {error ? (
        <div>기사를 불러오는 데 실패했어요. 잠시 후에 다시 시도해 주세요.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles?.map((item) => (
            <Card
              key={item.id}
              className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            >
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                <div className="relative w-full h-40">
                  <Image
                    src={item.thumbnailUrl || '/placeholder.svg'}
                    alt={item.title || '뉴스 이미지'}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium line-clamp-2 text-sm">
                    {item.title}
                  </h3>
                </CardContent>
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
