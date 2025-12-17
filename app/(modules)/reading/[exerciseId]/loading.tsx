export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="border-b glass sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mt-2 animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Passage skeleton */}
          <div className="p-6 border rounded-lg">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6 animate-pulse" />
            </div>
          </div>

          {/* Questions Skeletons */}
          <div className="p-6 border rounded-lg">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4 animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-3 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
