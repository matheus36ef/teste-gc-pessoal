import type { Metadata } from 'next';
import './globals.css';
import styles from './layout.module.css';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const metadata: Metadata = {
  title: 'Minha Nuvem - PaaS Privado',
  description: 'Gerenciador de Nuvem Privada (Hospedagem, Banco de Dados, Funções)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className={styles.layout}>
          <Sidebar />
          <div className={styles.mainContent}>
            <Topbar />
            <main className={styles.pageContent}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
