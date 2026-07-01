import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = '/';

export const useIoT = () => {
    const [iotData, setIotData] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            setConnected(true);
            console.log('Connected to IoT Stream');
        });

        socket.on('iot_update', (data) => {
            setIotData(data);
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return { iotData, connected };
};
