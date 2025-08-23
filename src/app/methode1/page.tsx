// "use client";
// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import SidebarLogin from "../sidebarLogin";

// export default function Methode1() {
//   const [user, setUser] = useState<any>(null);
//   const [projectName, setProjectName] = useState("");
//   const [creating, setCreating] = useState(false);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     supabase.auth.getUser().then(({ data }) => setUser(data.user));
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });
//     return () => { listener?.subscription.unsubscribe(); };
//   }, []);

//   if (!user) {
//     return (
//       <div style={{ maxWidth: 400, margin: '4rem auto', padding: '2rem', background: '#232b5d', borderRadius: 12, boxShadow: '0 2px 16px #0002' }}>
//         <h2 style={{ color: '#fff', marginBottom: 24, textAlign: 'center' }}>Bitte einloggen oder registrieren</h2>
//         <SidebarLogin />
//       </div>
//     );
//   }

//   async function handleCreateProject(e: React.FormEvent) {
//     e.preventDefault();
//     setCreating(true);
//     setMessage("");
//     const { error } = await supabase.from("projekte").insert({
//       name: projectName,
//       user_id: user.id,
//     });
//     if (error) {
//       setMessage("Fehler beim Anlegen: " + error.message);
//     } else {
//       setMessage(`Projekt "${projectName}" wurde angelegt!`);
//       setProjectName("");
//     }
//     setCreating(false);
//   }

//   return (
//     <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
//       <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Neue ethnographische Forschung</h1>
//       <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
//         Lege ein neues Projekt an, indem du einen Namen vergibst:
//       </p>
//       <form onSubmit={handleCreateProject} style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
//         <input
//           type="text"
//           placeholder="Projektname"
//           value={projectName}
//           onChange={e => setProjectName(e.target.value)}
//           required
//           style={{ padding: 10, borderRadius: 8, border: '1px solid #b3c7ff', minWidth: 220, fontSize: '1rem' }}
//         />
//         <button
//           type="submit"
//           disabled={creating || !projectName.trim()}
//           style={{ padding: '10px 20px', borderRadius: 8, background: '#30418a', color: '#fff', fontWeight: 600, border: 'none', fontSize: '1rem', cursor: 'pointer' }}
//         >
//           {creating ? "Anlegen..." : "Neues Projekt anlegen"}
//         </button>
//       </form>
//       {message && <div style={{ color: message.startsWith('Fehler') ? '#b00' : '#1a237e', fontWeight: 500, marginTop: 8 }}>{message}</div>}
//     </div>
//   );
// } 