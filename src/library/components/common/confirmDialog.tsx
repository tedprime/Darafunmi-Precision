import { createRoot } from "react-dom/client";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

type ConfirmDialogOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
};

const ConfirmDialog = ({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onCancel,
  onConfirm,
}: ConfirmDialogOptions & {
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <button
      type="button"
      aria-label="Close confirmation"
      className="absolute inset-0 bg-slate-900/45"
      onClick={onCancel}
    />
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-description" : undefined}
      className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl ring-1 ring-black/5"
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-full p-2 ${variant === "danger" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
          <AlertTriangle size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="confirm-dialog-title" className="text-base font-semibold text-gray-900">
            {title}
          </h2>
          {description && (
            <p id="confirm-dialog-description" className="mt-1.5 text-sm leading-6 text-gray-600">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="button" variant={variant === "danger" ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  </div>
);

export const confirmDialog = (options: ConfirmDialogOptions) =>
  new Promise<boolean>((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    const cleanup = (confirmed: boolean) => {
      root.unmount();
      host.remove();
      resolve(confirmed);
    };

    root.render(
      <ConfirmDialog
        {...options}
        onCancel={() => cleanup(false)}
        onConfirm={() => cleanup(true)}
      />,
    );
  });
