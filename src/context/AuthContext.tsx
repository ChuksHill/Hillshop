import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAdmin: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            checkAdmin(session?.user?.id);
            if (!session?.user) setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                checkAdmin(session.user.id);
            } else {
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkAdmin = async (userId: string | undefined) => {
        if (!userId) {
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        // 1. Check if email matches Env Var (Super Admin override)
        // We need the current session user email for this
        const { data: { user } } = await supabase.auth.getUser();
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

        console.log("Checking Admin:", { userEmail: user?.email, adminEnv: adminEmail });

        if (user?.email && adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase()) {
            console.log("Admin access granted via Email Match. Syncing with DB...");

            // Sync with DB to ensure RLS works
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", userId)
                .maybeSingle();

            if (!profile || profile.role !== "admin") {
                console.log("Upgrading profile to admin in DB...");
                await supabase
                    .from("profiles")
                    .upsert({ id: userId, role: "admin" });
            }

            setIsAdmin(true);
            setLoading(false);
            return;
        }

        // 2. Check Database Role
        const { data } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .maybeSingle(); // Use maybeSingle to avoid 406 error if not found

        if (!data) {
            // Profile missing? Try to create one (backfill for existing user)
            const { error: insertError } = await supabase
                .from("profiles")
                .insert([{ id: userId, role: "user" }]);

            if (insertError) {
                console.error("Error creating profile:", insertError);
            }
            setIsAdmin(false);
        } else {
            console.log("Database Role:", data.role);
            setIsAdmin(data.role === "admin");
        }
        setLoading(false);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setIsAdmin(false);
    };

    const resetPassword = async (email: string) => {
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
    };

    const updatePassword = async (password: string) => {
        return await supabase.auth.updateUser({ password });
    };

    return (
        <AuthContext.Provider value={{ user, session, isAdmin, loading, signOut, resetPassword, updatePassword }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
