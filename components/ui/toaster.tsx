"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  // Check if there are any active toasts
  const hasActiveToasts = toasts.some(toast => toast.open)

  // Handle background click to dismiss all toasts
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only dismiss if clicking directly on the viewport (not on a toast)
    if (e.target === e.currentTarget) {
      // Dismiss each toast individually to trigger onDismiss callbacks
      toasts.forEach(toast => {
        if (toast.open) {
          dismiss(toast.id)
        }
      })
    }
  }

  return (
    <ToastProvider>
      <ToastViewport 
        className={hasActiveToasts ? "bg-black/50" : ""} 
        onClick={handleBackgroundClick}
      >
        {toasts.map(function ({ id, title, description, action, ...props }) {
          return (
            <Toast key={id} {...props}>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </Toast>
          )
        })}
      </ToastViewport>
    </ToastProvider>
  )
}
