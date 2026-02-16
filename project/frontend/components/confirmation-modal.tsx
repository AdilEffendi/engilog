"use client"
import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Konfirmasi",
    cancelText = "Batal",
    variant = 'danger',
    doubleConfirm = false
}: ConfirmationModalProps & { doubleConfirm?: boolean }) {
    const [step, setStep] = React.useState(1);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Reset when opening
    React.useEffect(() => {
        if (isOpen) {
            setStep(1);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (doubleConfirm && step === 1) {
            setStep(2);
            return;
        }

        setIsSubmitting(true);
        try {
            const result = onConfirm();
            if (result instanceof Promise) {
                await result;
            }
            onClose();
        } catch (error) {
            console.error("Confirmation error:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className={`font-bold text-lg ${variant === 'danger' ? 'text-red-600' : 'text-slate-800'}`}>
                        {step === 1 ? title : "Konfirmasi Akhir"}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-500">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="text-slate-600 text-sm leading-relaxed space-y-2">
                        {step === 1 ? message : (
                            <div className="space-y-3 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800">Apakah Anda benar-benar yakin?</h4>
                                <p className="text-slate-500">
                                    Item yang dihapus <span className="font-bold text-red-600">tidak dapat dikembalikan</span>.
                                    Pastikan tindakan Anda sudah benar.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-semibold text-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-4 py-2 text-white rounded-lg transition-colors font-semibold text-sm shadow-md 
              ${variant === 'danger'
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                            }`}
                    >
                        {step === 1 && doubleConfirm ? "Lanjut Hapus" : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
