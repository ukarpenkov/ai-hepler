import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const blackOpsOne = localFont({
  src: "../public/fonts/BlackOpsOne-Regular.ttf",
  variable: "--font-black-ops-one",
});

export const metadata: Metadata = {
  title: "HireChat",
  description: "Practice interviews with AI",
};

const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {}
})()
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} ${blackOpsOne.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
