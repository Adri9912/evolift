import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, UserRound } from "lucide-react";
import { normalizeGivenName } from "../utils/profile.js";

export default function ProfileForm({ initialName = "", onSave, onSkip }) {
  const [name, setName] = useState(initialName);
  const id = useId();
  return (
    <form
      className="profile-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(normalizeGivenName(name));
      }}
    >
      <label htmlFor={id}>
        Ton prénom <span className="muted">(facultatif)</span>
      </label>
      <input
        id={id}
        name="given-name"
        autoComplete="given-name"
        type="text"
        maxLength={40}
        placeholder="Comment t’appelles-tu ?"
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-describedby={`${id}-help`}
      />
      <p id={`${id}-help`} className="muted small">
        Ton prénom reste sur cet appareil. Tu peux le modifier ou le retirer
        dans les réglages.
      </p>
      <div className="profile-actions">
        {onSkip && (
          <button className="text-button" type="button" onClick={onSkip}>
            Passer cette étape
          </button>
        )}
        <button className="button primary" type="submit">
          {onSkip ? "C’est parti" : "Enregistrer le prénom"}
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

export function WelcomeDialog({ open, onSave, onSkip }) {
  const ref = useRef(null);
  useEffect(() => {
    if (open) ref.current.showModal();
    else ref.current.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="confirm-dialog welcome-dialog"
      aria-labelledby="welcome-title"
      aria-describedby="welcome-description"
      onCancel={(event) => {
        event.preventDefault();
        onSkip();
      }}
    >
      {open && (
        <>
          <span className="welcome-icon">
            <UserRound size={27} />
          </span>
          <span className="eyebrow accent">BIENVENUE SUR EVOLIFT</span>
          <h2 id="welcome-title">On fait connaissance ?</h2>
          <p id="welcome-description">
            Un prénom, et ton carnet devient un peu plus le tien.
          </p>
          <ProfileForm onSave={onSave} onSkip={onSkip} />
        </>
      )}
    </dialog>
  );
}
