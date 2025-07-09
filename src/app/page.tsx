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
        color: '#fff',
        textShadow: '0 2px 12px #000a',
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Willkommen bei Ethnografische Methoden</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: 600, textAlign: 'center' }}>
          Diese Website bietet dir praktische Tools und Anleitungen, um ethnografische Methoden einfach und digital umzusetzen. Wähle links im Menü eine Methode aus, um direkt zu starten.
        </p>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          <a href="/methode1" style={{ padding: '1rem 2rem', background: 'rgba(30,41,126,0.85)', borderRadius: 8, textDecoration: 'none', color: '#fff', fontWeight: 500, fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
            Neue ethnographische Forschung
          </a>
        </div>
      </div>
    </div>
  );
}
 