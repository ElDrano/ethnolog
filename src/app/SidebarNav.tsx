"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import SidebarLogin from "./sidebarLogin";
import { supabase } from "./supabaseClient";
import { useEffect, useState } from "react";

function ProjekteButton() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  const handleProjekteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === '/projekte') {
      window.location.href = '/projekte';
    } else {
      router.push('/projekte');
    }
  };

  if (!user) return null;
  return (
    <li>
      <button 
        className="sidebar-link" 
        onClick={handleProjekteClick}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'linear-gradient(120deg, rgba(255,255,255,0.10) 0%, rgba(80,120,255,0.10) 100%)',
          color: '#e3eafe',
          fontWeight: 500,
          border: 'none',
          borderRadius: 10,
          padding: '0.75rem 1rem',
          boxShadow: '0 2px 8px 0 rgba(30,40,80,0.10) inset',
          transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          margin: 0
        }}
      >
        Projekte
      </button>
    </li>
  );
}

export default function SidebarNav() {
  return (
    <nav className="sidebar-nav">
      <h2 className="sidebar-title">Ethnographische Methoden</h2>
      <ul className="sidebar-list">
        <li><Link className="sidebar-link" href="/">Startseite</Link></li>
        <ProjekteButton />
      </ul>
      <SidebarLogin />
    </nav>
  );
} 