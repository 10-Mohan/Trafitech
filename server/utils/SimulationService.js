class SimulationService {
    constructor(io) {
        this.io = io;
        this.interval = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        this.interval = setInterval(() => {
            const sensorData = {
                timestamp: new Date().toISOString(),
                parking: {
                    totalSlots: 150,
                    occupied: Math.floor(Math.random() * 50) + 80,
                    status: 'active'
                },
                traffic: {
                    congestionLevel: Math.floor(Math.random() * 100),
                    avgSpeed: Math.floor(Math.random() * 20) + 30,
                    status: 'monitoring'
                }
            };
            this.io.emit('iot_update', sensorData);
        }, 5000);

        console.log('📡 IoT Simulation Service Started');
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.isRunning = false;
            console.log('🛑 IoT Simulation Service Stopped');
        }
    }
}

module.exports = SimulationService;
