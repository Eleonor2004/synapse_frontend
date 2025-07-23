// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The `suppressHydrationWarning` is recommended by next-themes
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}