import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode as QrIcon, X } from 'lucide-react';

const QRCodeGenerator = ({ booking, onClose }) => {
    const qrData = JSON.stringify({
        bookingId: booking.bookingId,
        slot: booking.slot?.title,
        zone: booking.parkingZone?.label,
        date: booking.date,
        time: `${booking.startTime} - ${booking.endTime}`,
        vehicle: booking.vehicleNumber,
    });

    const downloadQR = () => {
        const canvas = document.getElementById(`qr-${booking.bookingId}`);
        const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `parking-qr-${booking.bookingId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className="glass-panel rounded-xl p-6 text-center relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white transition-all rounded-lg hover:bg-slate-50 dark:hover:bg-white/10"
            >
                <X size={20} />
            </button>
            <div className="flex items-center justify-center gap-2 mb-4">
                <QrIcon size={20} className="text-brand-blue" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Entry QR Code</h3>
            </div>

            <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <QRCodeSVG
                    id={`qr-${booking.bookingId}`}
                    value={qrData}
                    size={200}
                    level="H"
                    includeMargin={true}
                />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Scan this QR code at the parking entrance
            </p>

            <button
                onClick={downloadQR}
                className="px-4 py-2 bg-brand-blue text-brand-dark font-medium rounded-lg hover:bg-brand-blue/90 transition-all flex items-center gap-2 mx-auto"
            >
                <Download size={16} />
                Download QR Code
            </button>
        </div>
    );
};

export default QRCodeGenerator;
