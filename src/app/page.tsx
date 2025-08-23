import Image from "next/image";
import styles from "./styles/page.module.css";

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
        color: 'red',
        textShadow: '0 2px 12px rgba(0,0,0,0.1)',
      }}>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Willkommen bei Ethno-Log</h1>
        
        
        <p style={{ fontSize: '1.2rem', maxWidth: 600, textAlign: 'center', color: 'var(--foreground)'  }}>
          Diese Webseite bietet dir praktische Tools und Anleitungen, um ethnographische Methoden einfach und digital umzusetzen.
        </p>

        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>

          <a href="/projekte" style={{ padding: '1rem 2rem', background: 'var(--button)', borderRadius: 8, textDecoration: 'none', color: 'var(--background)', fontWeight: 500, fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
            Neue ethnographische Forschung
          </a>
        </div>
      </div>
    </div>
  );
}
 