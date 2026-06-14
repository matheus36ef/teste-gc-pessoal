'use client';

import { Bell, Settings, Search } from 'lucide-react';
import styles from '../app/layout.module.css';
import { usePathname } from 'next/navigation';

export default function Topbar() {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname === '/') return 'Visão Geral';
    if (pathname.startsWith('/hosting')) return 'Hospedagem de Apps';
    if (pathname.startsWith('/database')) return 'Bancos de Dados';
    if (pathname.startsWith('/functions')) return 'Funções Serverless';
    return 'Painel de Controle';
  };

  return (
    <header className={styles.topbar}>
      <h2 className={styles.topbarTitle}>{getPageTitle()}</h2>
      <div className={styles.topbarActions}>
        <button className={styles.iconBtn}>
          <Search size={20} />
        </button>
        <button className={styles.iconBtn}>
          <Bell size={20} />
        </button>
        <button className={styles.iconBtn}>
          <Settings size={20} />
        </button>
        <div className={styles.avatar}>
          ME
        </div>
      </div>
    </header>
  );
}
