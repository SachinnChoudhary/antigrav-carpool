import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VerifyIdentityModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    idVerified: boolean;
    onUpdate: (data: any) => void;
}

export function VerifyIdentityModal({ isOpen, onClose, userId, idVerified, onUpdate }: VerifyIdentityModalProps) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [docType, setDocType] = useState('');
    const [docNumber, setDocNumber] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        try {
            // 1. Upload image (reusing the existing upload endpoint or creating a new one? 
            // For simplicity, we'll assume we can use the same upload logic but maybe different folder?
            // Or just use the generic upload endpoint and store the URL.
            // Let's use the existing upload-image endpoint but we might need to differentiate.
            // Actually, the existing endpoint updates 'profileImage'. We need a generic upload or specific one.
            // I'll use a new endpoint or just assume for now we upload to a 'documents' folder.
            // Since I can't easily create a generic upload without modifying existing, I'll try to use the existing one 
            // but that updates profile image. 
            // I'll create a new endpoint for document upload later or just mock the upload for now if I don't want to overcomplicate.
            // User wants it "working". I should probably create a generic upload endpoint.
            // But for now, let's just use the profile upload endpoint logic but pointing to a different field? 
            // No, that endpoint hardcodes 'profileImage'.
            // I will create a new API route for document upload: /api/users/[id]/upload-document

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'id_document'); // Tell backend it's a doc

            const uploadRes = await fetch(`/api/users/${userId}/upload-document`, {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) throw new Error('Failed to upload document');
            const { url } = await uploadRes.json();

            // 2. Update user verification status
            const updateRes = await fetch(`/api/profile/${userId}/verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idDocumentUrl: url,
                    idType: docType,
                    idNumber: docNumber,
                    idVerified: false, // Pending admin review
                }),
            });

            if (!updateRes.ok) throw new Error('Failed to update verification status');

            const updatedUser = await updateRes.json();
            onUpdate(updatedUser);
            toast.success('ID Document uploaded successfully!');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to verify identity');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Verify Identity">
            <div className="space-y-6">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium">Upload Government ID</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Please upload a clear photo of your Passport, Driver's License, or National ID.
                    </p>
                </div>

                {idVerified ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                            <p className="font-medium text-green-900">Identity Verified</p>
                            <p className="text-sm text-green-700">Your identity has been confirmed.</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Document Type</label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={docType}
                                onChange={(e) => setDocType(e.target.value)}
                                required
                            >
                                <option value="">Select Document Type</option>
                                <option value="aadhar">Aadhar Card</option>
                                <option value="pan">PAN Card</option>
                                <option value="passport">Passport</option>
                                <option value="voter_id">Voter ID</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Document Number</label>
                            <input
                                type="text"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Enter document number"
                                value={docNumber}
                                onChange={(e) => setDocNumber(e.target.value)}
                                required
                            />
                        </div>

                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {preview ? (
                                <img src={preview} alt="ID Preview" className="max-h-48 mx-auto rounded-lg shadow-sm" />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-sm font-medium text-gray-700">Click to upload ID</p>
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={!file || loading}>
                                {loading ? 'Uploading...' : 'Submit for Verification'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
