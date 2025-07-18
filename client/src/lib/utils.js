import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from 'react-toastify';


// Utility function - Merge Tailwind CSS classes with conditional logic
export function cn(...inputs) {
    return twMerge(clsx(...inputs))
}


// Toast notification - Success message display
export const handleSuccess = (msg) => {
    toast.success(msg, {
        position: 'top-right'
    })
}


// Toast notification - Error message display
export const handleError = (msg) => {
    toast.error(msg, {
        position: 'top-right'
    })
}