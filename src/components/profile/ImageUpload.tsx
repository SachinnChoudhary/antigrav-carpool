"use client";

import * as React from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import toast from "react-hot-toast";

interface ImageUploadProps {
    userId: string;
    currentImage?: string;
    onUploadSuccess: (imageUrl: string) => void;
}

export function ImageUpload({ userId, currentImage, onUploadSuccess }: ImageUploadProps) {
    const [uploading, setUploading] = React.useState(false);
    const [preview, setPreview] = React.useState<string | null>(currentImage || null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`/api/users/${userId}/upload-image`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            toast.success('Profile picture updated!');
            onUploadSuccess(data.user.profileImage);
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload image');
            setPreview(currentImage || null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center border-4 border-white shadow-lg">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <Camera className="h-12 w-12 text-muted-foreground" />
                    )}
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Upload className="h-5 w-5" />
                    )}
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <p className="text-xs text-muted-foreground text-center">
                Click the upload button to change your profile picture
                <br />
                Max size: 5MB
            </p>
        </div>
    );
}
