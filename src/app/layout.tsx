import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionPreference } from "@/components/motion-preference";
import { getCurrentUser } from "@/lib/current-user";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShieldPath — feche o buraco que você acabou de entender",
  description:
    "Trilha para devs júnior. Aprenda o ataque no laboratório, defenda no código e saia com o selo.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Preferência do perfil (seção 11.2). O CSS e o `motion` leem `data-motion="reduce"`.
  const user = await getCurrentUser();
  const reduce = user?.reduceMotion === true;

  return (
    <html
      lang="pt-BR"
      data-motion={reduce ? "reduce" : undefined}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink text-text">
        <MotionPreference reduce={reduce}>{children}</MotionPreference>
      </body>
    </html>
  );
}
