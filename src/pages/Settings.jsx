import { useRef, useState } from "react";
import {
  Download,
  MonitorSmartphone,
  Moon,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import {
  downloadJSON,
  emptyData,
  parseImport,
  STORAGE_KEY,
} from "../services/storage.js";
import ProfileForm from "../components/ProfileForm.jsx";
export default function Settings({
  data,
  commit,
  confirm,
  themeToggle,
  pwa,
  notify,
  onSaveGivenName,
}) {
  const input = useRef(null);
  const [fileError, setFileError] = useState("");
  async function importFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 10000000)
        throw new Error("Le fichier doit faire moins de 10 Mo.");
      const imported = parseImport(await file.text());
      setFileError("");
      confirm({
        title: "Remplacer tes données ?",
        message: `Le fichier contient ${imported.sessions.length} séance(s) terminée(s)${imported.activeSession ? " et une séance en cours" : ""}. Il remplacera toutes les données actuelles, y compris la séance en cours. Exporte-les d’abord si tu veux les conserver.`,
        label: "Remplacer les données",
        danger: true,
        action: () => {
          if (commit(imported, { replace: true }))
            notify("Sauvegarde importée.");
        },
      });
    } catch (e) {
      setFileError(e.message);
    }
  }
  return (
    <div className="settings-page page-enter">
      <div className="page-intro">
        <div>
          <p className="eyebrow accent">À TA FAÇON</p>
          <h1>
            Tes <span>réglages.</span>
          </h1>
          <p>Ton application. Tes données. Ton rythme.</p>
        </div>
      </div>
      <section className="panel">
        <span className="settings-icon">
          <UserRound size={22} />
        </span>
        <h2>Un carnet à ton prénom.</h2>
        <p className="muted">
          Quelques mots pour toi sur l’accueil et à la fin d’une séance. Laisse
          le champ vide pour retirer ton prénom.
        </p>
        <ProfileForm
          key={data.preferences.givenName}
          initialName={data.preferences.givenName}
          onSave={(givenName) => {
            if (onSaveGivenName(givenName))
              notify(givenName ? "Prénom enregistré." : "Prénom retiré.");
          }}
        />
      </section>
      <section className="panel">
        <span className="settings-icon">
          <Sun size={22} />
        </span>
        <h2>Jour ou nuit.</h2>
        <p className="muted">
          Choisis le confort qui te correspond. Ton choix est mémorisé.
        </p>
        <button className="button secondary" onClick={themeToggle}>
          {data.preferences.theme === "dark" ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
          Activer le mode {data.preferences.theme === "dark" ? "jour" : "nuit"}
        </button>
      </section>
      <section className="panel">
        <span className="settings-icon">
          <ShieldCheck size={22} />
        </span>
        <h2>Tes données restent avec toi.</h2>
        <p className="muted">
          Les séances sont enregistrées uniquement dans ce navigateur, sur cet
          appareil. Elles ne sont pas synchronisées. Effacer les données du
          navigateur ou changer d’appareil peut les faire disparaître : conserve
          une exportation JSON.
        </p>
        <div className="settings-actions">
          <button className="button primary" onClick={() => downloadJSON(data)}>
            <Download size={18} />
            Exporter mes données
          </button>
          <button
            className="button secondary"
            onClick={() => input.current.click()}
          >
            <Upload size={18} />
            Importer un fichier JSON
          </button>
          <input
            ref={input}
            type="file"
            accept=".json,application/json"
            onChange={importFile}
            hidden
          />
        </div>
        {fileError && (
          <p className="field-error" role="alert">
            {fileError}
          </p>
        )}
        <details className="technique">
          <summary>Récupérer une sauvegarde illisible</summary>
          <p className="muted small">
            Si une erreur de lecture est affichée, conserve une copie brute
            avant de réinitialiser.
          </p>
          <button
            className="text-button"
            onClick={() => {
              try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw === null)
                  notify("Aucune sauvegarde locale à récupérer.");
                else downloadJSON(raw, "evolift-recuperation.json");
              } catch {
                notify("Le navigateur empêche l’accès au stockage.");
              }
            }}
          >
            Exporter la sauvegarde brute
          </button>
        </details>
      </section>
      <section className="panel">
        <span className="settings-icon">
          <MonitorSmartphone size={22} />
        </span>
        <h2>Ta salle. Ton téléphone. Evolift.</h2>
        <p className="muted">
          Installe Evolift sur ton écran d’accueil pour retrouver ton carnet en
          un geste.
        </p>
        {pwa.installPrompt && (
          <button className="button primary" onClick={pwa.install}>
            Installer Evolift
          </button>
        )}
        <div className="install-instructions">
          <div>
            <h3>Sur iPhone</h3>
            <p>
              Ouvre Evolift dans Safari, appuie sur Partager, puis « Sur l’écran
              d’accueil » et « Ajouter ».
            </p>
          </div>
          <div>
            <h3>Sur Android</h3>
            <p>
              Ouvre Evolift dans Chrome, puis choisis « Installer l’application
              » ou « Ajouter à l’écran d’accueil » dans le menu ⋮.
            </p>
          </div>
        </div>
        <p className="data-message">
          {pwa.offlineReady
            ? "Le programme et la saisie sont prêts hors ligne sur ce navigateur."
            : "Après une première ouverture en ligne et la fin du chargement du cache, le programme et la saisie fonctionnent hors ligne."}{" "}
          Les démonstrations MuscleWiki nécessitent toujours Internet.
          L’installation mobile nécessite une adresse HTTPS.
        </p>
      </section>
      <section className="panel danger-zone">
        <h2>Repartir de zéro</h2>
        <p className="muted">
          Supprime toutes les séances, la séance en cours et les préférences.
        </p>
        <button
          className="button danger"
          onClick={() =>
            confirm({
              title: "Tout supprimer ?",
              message:
                "Cette suppression est définitive. Pense à exporter tes données avant de confirmer.",
              danger: true,
              label: "Supprimer toutes les données",
              action: () => {
                if (commit(emptyData(), { replace: true }))
                  notify("Toutes les données ont été supprimées.");
              },
            })
          }
        >
          <Trash2 size={17} />
          Supprimer mes données
        </button>
      </section>
    </div>
  );
}
