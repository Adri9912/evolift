import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
export function usePwa() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [registrationError, setRegistrationError] = useState(false);
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({ onRegisterError: () => setRegistrationError(true) });
  useEffect(() => {
    const capture = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const installed = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  return {
    offlineReady,
    needRefresh,
    registrationError,
    updateServiceWorker,
    installPrompt,
    install: async () => {
      if (!installPrompt) return;
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    },
  };
}
