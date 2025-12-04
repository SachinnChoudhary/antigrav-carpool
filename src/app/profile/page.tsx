"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShieldCheck, CreditCard, Bell, HelpCircle, LogOut, Star, Car, Leaf, Award, Settings, PenSquare, Music, Cigarette, Cat, MessageCircle } from "lucide-react";
import { ImageUpload } from "@/components/profile/ImageUpload";
import toast from "react-hot-toast";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { EditPreferencesModal } from "@/components/profile/EditPreferencesModal";
import { EditSocialsModal } from "@/components/profile/EditSocialsModal";
import { VerifyIdentityModal } from "@/components/profile/VerifyIdentityModal";
import { PaymentSettingsModal } from "@/components/profile/PaymentSettingsModal";
import { VehicleModal } from "@/components/profile/VehicleModal";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function SettingsItem({ icon: Icon, label, value, onClick, className }: { icon: React.ElementType; label: string; value?: string; onClick?: () => void; className?: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center justify-between w-full p-4 hover:bg-white/40 transition-colors border-b border-gray-100 last:border-0",
                className
            )}
        >
            <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white/50 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{label}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
                {value && <span className="text-sm">{value}</span>}
                <ChevronRight className="h-4 w-4" />
            </div>
        </button>
    );
}

function calculateCompletion(user: any, socialProfiles: any[]) {
    let score = 0;
    const total = 5;

    if (user.profileImage) score++;
    if (user.bio) score++;
    if (user.phone) score++;
    if (user.preferences && Object.keys(user.preferences).length > 0) score++;
    if (socialProfiles && socialProfiles.length > 0) score++;

    return Math.round((score / total) * 100);
}

