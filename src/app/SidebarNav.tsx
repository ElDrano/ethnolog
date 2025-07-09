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
    // Wenn wir bereits auf /projekte sind, Seite neu laden um zur Übersicht zurückzukehren
    if (pathname === '/projekte') {
      window.location.href = '/projekte';
    } else {
      router.push('/projekte');
    }
  };

  if (!user) return null;
  return (
    <li style={{ marginTop: 24 }}>
      <button 
        className="sidebar-link" 
        onClick={handleProjekteClick}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'inherit', 
          font: 'inherit', 
          cursor: 'pointer',
          textDecoration: 'none',
          padding: 0,
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
      <h2 className="sidebar-title">Ethnografische Methoden</h2>
      <ul className="sidebar-list">
        <li><Link className="sidebar-link" href="/">Startseite</Link></li>
        <li><Link className="sidebar-link" href="/methode1">Neue ethnographische Forschung</Link></li>
        <ProjekteButton />
      </ul>
      <SidebarLogin />
    </nav>
  );
} 