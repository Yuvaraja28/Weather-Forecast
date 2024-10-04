import "./globals.css";

export const metadata = {
  title: "Weather Forecast App",
  description: "Weather Forecast App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
