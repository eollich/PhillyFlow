"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const images = ["/phlbw.jpg", "/basketball.avif", "/soccer.jpg", "/hiking.jpeg"];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image with Fade Effect */}
      <div
        key={currentImage} // Forces React to update the background
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 brightness-50 opacity-70"
        style={{
          backgroundImage: `url(${images[currentImage]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      <div className="relative z-10 text-center text-white p-6">
        <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Philly Flow</h1>
        <p className="text-lg text-gray-200 mb-6 drop-shadow-lg">
          Go with the flow
        </p>
        <Link href="/login">
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 transition">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
}

