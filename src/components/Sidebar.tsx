'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Server, Database, Cloud, Terminal, HardDrive, ScrollText, Clock } from 'lucide-react';
import styles from '../app/layout.module.css';

const navItems = [
  { name: 'Visão Geral', href: '/', icon: LayoutDashboard },
  { name: 'Hospedagem', href: '/hosting', icon: Server },
  { name: 'Bancos de Dados', href: '/database', icon: Database },
  { name: 'Funções Serverless', href: '/functions', icon: Terminal },
  { name: 'Cloud Storage', href: '/storage', icon: HardDrive },
  { name: 'Cloud Logging', href: '/logs', icon: ScrollText },
  { name: 'Scheduler (Cron)', href: '/scheduler', icon: Clock },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Cloud style={{ color: 'var(--primary-color)' }} size={28} />
        <span>Minha Nuvem</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
