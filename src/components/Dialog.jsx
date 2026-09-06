import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export default function Dialog({ children, description, icon: Icon, onClose, open, size = "medium", title }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      previousFocusRef.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    previousFocusRef.current?.focus();
    if (open) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      data-size={size}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={handleClose}
      onMouseDown={({ currentTarget, target }) => {
        if (currentTarget === target) currentTarget.close();
      }}
    >
      <div className="project-dialog__panel">
        <header className="project-dialog__header">
          {Icon && (
            <span className="project-dialog__icon" aria-hidden="true">
              <Icon size={20} />
            </span>
          )}
          <div className="project-dialog__heading">
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <button className="project-dialog__close" type="button" onClick={() => dialogRef.current.close()} aria-label="Fechar">
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