import { NotificationsModal } from "@/components/profile/NotificationsModal";
import { HelpSupportModal } from "@/components/profile/HelpSupportModal";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = React.useState<any>(null);
    const [preferences, setPreferences] = React.useState<any>(null);
    const [socialProfiles, setSocialProfiles] = React.useState<any[]>([]);
    const [badges, setBadges] = React.useState<any[]>([]);
    const [friendships, setFriendships] = React.useState<any[]>([]);
    const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);
    const [isEditPreferencesOpen, setIsEditPreferencesOpen] = React.useState(false);
    const [isEditSocialsOpen, setIsEditSocialsOpen] = React.useState(false);
    const [isVerifyIdentityOpen, setIsVerifyIdentityOpen] = React.useState(false);
    const [isPaymentSettingsOpen, setIsPaymentSettingsOpen] = React.useState(false);
    const [isVehicleOpen, setIsVehicleOpen] = React.useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
    const [isHelpSupportOpen, setIsHelpSupportOpen] = React.useState(false);
    const [vehicles, setVehicles] = React.useState<any[]>([]);

    // Load user data from API
    React.useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) {
            router.push('/login');
            return;
        }
        const storedUser = JSON.parse(stored);
        const userId = storedUser.id;
        // Fetch full profile
        fetch(`/api/profile/${userId}`)
            .then((res) => res.json())
            .then((data) => setUser(data))
            .catch(() => router.push('/login'));
        // Fetch preferences
        fetch(`/api/profile/${userId}/preferences`)
            .then((res) => res.json())
            .then((data) => {
                // Handle case where data might be nested or null
                if (data && data.preferences) {
                    setPreferences(data.preferences);
                } else if (data && !data.error) {
                    // If the API returns the user object which contains preferences
                    setPreferences(data.preferences || {});
                }
            })
            .catch(() => { });
        // Fetch social profiles
        fetch(`/api/profile/${userId}/social-profiles`)
            .then((res) => res.json())
            .then((data) => setSocialProfiles(data))
            .catch(() => { });
        // Fetch vehicles
        fetch(`/api/profile/${userId}/vehicles`)
            .then((res) => res.json())
            .then((data) => setVehicles(data))
            .catch(() => { });
        // Fetch badges
        // Fetch badges
        fetch(`/api/profile/${userId}/badges`)
            .then((res) => res.json())
            .then((data) => setBadges(data))
            .catch(() => { });
        // Fetch friendships
        fetch(`/api/profile/${userId}/friendships`)
            .then((res) => res.json())
            .then((data) => setFriendships(data))
            .catch(() => { });
    }, [router]);

    const handleImageUploadSuccess = (imageUrl: string) => {
        if (user) {
            const updatedUser = { ...user, profileImage: imageUrl };
            setUser(updatedUser);
            // also update stored user for future loads
            const stored = localStorage.getItem('user');
            if (stored) {
                const storedUser = JSON.parse(stored);
                const newStored = { ...storedUser, profileImage: imageUrl };
                localStorage.setItem('user', JSON.stringify(newStored));
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) {
        return null;
    }

    return (
        <main className="min-h-screen pt-24 pb-24 bg-gradient-to-b from-background to-secondary/30">
            <Header />
            <div className="px-6 py-6 space-y-6">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <ImageUpload
                            userId={user.id}
                            currentImage={user.profileImage}
                            onUploadSuccess={handleImageUploadSuccess}
                        />
                    </div>
                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left w-full">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h1 className="text-3xl font-bold">{user.name}</h1>
                                {(calculateCompletion(user, socialProfiles) === 100 || user.verified) && (
                                    <div className="text-blue-500" title="Verified Profile">
                                        <Award className="h-6 w-6 fill-blue-100" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-muted-foreground mb-2">{user.email}</p>
                        {user.phone && (
                            <p className="text-sm text-muted-foreground mb-2">{user.phone}</p>
                        )}
                        {user.bio && (
                            <p className="text-sm italic text-gray-600 mb-4 max-w-md">{user.bio}</p>
                        )}

                        {/* Progress Bar */}
                        {calculateCompletion(user, socialProfiles) < 100 && (
                            <div className="mb-4 space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>Profile Completion</span>
                                    <span>{calculateCompletion(user, socialProfiles)}%</span>
                                </div>
                                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-500 ease-out"
                                        style={{ width: `${calculateCompletion(user, socialProfiles)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Complete your profile to get the Verified badge!</p>
                            </div>
                        )}

                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${i < Math.floor(user.rating || 0)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-semibold">{user.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Member since {new Date(user.createdAt).getFullYear()}
                            </div>
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsEditProfileOpen(true)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <GlassCard className="flex flex-col items-center justify-center p-4 space-y-1">
                        <span className="text-2xl font-bold text-primary">{user.totalRides || 0}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Rides</span>
                    </GlassCard>
                    <GlassCard className="flex flex-col items-center justify-center p-4 space-y-1 bg-green-50 border-green-200">
                        <div className="flex items-center space-x-1 text-green-600">
                            <Leaf className="h-4 w-4" />
                            <span className="text-2xl font-bold">{user.co2Saved || '0'}kg</span>
                        </div>
                        <span className="text-xs text-green-700 uppercase tracking-wider">Kg CO₂ Saved</span>
                    </GlassCard>
                </div>
                {/* Preferences */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="font-semibold">Preferences</h2>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsEditPreferencesOpen(true)}>
                            <PenSquare className="h-4 w-4" />
                        </Button>
                    </div>
                    <GlassCard className="p-4 overflow-auto max-h-48">
                        {!preferences || Object.keys(preferences).length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                                <p>No preferences set yet.</p>
                                <p className="text-xs mt-1">Add preferences to find better matches!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {preferences.music && (
                                    <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                                        <Music className="h-4 w-4 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-muted-foreground">Music</span>
                                            <span className="text-sm capitalize">{preferences.music}</span>
                                        </div>
                                    </div>
                                )}
                                {preferences.smoking && (
                                    <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                                        <Cigarette className="h-4 w-4 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-muted-foreground">Smoking</span>
                                            <span className="text-sm capitalize">{preferences.smoking === 'ok' ? 'Allowed' : 'No Smoking'}</span>
                                        </div>
                                    </div>
                                )}
                                {preferences.pets && (
                                    <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                                        <Cat className="h-4 w-4 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-muted-foreground">Pets</span>
                                            <span className="text-sm capitalize">{preferences.pets === 'ok' ? 'Allowed' : 'No Pets'}</span>
                                        </div>
                                    </div>
                                )}
                                {preferences.chat && (
                                    <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                                        <MessageCircle className="h-4 w-4 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-muted-foreground">Chat</span>
                                            <span className="text-sm capitalize">{preferences.chat}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </GlassCard>
                </div>
                {/* Social Profiles */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="font-semibold">Social Profiles</h2>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsEditSocialsOpen(true)}>
                            <PenSquare className="h-4 w-4" />
                        </Button>
                    </div>
                    <GlassCard className="p-4">
                        {socialProfiles.length === 0 ? (
                            <p className="text-muted-foreground">No social profiles linked.</p>
                        ) : (
                            <ul className="space-y-2">
                                {socialProfiles.map((sp) => (
                                    <li key={sp.id} className="flex items-center space-x-2">
                                        <span className="font-medium">{sp.provider}:</span>
                                        <a href={sp.profileUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                            {sp.profileUrl}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </GlassCard>
                </div>
                {/* Badges */}
                <div className="space-y-4">
                    <h2 className="font-semibold px-2">Badges & Achievements</h2>
                    <GlassCard className="p-4">
                        {badges.length === 0 ? (
                            <p className="text-muted-foreground">No badges earned.</p>
                        ) : (
                            <ul className="space-y-2">
                                {badges.map((b) => (
                                    <li key={b.id} className="flex items-start space-x-2">
                                        <div className="flex-1">
                                            <span className="font-medium">{b.badgeName}</span>
                                            {b.description && <p className="text-sm text-muted-foreground">{b.description}</p>}
                                            <span className="text-xs text-muted-foreground">Earned {new Date(b.earnedAt).toLocaleDateString()}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </GlassCard>
                </div>
                {/* Friends */}
                <div className="space-y-4">
                    <h2 className="font-semibold px-2">Friends</h2>
                    <GlassCard className="p-4">
                        {friendships.length === 0 ? (
                            <p className="text-muted-foreground">No friends yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {friendships.map((f) => (
                                    <li key={f.id} className="flex items-center space-x-2">
                                        <span className="font-medium">
                                            {f.requesterId === user.id ? f.addresseeId : f.requesterId}
                                        </span>
                                        <span className="text-sm text-muted-foreground">({f.status})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </GlassCard>
                </div>
                {/* Account Settings */}
                <div className="space-y-4">
                    <h2 className="font-semibold px-2">Account</h2>
                    <GlassCard className="p-0 overflow-hidden">
                        <SettingsItem
                            icon={ShieldCheck}
                            label="Verify Identity"
                            value={user.idVerified ? 'Verified' : 'Pending'}
                            onClick={() => setIsVerifyIdentityOpen(true)}
                            className={user.idVerified ? "text-green-600" : ""}
                        />
                        <SettingsItem
                            icon={CreditCard}
                            label="Payments"
                            onClick={() => setIsPaymentSettingsOpen(true)}
                        />
                        <SettingsItem
                            icon={Car}
                            label="My Vehicles"
                            value={`${vehicles.length} Car${vehicles.length !== 1 ? 's' : ''}`}
                            onClick={() => setIsVehicleOpen(true)}
                        />
                    </GlassCard>
                </div>
                {/* App Settings */}
                <div className="space-y-4">
                    <h2 className="font-semibold px-2">App Settings</h2>
                    <GlassCard className="p-0 overflow-hidden">
                        <SettingsItem
                            icon={Bell}
                            label="Notifications"
                            onClick={() => setIsNotificationsOpen(true)}
                        />
                        <SettingsItem
                            icon={HelpCircle}
                            label="Help & Support"
                            onClick={() => router.push('/support')}
                        />
                        <SettingsItem icon={LogOut} label="Log Out" className="text-destructive hover:bg-destructive/10" />
                    </GlassCard>
                </div>
            </div>
            <BottomNav />

            {/* Modals */}
            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                user={user}
                onUpdate={setUser}
            />
            <EditPreferencesModal
                isOpen={isEditPreferencesOpen}
                onClose={() => setIsEditPreferencesOpen(false)}
                userId={user.id}
                initialPreferences={preferences}
                onUpdate={(newPrefs) => {
                    setPreferences(newPrefs);
                    // Also update the main user object to reflect changes immediately if needed for completion calc
                    setUser((prev: any) => ({ ...prev, preferences: newPrefs }));
                }}
            />
            <EditSocialsModal
                isOpen={isEditSocialsOpen}
                onClose={() => setIsEditSocialsOpen(false)}
                userId={user.id}
                initialProfiles={socialProfiles}
                onUpdate={setSocialProfiles}
            />
            <VerifyIdentityModal
                isOpen={isVerifyIdentityOpen}
                onClose={() => setIsVerifyIdentityOpen(false)}
                userId={user.id}
                idVerified={user.idVerified}
                onUpdate={setUser}
            />
            <PaymentSettingsModal
                isOpen={isPaymentSettingsOpen}
                onClose={() => setIsPaymentSettingsOpen(false)}
                userId={user.id}
            />
            <VehicleModal
                isOpen={isVehicleOpen}
                onClose={() => setIsVehicleOpen(false)}
                userId={user.id}
                vehicles={vehicles}
                onUpdate={setVehicles}
            />
            <NotificationsModal
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
            <HelpSupportModal
                isOpen={isHelpSupportOpen}
                onClose={() => setIsHelpSupportOpen(false)}
            />
        </main>
    );
}
