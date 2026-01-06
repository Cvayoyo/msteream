  import { Geist, Geist_Mono } from "next/font/google";
  import "./globals.css";
  import NextAuthProvider from "./components/NextAuthProvider";
  import Footer from "./components/Footer";
  import NavigationDrawer from "./components/NavigationDrawer";
  import { DrawerProvider } from "./components/DrawerProvider";
  import { AuthUserSession } from "./libs/auth-libs";

  const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });

  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });

  export const metadata = {
    title: "StudentArt-Anime",
    description: "Web Steraming Anime Sub Indo",
  };

  export default async function RootLayout({ children }) {
    const user = await AuthUserSession();
    
    return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`} 
        >
          <NextAuthProvider>
            <DrawerProvider drawer={<NavigationDrawer user={user} />}>
              {children}
            </DrawerProvider>
            <Footer />
          </NextAuthProvider>
        </body>
      </html>
    );
  }
