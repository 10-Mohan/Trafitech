import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleEmergency = () => setEmergencyMode(prev => !prev);
    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <AppContext.Provider value={{
            emergencyMode,
            toggleEmergency,
            isMobileMenuOpen,
            toggleMobileMenu,
            closeMobileMenu
        }}>
            {children}
        </AppContext.Provider>
    );
};
