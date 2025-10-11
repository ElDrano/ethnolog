"use client";
import Link from "next/link";
import SidebarLogin from "./sidebarLogin";
import { supabase } from "./supabaseClient";
import { useEffect, useState } from "react";

function ProjekteButton({ isCollapsed }: { isCollapsed: boolean }) {
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
      <Link className="sidebar-link" href="/projekte" onClick={handleProjekteClick} title="Projekte">
        {isCollapsed ? '📁' : 'Projekte'}
      </Link>
    </li>
  );
}

export default function SidebarNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Beim ersten Laden prüfen, ob Mobile-Gerät
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    checkMobile();
    
    // Optional: Bei Resize auch prüfen
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <nav className={`sidebar-nav ${isCollapsed ? 'collapsed' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', width: '100%' }}>
          <h2 className="sidebar-title">{!isCollapsed && 'Ethno-Log'}</h2>
        </div>
        <ul className="sidebar-list">
          <li><Link className="sidebar-link" href="/" title="Startseite">
            {isCollapsed ? '🏠' : 'Startseite'}
          </Link></li>
          <ProjekteButton isCollapsed={isCollapsed} />
          <li><Link className="sidebar-link" href="/profile" title="Profil">
            {isCollapsed ? '👤' : 'Profil'}
          </Link></li>
        </ul>
        {!isCollapsed && <SidebarLogin />}
      </nav>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="sidebar-toggle"
        aria-label={isCollapsed ? 'Menü öffnen' : 'Menü schließen'}
        title={isCollapsed ? 'Menü öffnen' : 'Menü schließen'}
      >
        {isCollapsed ? '☰' : '◄'}
      </button>
    </>
  );
} 