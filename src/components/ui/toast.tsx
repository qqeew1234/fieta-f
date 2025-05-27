"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"

import { cn } from "@/src/lib/utils"
import { X } from "lucide-react"

const Toast = ToastPrimitives.Root

const ToastTrigger = ToastPrimitives.Trigger

const ToastPortal = ToastPrimitives.Portal

const ToastClose = ToastPrimitives.Close

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
            "fixed inset-0 z-[100] flex flex-col-reverse p-4 sm:bottom-8 sm:right-8 sm:top-auto sm:left-auto",
            className,
        )}
        {...props}
    />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const ToastGroup = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Group>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Group>
>(({ className, ...props }, ref) => <ToastPrimitives.Group ref={ref} className={cn("group", className)} {...props} />)
ToastGroup.displayName = ToastPrimitives.Group.displayName

const ToastTitle = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Title>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Title ref={ref} className={cn("mb-1 font-medium text-foreground", className)} {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Description>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

const ToastAction = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Action>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Action
        ref={ref}
        className={cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-transparent bg-secondary text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:hover:bg-destructive/80 group-[.destructive]:text-destructive-foreground group-[.destructive]:focus-visible:ring-destructive",
            className,
        )}
        {...props}
    />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastDismiss = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Close>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Close
        ref={ref}
        className={cn(
            "absolute right-2 top-2 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
            className,
        )}
        {...props}
    >
        <X className="h-4 w-4" />
    </ToastPrimitives.Close>
))
ToastDismiss.displayName = ToastPrimitives.Close.displayName

interface UseToastReturn {
    dismiss: (toastId?: string) => void
    isActive: (toastId: string) => boolean
    update: (id: string, options: Partial<ToastProps>) => void
    toast: ToastFunction
}

type ToastProps = {
    id?: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: React.ReactNode
    duration?: number
    /**
     * @default "default"
     */
    variant?: "default" | "destructive"
    onOpenChange?: (open: boolean) => void
    open?: boolean
}

type ToastFunction = ({ ...props }: ToastProps) => {
    id: string
    dismiss: () => void
    update: (options: Partial<ToastProps>) => void
}

export function useToast(): UseToastReturn {
    const { toasts, dismiss, update, addToast, isActive } = React.useContext(ToastContext)

    const toast: ToastFunction = React.useCallback(
        ({ ...props }) => {
            const id = props.id || Math.random().toString(36).substring(2)
            addToast({ id, ...props })
            return {
                id: id,
                dismiss: () => dismiss(id),
                update: (options) => update(id, options),
            }
        },
        [addToast, dismiss, update],
    )

    return {
        toasts,
        toast,
        dismiss,
        update,
        isActive,
    }
}

type Toasts = ToastProps & {
    id: string
}

interface ToastContextProps {
    toasts: Toasts[]
    toast: ToastFunction
    dismiss: (toastId?: string) => void
    update: (id: string, options: Partial<ToastProps>) => void
    addToast: (toast: Toasts) => void
    removeToast: (toastId: string) => void
    isActive: (toastId: string) => boolean
}

const DEFAULT_DURATION = 3000

const ToastContext = React.createContext<ToastContextProps>({
    toasts: [],
    toast: () => ({ id: "", dismiss: () => {}, update: () => {} }),
    dismiss: () => {},
    update: () => {},
    addToast: () => {},
    removeToast: () => {},
    isActive: () => false,
})
ToastContext.displayName = "ToastContext"

function ToastProviderComponent({
                                    children,
                                }: {
    children: React.ReactNode
}) {
    const [toasts, setToasts] = React.useState<Toasts[]>([])

    const addToast = React.useCallback((toast: Toasts) => {
        setToasts((prev) => [...prev, toast])
    }, [])

    const updateToast = React.useCallback((id: string, options: Partial<ToastProps>) => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...options } : t)))
    }, [])

    const dismissToast = React.useCallback((toastId?: string) => {
        if (toastId) {
            setToasts((prev) => prev.filter((toast) => toast.id !== toastId))
        } else {
            setToasts([])
        }
    }, [])

    const removeToast = React.useCallback((toastId: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== toastId))
    }, [])

    const toast: ToastFunction = React.useCallback(
        ({ ...props }) => {
            const id = props.id || Math.random().toString(36).substring(2)
            const cleanup = () => removeToast(id)

            const toast = {
                id,
                ...props,
                onOpenChange: (open: boolean) => {
                    props.onOpenChange?.(open)
                    if (!open) cleanup()
                },
            }

            addToast(toast)

            return {
                id: id,
                dismiss: () => dismissToast(id),
                update: (options) => updateToast(id, options),
            }
        },
        [addToast, dismissToast, removeToast, updateToast],
    )

    React.useEffect(() => {
        toasts.forEach((toast) => {
            if (toast.open === false) return
            if (toast.duration === null) return

            const timeoutId = setTimeout(() => {
                toast.onOpenChange?.(false)
            }, toast.duration || DEFAULT_DURATION)

            return () => clearTimeout(timeoutId)
        })
    }, [toasts])

    const value = React.useMemo(
        () => ({
            toasts,
            toast,
            dismiss: dismissToast,
            update: updateToast,
            addToast,
            removeToast,
            isActive: (id: string) => toasts.some((toast) => toast.id === id),
        }),
        [toasts, toast, dismissToast, updateToast, addToast, removeToast],
    )

    return React.createElement(ToastContext.Provider, { value, children })
}

export {
    ToastProviderComponent as ToastProvider,
    ToastGroup,
    ToastTitle,
    ToastDescription,
    ToastViewport,
    ToastClose,
    ToastAction,
    ToastDismiss,
}

export function toast({ ...props }: ToastProps) {
    return useToast().toast(props)
}
