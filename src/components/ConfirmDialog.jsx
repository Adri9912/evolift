import { useEffect, useRef } from "react";
import { X } from "lucide-react";
export default function ConfirmDialog({ value, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    if (value) ref.current.showModal();
    else ref.current.close();
  }, [value]);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      className="confirm-dialog"
      aria-labelledby="dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {value && (
        <>
          <button
            className="icon-button dialog-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X />
          </button>
          <span className="eyebrow">EVOLIFT</span>
          <h2 id="dialog-title">{value.title}</h2>
          <p>{value.message}</p>
          <div className="dialog-actions">
            <button className="button secondary" autoFocus onClick={onClose}>
              Annuler
            </button>
            <button
              className={`button ${value.danger ? "danger" : "primary"}`}
              onClick={() => {
                value.action();
                onClose();
              }}
            >
              {value.label || "Confirmer"}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
