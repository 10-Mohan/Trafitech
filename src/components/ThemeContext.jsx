import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Default to 'light' since that's what was recently applied
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;

        root.classList.remove('light', 'dark');
        body.classList.remove('light', 'dark');

        root.classList.add(theme);
        body.classList.add(theme); // Necessary for body-level CSS overrides

        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
