'use client'

import Image from 'next/image'

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#C8E84D] flex flex-col items-center justify-center">
      {/* Logo */}
      <div className="animate-scale-in">
        <Image
          src="/oqui-splash-logo.png"
          alt="OQUI"
          width={140}
          height={140}
          className="object-contain"
          priority
        />
      </div>

      {/* Loading spinner */}
      <div className="mt-10">
        <div className="w-8 h-8 rounded-full border-[3px] border-black/20 border-t-black animate-spin" />
      </div>
    </div>
  )
}
