// src/components/workbench/NameAnalysisModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check } from "lucide-react";

interface NameAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onValidate: (name: string) => void;
    isImporting: boolean;
}

export function NameAnalysisModal({ isOpen, onClose, onValidate, isImporting }: NameAnalysisModalProps) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (isOpen) {
            // Generate a default name when the modal opens
            setName(`Case File - ${new Date().toLocaleString()}`);
        }
    }, [isOpen]);

    const handleValidate = () => {
        if (name.trim() && !isImporting) {
            onValidate(name.trim());
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-card rounded-lg shadow-xl w-full max-w-md p-6 border border-border"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Name Your Analysis</h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            Give this imported data a unique name to identify it later.
                        </p>
                        
                        <div>
                            <label htmlFor="analysis-name" className="block text-sm font-medium text-muted-foreground mb-2">
                                Analysis Name
                            </label>
                            <input
                                id="analysis-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Investigation XYZ"
                                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                disabled={isImporting}
                            />
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                disabled={isImporting}
                                className="px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleValidate}
                                disabled={!name.trim() || isImporting}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Validate and Visualize
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}