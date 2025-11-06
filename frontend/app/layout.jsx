import StyleOverrides from "./_components/StyleOverrides";
export const metadata = { title: "TEAprende" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui" }}>
    <StyleOverrides />
        {children}
      </body>
    </html>
  );
}