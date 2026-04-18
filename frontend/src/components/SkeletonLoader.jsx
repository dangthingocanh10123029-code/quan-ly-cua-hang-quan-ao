import React from 'react'

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-[600px] w-full bg-surface-container-low"></div>

      {/* Categories Skeleton */}
      <div className="py-24 px-8 max-w-screen-2xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <div className="h-8 w-48 bg-surface-container-low rounded mb-2"></div>
            <div className="h-4 w-32 bg-surface-container-low rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[280px] md:auto-rows-[320px]">
          <div className="col-span-2 row-span-2 bg-surface-container-low rounded-xl"></div>
          <div className="col-span-2 row-span-1 bg-surface-container-low rounded-xl"></div>
          <div className="bg-surface-container-low rounded-xl"></div>
          <div className="bg-surface-container-low rounded-xl"></div>
        </div>
      </div>

      {/* Products Skeleton */}
      <div className="py-20 px-8 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="aspect-[3/4] bg-surface-container-low rounded-xl mb-4"></div>
              <div className="h-4 bg-surface-container-low rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-surface-container-low rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SkeletonLoader
