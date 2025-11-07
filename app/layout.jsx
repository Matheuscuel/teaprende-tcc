// app/layout.jsx
import "./globals.css";
import ConfigProvider from "./components/ConfigProvider";

export const metadata = { 
  title: "TEAprende",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      </head>
      <body className="antialiased">
        <ConfigProvider>{children}</ConfigProvider>
      </body>
    </html>
  );
}
