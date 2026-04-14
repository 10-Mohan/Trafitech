import { useState, useEffect } from 'react';

export const usePWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI to notify the user they can install the PWA
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Hide the button once installed successfully
        window.addEventListener('appinstalled', () => {
            setIsInstallable(false);
            setDeferredPrompt(null);
            console.log('PWA was installed successfully!');
        });

        // Check if the app is already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstallable(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return;

        // Show the browser installation prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the PWA install prompt: ${outcome}`);

        // The prompt can only be used once
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    return { isInstallable, promptInstall };
};
