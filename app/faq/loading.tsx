import { Skeleton } from "@/components/ui/skeleton"

export default function FAQLoading() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="mb-6">
                <Skeleton className="h-16 w-full mb-2" />
                {i === 0 && <Skeleton className="h-24 w-full" />}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Skeleton className="h-6 w-48 mx-auto mb-4" />
            <Skeleton className="h-10 w-64 mx-auto rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
