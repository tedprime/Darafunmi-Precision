import { ReactNode } from "react";

export interface Toast {
  error:   (message: string) => void;
  success: (message: string) => void;
  info:    (message: string) => void;
}

export interface ToastContextValue {
  toast: Toast;
}

export function useToast(): ToastContextValue;
export function toastError(message: string): void;
export function toastSuccess(message: string): void;
export function toastInfo(message: string): void;
export function ToastProvider(props: { children: ReactNode }): JSX.Element;
