import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  ChartNoAxesCombined,
  Check,
  Dumbbell,
  History as HistoryIcon,
  House,
  Moon,
  Settings as SettingsIcon,
  Sun,
  WifiOff,
  X,
} from "lucide-react";
import BrandMark from "./components/BrandMark.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Session from "./pages/Session.jsx";
import History from "./pages/History.jsx";
import Progress from "./pages/Progress.jsx";
import Settings from "./pages/Settings.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import { WelcomeDialog } from "./components/ProfileForm.jsx";
import { useStore } from "./hooks/useStore.js";
import { usePwa } from "./hooks/usePwa.js";
import {
  createSession,
  finishSession,
  completedCount,
} from "./utils/performance.js";
import { getProgram } from "./data/programs.js";
const navigation = [
  ["home", "Accueil", House],
  ["session", "Séance", Dumbbell],
  ["history", "Historique", HistoryIcon],
  ["progress", "Progression", ChartNoAxesCombined],
];
const readRoute = () =>
  [...navigation.map(([id]) => id), "settings"].includes(location.hash.slice(1))
    ? location.hash.slice(1)
    : "home";
export default function App() {
  const { data, error, commit } = useStore();
  const pwa = usePwa();
  const [route, setRoute] = useState(readRoute),
    [selected, setSelected] = useState("push");
  const [confirmation, setConfirmation] = useState(null),
    [toast, setToast] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const changed = () => {
      setRoute(readRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = data.preferences.theme;
    document.querySelector('meta[name="theme-color"]').content =
      data.preferences.theme === "dark" ? "#22272b" : "#f2f6f4";
  }, [data.preferences.theme]);
  useEffect(() => {
    const on = () => setOnline(true),
      off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  function navigate(id) {
    if (readRoute() === id) {
      setRoute(id);
      window.scrollTo(0, 0);
    } else location.hash = id;
  }
  function start(programId) {
    if (data.activeSession) {
      navigate("session");
      setToast(
        "Ta séance en cours a été conservée. Termine-la avant d’en commencer une autre.",
      );
      return;
    }
    if (
      commit((d) => ({ ...d, activeSession: createSession(programId) }), {
        required: true,
      })
    ) {
      navigate("session");
      setToast("C’est parti. Chaque séance compte !");
    }
  }
  function finish() {
    const count = completedCount(data.activeSession),
      total = getProgram(data.activeSession.programId).exercises.length;
    setConfirmation({
      title: "Une séance de plus.",
      message: `${count} exercice(s) sur ${total} seront enregistrés. Les ${total - count} exercice(s) vides ou incomplets ne seront pas comptés. Tu pourras retrouver cette séance dans l’historique.`,
      label: "Terminer et enregistrer",
      action: () => {
        if (
          commit(
            (d) => ({
              ...d,
              sessions: [...d.sessions, finishSession(d.activeSession)],
              activeSession: null,
            }),
            { required: true },
          )
        ) {
          navigate("history");
          setToast(
            data.preferences.givenName
              ? `Bien joué, ${data.preferences.givenName} ! Ta séance est enregistrée.`
              : "Bien joué. Ta séance est enregistrée.",
          );
        }
      },
    });
  }
  const themeToggle = () =>
    commit((d) => ({
      ...d,
      preferences: {
        ...d.preferences,
        theme: d.preferences.theme === "dark" ? "light" : "dark",
      },
    }));
  const saveGivenName = (givenName) =>
    commit(
      (d) => ({
        ...d,
        preferences: { ...d.preferences, givenName, welcomeCompleted: true },
      }),
      { required: true },
    );
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content").focus();
        }}
      >
        Aller au contenu
      </a>
      <aside className="sidebar">
        <a href="#home" className="brand" aria-label="Evolift, accueil">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span>Evolift</span>
        </a>
        {data.preferences.givenName && (
          <span className="sidebar-name">{data.preferences.givenName}</span>
        )}
        <span className="sidebar-label">TON TERRAIN DE JEU</span>
        <nav aria-label="Navigation principale">
          {navigation.map(([id, label, Icon]) => (
            <a
              href={`#${id}`}
              key={id}
              className={`nav-item ${route === id ? "active" : ""}`}
              aria-current={route === id ? "page" : undefined}
            >
              <Icon size={20} />
              <span>{label}</span>
              {id === "session" && data.activeSession && (
                <span className="live-dot" />
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-motivation">
            <Activity size={24} />
            <p>
              La régularité
              <br />
              fait la différence<span>.</span>
            </p>
            <small>Un jour après l’autre.</small>
          </div>
          <a
            href="#settings"
            className={`nav-item ${route === "settings" ? "active" : ""}`}
            aria-current={route === "settings" ? "page" : undefined}
          >
            <SettingsIcon size={20} />
            Réglages
          </a>
          <div className="local-status">
            <span className="status-dot" />
            Sauvegarde sur cet appareil
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <a href="#home" className="brand mobile-brand">
            <span className="brand-mark">
              <BrandMark />
            </span>
            <span>Evolift</span>
          </a>
          <div className="breadcrumb">
            MON ESPACE <span>/</span>
            <b>{navigation.find(([id]) => id === route)?.[1] || "Réglages"}</b>
          </div>
          <div className="topbar-actions">
            <span className="offline-status">
              {online ? (
                <>
                  <span className="status-dot" /> Ton carnet personnel
                </>
              ) : (
                <>
                  <WifiOff size={15} /> Hors ligne
                </>
              )}
            </span>
            <button
              className="icon-button"
              aria-label={`Activer le mode ${data.preferences.theme === "dark" ? "jour" : "nuit"}`}
              onClick={themeToggle}
            >
              {data.preferences.theme === "dark" ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>
            <a
              className={`icon-button ${route === "settings" ? "accent" : ""}`}
              href="#settings"
              aria-label="Réglages"
            >
              <SettingsIcon size={19} />
            </a>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {error && (
            <div role="alert" className="error-banner">
              {error}
              <button
                className="text-button"
                onClick={() => navigate("settings")}
              >
                Ouvrir les réglages <ArrowUpRight size={16} />
              </button>
            </div>
          )}
          {pwa.registrationError && (
            <div role="status" className="error-banner">
              Le cache hors ligne n’a pas pu être activé. Réessaie avec une
              connexion Internet.
            </div>
          )}
          {pwa.needRefresh && (
            <div className="update-banner">
              <span>
                Une nouvelle version est prête.
                {data.activeSession
                  ? " Termine ta séance pour la mettre à jour."
                  : ""}
              </span>
              <button
                className="button secondary"
                disabled={Boolean(data.activeSession) || Boolean(error)}
                onClick={() => pwa.updateServiceWorker(true)}
              >
                Mettre à jour
              </button>
            </div>
          )}
          {route === "home" && (
            <Dashboard
              data={data}
              onStart={start}
              onView={(id) => {
                setSelected(id);
                navigate("session");
              }}
              navigate={navigate}
            />
          )}
          {route === "session" && (
            <Session
              data={data}
              selected={selected}
              setSelected={setSelected}
              onStart={start}
              onUpdate={(id, p) =>
                commit((d) => ({
                  ...d,
                  activeSession: {
                    ...d.activeSession,
                    performances: { ...d.activeSession.performances, [id]: p },
                  },
                }))
              }
              onFinish={finish}
            />
          )}
          {route === "history" && (
            <History
              sessions={data.sessions}
              navigate={navigate}
              onDelete={(s) =>
                setConfirmation({
                  title: "Supprimer cette séance ?",
                  message:
                    "Ses performances seront retirées de l’historique et des graphiques. Cette action est définitive.",
                  label: "Supprimer",
                  danger: true,
                  action: () => {
                    if (
                      commit(
                        (d) => ({
                          ...d,
                          sessions: d.sessions.filter(
                            (item) => item.id !== s.id,
                          ),
                        }),
                        { required: true },
                      )
                    )
                      setToast("Séance supprimée.");
                  },
                })
              }
            />
          )}
          {route === "progress" && <Progress sessions={data.sessions} />}
          {route === "settings" && (
            <Settings
              data={data}
              commit={commit}
              confirm={setConfirmation}
              themeToggle={themeToggle}
              pwa={pwa}
              notify={setToast}
              onSaveGivenName={saveGivenName}
            />
          )}
          <footer className="main-footer">
            <span>
              EVOLIFT <span className="accent">/</span> CHAQUE SÉANCE COMPTE.
            </span>
            <span>Fait pour avancer.</span>
          </footer>
        </main>
      </div>
      <nav className="mobile-navigation" aria-label="Navigation mobile">
        {navigation.map(([id, label, Icon]) => (
          <a
            href={`#${id}`}
            key={id}
            className={route === id ? "active" : ""}
            aria-current={route === id ? "page" : undefined}
          >
            <span>
              <Icon size={21} />
              {id === "session" && data.activeSession && (
                <i className="live-dot" />
              )}
            </span>
            {label}
          </a>
        ))}
      </nav>
      <WelcomeDialog
        open={!data.preferences.welcomeCompleted && !error}
        onSave={saveGivenName}
        onSkip={() => saveGivenName("")}
      />
      <ConfirmDialog
        value={confirmation}
        onClose={() => setConfirmation(null)}
      />
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button aria-label="Fermer le message" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
