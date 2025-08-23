"use client";
import Link from "next/link";
import SidebarLogin from "./sidebarLogin";
import { supabase } from "./supabaseClient";
import { useEffect, useState } from "react";

function ProjekteButton() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  if (!user) return null;
  
  const handleProjekteClick = () => {
    // Wenn wir auf einem Projekt sind, zur Listenansicht zurückkehren
    if (window.location.pathname === '/projekte') {
      // Event an die ProjektePage senden, um selectedProjekt zurückzusetzen
      window.dispatchEvent(new CustomEvent('resetToProjekteList'));
    }
  };
  
  return (
    <li>
      <Link className="sidebar-link" href="/projekte" onClick={handleProjekteClick}>
        Projekte
      </Link>
    </li>
  );
}

export default function SidebarNav() {
  return (
    <nav className="sidebar-nav">
      <h2 className="sidebar-title">Ethno-Log</h2>
      <ul className="sidebar-list">
        <li><Link className="sidebar-link" href="/">Startseite</Link></li>
        <ProjekteButton />
      </ul>
      <SidebarLogin />
    </nav>
  );
} 