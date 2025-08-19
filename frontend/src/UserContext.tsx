import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "./constants";

interface User {
    id: string;
    display_name?: string;
    email?: string;
    external_urls: { spotify: string };
    user_name: string;
    profile_image?: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    clearUser: () => void;
    resetSignOutFlag: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [hasSignedOut, setHasSignedOut] = useState(false);

    useEffect(() => {
        // Check if user has signed out
        const signedOutFlag = sessionStorage.getItem("signedOut");
        if (signedOutFlag === "true" || hasSignedOut) {
            setUser(null);
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_URL}/api/me`, { 
                    credentials: "include",
                    headers: { "Content-Type": "application/json" }
                });

                const data = await res.json();

                if (data.user) {
                    setUser({
                        id: data.user.id,
                        display_name: data.user.display_name,
                        email: data.user.email,
                        external_urls: data.user.external_urls || { spotify: "https://open.spotify.com" },
                        user_name: data.user.display_name || data.user.id,
                        profile_image: data.user.profile_image || undefined,
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            }};
            
        fetchUser();
    }, [hasSignedOut]);

    const clearUser = () => {
        setUser(null);
        setHasSignedOut(true);
  
        sessionStorage.setItem("signedOut", "true");
    };

    const resetSignOutFlag = () => {
        setHasSignedOut(false);
        sessionStorage.removeItem("signedOut");
    };

    return (
        <UserContext.Provider value={{ user, setUser, clearUser, resetSignOutFlag }}>
          {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};