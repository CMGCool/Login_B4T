import { Epilogue } from "next/font/google";
const epilogueFont = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  weight: ["300", "400", "500", "600", "700"],
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <main>
          {children}
        </main>
  );
}
