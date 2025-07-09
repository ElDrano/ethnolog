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
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Willkommen bei Ethnografische Methoden</h1>
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
          Die letzten Jahre – vor allem seit der Corona-Pandemie – haben Unternehmen vermehrt angefangen ihren Mitarbeitern die Möglichkeit zu geben, remote zu arbeiten. (Scott, 2022)<br/>
          Das bedeutet, dass sie, um ihre Arbeit zu erledigen nicht mehr zwingend 5 Tage die Woche ins Büro zu kommen. Dies hat sowohl Einfluss auf die Art und Weise, wie die Menschen in ihrer jeweiligen Organisation handeln als auch auf die Art und Weise wie man dies ethnographisch beobachten & analysieren kann/muss.
        </div>
        <p style={{ fontSize: '1.2rem', maxWidth: 600, textAlign: 'center' }}>
          Diese Website bietet dir praktische Tools und Anleitungen, um ethnografische Methoden einfach und digital umzusetzen. Wähle links im Menü eine Methode aus, um direkt zu starten.
        </p>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          <a href="/methode1" style={{ padding: '1rem 2rem', background: 'var(--foreground)', borderRadius: 8, textDecoration: 'none', color: 'var(--background)', fontWeight: 500, fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
            Neue ethnographische Forschung
          </a>
        </div>
      </div>
    </div>
  );
}
 