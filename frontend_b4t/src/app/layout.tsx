import "./globals.css";
import { Epilogue } from "next/font/google";

const epilogueFont = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${epilogueFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
