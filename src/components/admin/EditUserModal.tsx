import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Eye, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onUpdate: () => void;
}

export function EditUserModal({ isOpen, onClose, user, onUpdate }: EditUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [showIdDetails, setShowIdDetails] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        role: 'passenger',
    });

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                role: user.role || 'passenger',
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to update user');

            toast.success('User updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    console.log('EditUserModal render:', { isOpen, user, formData });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit User Details">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Optional"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Optional"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="passenger">Passenger</option>
                        <option value="driver">Driver</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {/* Verification Status Section */}
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm">Verification Status</h4>

                    {/* ID Verification */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium">ID Verification</p>
                            <p className="text-xs text-muted-foreground">
                                {user.idVerified ? 'Verified' : 'Not Verified'}
                                {user.idType && ` (${user.idType})`}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {user.idDocumentUrl && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowIdDetails(true)}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Details
                                </Button>
                            )}
                            {user.idVerified && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={async () => {
                                        if (!confirm('Are you sure you want to unverify this user\'s ID? They will need to re-upload their documents.')) return;

                                        try {
                                            const response = await fetch(`/api/admin/users/${user.id}/unverify`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ type: 'id' }),
                                            });

                                            if (response.ok) {
                                                toast.success('ID verification revoked. User will be notified to re-upload.');
                                                onUpdate();
                                                onClose();
                                            } else {
                                                throw new Error('Failed to unverify');
                                            }
                                        } catch (error) {
                                            toast.error('Failed to revoke verification');
                                        }
                                    }}
                                >
                                    Unverify ID
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Driver License Verification */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium">Driver's License</p>
                            <p className="text-xs text-muted-foreground">
                                {user.driverLicenseVerified ? 'Verified' : 'Not Verified'}
                                {user.driverLicenseNumber && ` (${user.driverLicenseNumber})`}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {user.driverLicenseUrl && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(user.driverLicenseUrl, '_blank')}
                                >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View License
                                </Button>
                            )}
                            {user.driverLicenseVerified && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={async () => {
                                        if (!confirm('Are you sure you want to unverify this user\'s driver\'s license? They will need to re-upload.')) return;

                                        try {
                                            const response = await fetch(`/api/admin/users/${user.id}/unverify`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ type: 'license' }),
                                            });

                                            if (response.ok) {
                                                toast.success('License verification revoked. User will be notified to re-upload.');
                                                onUpdate();
                                                onClose();
                                            } else {
                                                throw new Error('Failed to unverify');
                                            }
                                        } catch (error) {
                                            toast.error('Failed to revoke verification');
                                        }
                                    }}
                                >
                                    Unverify License
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </form>

            {/* ID Details Modal */}
            {showIdDetails && user.idDocumentUrl && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]" onClick={() => setShowIdDetails(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">ID Verification Details</h3>
                            <Button size="sm" variant="outline" onClick={() => setShowIdDetails(false)}>
                                Close
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700">ID Type</p>
                                <p className="text-sm text-gray-900">{user.idType || 'N/A'}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700">ID Number</p>
                                <p className="text-sm text-gray-900">{user.idNumber || 'N/A'}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700">Verification Status</p>
                                <p className="text-sm text-gray-900">{user.idVerified ? 'Verified ✓' : 'Not Verified'}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">ID Document</p>
                                <img
                                    src={user.idDocumentUrl}
                                    alt="ID Document"
                                    className="w-full rounded-lg border"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling!.classList.remove('hidden');
                                    }}
                                />
                                <div className="hidden p-4 bg-gray-100 rounded-lg text-center">
                                    <p className="text-sm text-gray-600">Unable to load image</p>
                                    <a
                                        href={user.idDocumentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                                    >
                                        Open in new tab
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
