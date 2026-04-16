import "./globals.css";

export const metadata = {
  title: "Cebuano Recipes",
  description: "Authentic recipes by Kasey Banawa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* This connects directly to Fontshare's servers */}
        <link 
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Satoshi', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}