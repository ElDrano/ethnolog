"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import SidebarLogin from "../../sidebarLogin";
import ProjektList from "./ProjektList";
import NewProjectForm from "./NewProjectForm";
import DeleteDialog from "./DeleteDialog";
import ProjektDetail from "./ProjektDetail";

export default function ProjektePage() {
  const [user, setUser] = useState<any>(null);
  const [projekte, setProjekte] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projektUsers, setProjektUsers] = useState<{[id:string]: any[]}>({});
  const [selectedProjekt, setSelectedProjekt] = useState<any>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isLightMode, setIsLightMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<{id: string | null, open: boolean}>({id: null, open: false});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLightMode(document.body.classList.contains('light-mode'));
      const observer = new MutationObserver(() => {
        setIsLightMode(document.body.classList.contains('light-mode'));
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      // Eigene Projekte
      supabase
        .from("projekte")
        .select("id, name, beschreibung, created_at, updated_at, user_id, optionen, arbeitsweise, organization_id")
        .eq("user_id", user.id),
      // Geteilte Projekte
      supabase
        .from("projekt_user")
        .select("projekt_id, role, projekte:projekt_id(id, name, beschreibung, created_at, updated_at, user_id, optionen, arbeitsweise, organization_id)")
        .eq("user_id", user.id),
      // Organisationsprojekte
      supabase
        .from("organization_members")
        .select(`
          organization_id,
          organizations:organization_id(
            id,
            name,
            projekte:projekte(id, name, beschreibung, created_at, updated_at, user_id, optionen, arbeitsweise, organization_id)
          )
        `)
        .eq("user_id", user.id)
    ]).then(([ownRes, sharedRes, orgRes]) => {
      let own = ownRes.data || [];
      let shared = (sharedRes.data || []).map((pu: any) => pu.projekte).filter(Boolean);
      
      // Organisationsprojekte extrahieren
      let orgProjects: any[] = [];
      if (orgRes.data) {
        orgRes.data.forEach((orgMember: any) => {
          if (orgMember.organizations?.projekte) {
            orgProjects = orgProjects.concat(orgMember.organizations.projekte);
          }
        });
      }
      
      // Alle Projekte zusammenführen und Duplikate entfernen
      const all = [...own, ...shared, ...orgProjects].filter((p, i, arr) => 
        p && arr.findIndex(x => x.id === p.id) === i
      );
      setProjekte(all);
      setLoading(false);
    });
  }, [user]);

  // Event Listener für Navigation zur Projektliste
  useEffect(() => {
    const handleResetToProjekteList = () => {
      setSelectedProjekt(null);
    };

    window.addEventListener('resetToProjekteList', handleResetToProjekteList);
    
    return () => {
      window.removeEventListener('resetToProjekteList', handleResetToProjekteList);
    };
  }, []);

  async function handleDelete(id: string) {
    setLoading(true);
    setError("");
    const { error } = await supabase.from("projekte").delete().eq("id", id);
    if (error) setError(error.message);
    setProjekte(projekte.filter((p) => p.id !== id));
    setLoading(false);
    setShowDeleteDialog({id: null, open: false});
  }

  async function handleCreateProject(projectData: any) {
    setCreatingProject(true);
    setCreateError("");
    
    // 1. Projekt anlegen
    const { data: projekt, error } = await supabase
      .from("projekte")
      .insert({
        name: projectData.name,
        beschreibung: projectData.beschreibung,
        user_id: user.id,
        arbeitsweise: projectData.arbeitsweise,
        organization_id: projectData.organization_id,
        optionen: projectData.optionen
      })
      .select()
      .single();

    if (error) {
      setCreateError(error.message);
      setCreatingProject(false);
      return;
    }

    // 2. Personen mit projekt_id anlegen
    if (projectData.personen.length > 0) {
      const personenToInsert = projectData.personen.map((p: any) => ({
        ...p,
        projekt_id: projekt.id
      }));
      const { error: personenError } = await supabase
        .from("personen")
        .insert(personenToInsert);
      if (personenError) {
        setCreateError("Projekt wurde angelegt, aber Personen konnten nicht gespeichert werden: " + personenError.message);
      }
    }

    setShowNewProject(false);
    setProjekte([projekt, ...projekte]);
    // Nicht automatisch zur Detailansicht wechseln
    setCreatingProject(false);
  }

  if (!user) {
    return (
      <div
        style={{
          maxWidth: 400,
          margin: '4rem auto',
          padding: '2rem',
          background: isLightMode
            ? 'linear-gradient(135deg, #e0f0ff 0%, #b3d8ff 100%)'
            : '#232b5d',
          borderRadius: 12,
          boxShadow: '0 2px 16px #0002',
        }}
      >
        <h2 style={{ color: 'var(--foreground)', marginBottom: 24, textAlign: 'center' }}>Bitte einloggen oder registrieren</h2>
        <SidebarLogin />
      </div>
    );
  }

  // Einzelansicht für ein Projekt
  if (selectedProjekt) {
    return (
      <ProjektDetail
        projekt={selectedProjekt}
        user={user}
        onBack={() => setSelectedProjekt(null)}
        onDelete={handleDelete}
        loading={loading}
      />
    );
  }

  // Listenansicht für alle Projekte
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Projekte</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        Hier werden alle deine Projekte angezeigt. Klicke auf ein Projekt, um es zu öffnen.
      </p>
      
      <div style={{ marginBottom: 24 }}>
        {showNewProject ? (
          <NewProjectForm
            user={user}
            isLightMode={isLightMode}
            onCreateProject={handleCreateProject}
            onCancel={() => {
              setShowNewProject(false);
              setCreateError("");
            }}
            createError={createError}
            creatingProject={creatingProject}
          />
        ) : (
          <button
            onClick={() => setShowNewProject(true)}
            className="new-project-btn" style={{ padding: '10px 22px', borderRadius: 8, background: 'var(--button)', color: 'var(--text-primary)', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s ease' }}
          >
            + Neues Projekt anlegen
          </button>
        )}
      </div>

      {!showNewProject && (
        <>
          <ProjektList
            projekte={projekte}
            user={user}
            projektUsers={projektUsers}
            loading={loading}
            error={error}
            onSelectProjekt={setSelectedProjekt}
            onDeleteProjekt={(id) => setShowDeleteDialog({id, open: true})}
          />

          <DeleteDialog
            isOpen={showDeleteDialog.open}
            title="Projekt löschen"
            message="Möchtest du dieses Projekt wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
            onConfirm={() => handleDelete(showDeleteDialog.id!)}
            onCancel={() => setShowDeleteDialog({id: null, open: false})}
            confirmText="Löschen"
            cancelText="Abbrechen"
            loading={loading}
          />
        </>
      )}
    </div>
  );
} 