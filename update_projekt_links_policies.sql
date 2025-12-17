-- Update RLS Policies für projekt_links
-- Erlaubt auch Mitgliedern mit 'read'-Rolle, Links zu erstellen, bearbeiten und löschen

-- Alte Policies löschen
DROP POLICY IF EXISTS "Projektbesitzer und Bearbeiter können Links hinzufügen" ON public.projekt_links;
DROP POLICY IF EXISTS "Projektbesitzer und Bearbeiter können Links bearbeiten" ON public.projekt_links;
DROP POLICY IF EXISTS "Projektbesitzer und Bearbeiter können Links löschen" ON public.projekt_links;

-- Neue Policies erstellen - alle Projektmitglieder (read und write) können Links verwalten

-- Einfügen: Alle Projektmitglieder können Links hinzufügen
CREATE POLICY "Alle Projektmitglieder können Links hinzufügen"
ON public.projekt_links
FOR INSERT
WITH CHECK (
  projekt_id IN (
    SELECT id FROM public.projekte 
    WHERE user_id = auth.uid()
    UNION
    SELECT projekt_id FROM public.projekt_user 
    WHERE user_id = auth.uid()
  )
);

-- Aktualisieren: Alle Projektmitglieder können Links bearbeiten
CREATE POLICY "Alle Projektmitglieder können Links bearbeiten"
ON public.projekt_links
FOR UPDATE
USING (
  projekt_id IN (
    SELECT id FROM public.projekte 
    WHERE user_id = auth.uid()
    UNION
    SELECT projekt_id FROM public.projekt_user 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  projekt_id IN (
    SELECT id FROM public.projekte 
    WHERE user_id = auth.uid()
    UNION
    SELECT projekt_id FROM public.projekt_user 
    WHERE user_id = auth.uid()
  )
);

-- Löschen: Alle Projektmitglieder können Links löschen
CREATE POLICY "Alle Projektmitglieder können Links löschen"
ON public.projekt_links
FOR DELETE
USING (
  projekt_id IN (
    SELECT id FROM public.projekte 
    WHERE user_id = auth.uid()
    UNION
    SELECT projekt_id FROM public.projekt_user 
    WHERE user_id = auth.uid()
  )
);

