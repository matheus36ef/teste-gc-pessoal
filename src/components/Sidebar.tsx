'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Server, Database, Cloud, Terminal } from 'lucide-react';
import styles from '../app/layout.module.css';

const navItems = [
  { name: 'Visão Geral', href: '/', icon: LayoutDashboard },
  { name: 'Hospedagem', href: '/hosting', icon: Server },
  { name: 'Bancos de Dados', href: '/database', icon: Database },
  { name: 'Funções', href: '/functions', icon: Terminal },
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
