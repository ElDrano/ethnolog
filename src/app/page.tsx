import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        marginTop: '4rem',
        color: 'var(--foreground)',
        textShadow: '0 2px 12px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Willkommen bei Ethno-Log</h1>
        <div style={{
          background: 'rgba(179,216,255,0.18)',
          borderLeft: '4px solid #b3d8ff',
          padding: '1.2rem 1.5rem',
          borderRadius: 8,
          fontSize: '1.08rem',
          maxWidth: 650,
          marginBottom: 8,
          lineHeight: 1.6
        }}>
          
        </div>
        <p style={{ fontSize: '1.2rem', maxWidth: 600, textAlign: 'center' }}>
          Diese Webseite bietet dir praktische Tools und Anleitungen, um ethnographische Methoden einfach und digital umzusetzen.
        </p>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          <a href="/projekte" style={{ padding: '1rem 2rem', background: 'var(--foreground)', borderRadius: 8, textDecoration: 'none', color: 'var(--background)', fontWeight: 500, fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
            Neue ethnographische Forschung
          </a>
        </div>
      </div>
    </div>
  );
}
 