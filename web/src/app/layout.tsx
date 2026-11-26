import "./globals.css";
import {TopTickerWrapper} from "@/components/TopTickerWrapper";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";
export const dynamic = "force-dynamic";
export const metadata={title:"Pressroom"};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased bg-white text-gray-900`}
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <TopTickerWrapper />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />

      </body>
    </html>
  );
}
