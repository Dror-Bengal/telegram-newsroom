import Link from "next/link";
import Image from "next/image";
import { ui } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/1.png"
                alt="Pressroom"
                width={160}
                height={45}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-500 mb-4">
              {ui.tagline}
            </p>
          </div>

          <nav className="flex items-center gap-5 text-sm text-gray-600">
            <Link href="/">Latest edition</Link>
            <Link href="/#bulletins">Breaking updates</Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">{ui.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
