"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../supabaseClient";
import ProjektDetail from "../components/ProjektDetail";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function ProjektPage() {
  const router = useRouter();
  const params = useParams();
  const projektId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [projekt, setProjekt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  // Projekt laden
  useEffect(() => {
    if (!user || !projektId) return;
    
    loadProjekt();
  }, [user, projektId]);

  async function loadProjekt() {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("projekte")
        .select("*")
        .eq("id", projektId)
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        setError("Projekt nicht gefunden");
        return;
      }

      // Prüfen ob User Zugriff hat
      const hasAccess = 
        data.user_id === user.id || // Eigenes Projekt
        await checkSharedAccess(projektId, user.id) || // Geteiltes Projekt
        await checkOrgAccess(data.organization_id, user.id); // Org-Projekt

      if (!hasAccess) {
        setError("Keine Berechtigung für dieses Projekt");
        return;
      }

      setProjekt(data);
    } catch (err: any) {
      console.error('Error loading projekt:', err);
      setError(err.message || "Fehler beim Laden des Projekts");
    } finally {
      setLoading(false);
    }
  }

  async function checkSharedAccess(projektId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from("projekt_user")
      .select("id")
      .eq("projekt_id", projektId)
      .eq("user_id", userId)
      .single();
    
    return !!data;
  }

  async function checkOrgAccess(orgId: string | null, userId: string): Promise<boolean> {
    if (!orgId) return false;
    
    const { data } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", orgId)
      .eq("user_id", userId)
      .single();
    
    return !!data;
  }

  const handleBack = () => {
    router.push("/projekte");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("projekte")
        .delete()
        .eq("id", id);

      if (error) throw error;

      router.push("/projekte");
    } catch (err: any) {
      console.error('Error deleting projekt:', err);
      alert("Fehler beim Löschen: " + err.message);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Bitte melden Sie sich an, um Projekte anzusehen.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Projekt wird geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>
        <button
          onClick={handleBack}
          style={{
            padding: '8px 16px',
            background: 'var(--primary-blue)',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Zurück zur Projektliste
        </button>
      </div>
    );
  }

  if (!projekt) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Projekt nicht gefunden</p>
        <button
          onClick={handleBack}
          style={{
            padding: '8px 16px',
            background: 'var(--primary-blue)',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Zurück zur Projektliste
        </button>
      </div>
    );
  }

  return (
    <ProjektDetail
      projekt={projekt}
      user={user}
      onBack={handleBack}
      onDelete={handleDelete}
      loading={loading}
    />
  );
}

