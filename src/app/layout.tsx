import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalAudioPlayer } from "@/components/global-audio-player";
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
  title: "ShieldPath — segurança de aplicações na prática",
  description:
    "Aprenda a identificar riscos e proteger aplicações com trilhas guiadas, laboratórios seguros e correções validadas por testes.",
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
        <MotionPreference reduce={reduce}>
          {children}
          <GlobalAudioPlayer />
        </MotionPreference>
      </body>
    </html>
  );
}
