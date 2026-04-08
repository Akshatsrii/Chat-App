import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexChat — Connect. Chat. Collaborate.",
  description: "A modern real-time chat platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}