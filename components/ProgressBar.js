import React from 'react'

const Progressbar = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-blue-950 py-16 relative">
      {/* Linear Progress Bar at Top */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 overflow-hidden z-50">
        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-[loading_2s_ease-in-out_infinite]"></div>
      </div>

      {/* Circular Progress Bar in Center */}
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div role='progressbar' className='border-4 border-gradient-blue-purple border-r-transparent w-12 h-12 rounded-full animate-spin m-1'>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )

}

export { Progressbar }