import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Car, Upload, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    vehicles: any[];
    onUpdate: (vehicles: any[]) => void;
}

export function VehicleModal({ isOpen, onClose, userId, vehicles, onUpdate }: VehicleModalProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'list' | 'add'>('list');

    // Form state
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [plate, setPlate] = useState('');
    const [fuelType, setFuelType] = useState('petrol');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [licensePreview, setLicensePreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setLicenseFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setLicensePreview(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let licenseUrl = '';
            if (licenseFile) {
                const formData = new FormData();
                formData.append('file', licenseFile);
                formData.append('type', 'driver_license');

                const uploadRes = await fetch(`/api/users/${userId}/upload-document`, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error('Failed to upload license');
                const data = await uploadRes.json();
                licenseUrl = data.url;
            }

            const res = await fetch(`/api/profile/${userId}/vehicles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    make,
                    model,
                    year,
                    plateNumber: plate,
                    fuelType,
                    driverLicenseUrl: licenseUrl,
                    driverLicenseNumber: licenseNumber
                }),
            });

            if (!res.ok) throw new Error('Failed to add vehicle');

            const updatedVehicles = await res.json();
            onUpdate(updatedVehicles);
            toast.success('Vehicle added successfully');
            setStep('list');
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add vehicle');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (vehicleId: string) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;

        try {
            const res = await fetch(`/api/profile/${userId}/vehicles?id=${vehicleId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete vehicle');

            const updatedVehicles = await res.json();
            onUpdate(updatedVehicles);
            toast.success('Vehicle deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete vehicle');
        }
    };

    const resetForm = () => {
        setMake('');
        setModel('');
        setYear('');
        setPlate('');
        setFuelType('petrol');
        setLicenseNumber('');
        setLicenseFile(null);
        setLicensePreview(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="My Vehicles">
            <div className="space-y-6">
                {step === 'list' ? (
                    <div className="space-y-4">
                        {vehicles.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Car className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No vehicles added yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {vehicles.map((v) => (
                                    <div key={v.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-full">
                                                <Car className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{v.year} {v.make} {v.model}</p>
                                                <p className="text-xs text-muted-foreground">{v.plateNumber} • {v.fuelType || 'Petrol'}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Button className="w-full" onClick={() => setStep('add')}>Add New Vehicle</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Make</label>
                                <Input placeholder="e.g. Toyota" value={make} onChange={(e) => setMake(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Model</label>
                                <Input placeholder="e.g. Camry" value={model} onChange={(e) => setModel(e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Year</label>
                                <Input placeholder="e.g. 2022" value={year} onChange={(e) => setYear(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Plate Number</label>
                                <Input placeholder="e.g. ABC-1234" value={plate} onChange={(e) => setPlate(e.target.value)} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fuel Type</label>
                            <select
                                className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 glass"
                                value={fuelType}
                                onChange={(e) => setFuelType(e.target.value)}
                                required
                            >
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="electric">Electric</option>
                                <option value="cng">CNG</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Driver's License Number</label>
                            <Input
                                placeholder="Enter license number"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Driver's License Image</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {licensePreview ? (
                                    <div className="relative">
                                        <img src={licensePreview} alt="License Preview" className="max-h-32 mx-auto rounded-lg shadow-sm" />
                                        <p className="text-xs text-green-600 mt-2">License selected</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">Upload Driver's License</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setStep('list')}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Vehicle'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
