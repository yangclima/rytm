import './globals.css';

export const metadata = {
  title: 'Rytm',
  description: 'Rytm – simplifique sua rotina e maximize sua produtividade.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
