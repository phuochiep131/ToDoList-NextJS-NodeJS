import { Space_Grotesk, DM_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "Danh sách công việc",
  description: "Danh sách công việc nhanh, gọn, xây bằng Next.js và Node.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${spaceGrotesk.variable} ${dmMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
