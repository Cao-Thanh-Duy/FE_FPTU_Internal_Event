import React, { useState, useRef, useEffect } from "react";
import "../assets/css/QRScannerPage.css";
import SidebarStaff from "../components/SidebarStaff";
import { FaQrcode, FaCamera, FaCheckCircle, FaTimesCircle, FaKeyboard, FaBan, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';

const QRScannerPage = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);
    const [manualCode, setManualCode] = useState("");
    const [showManualInput, setShowManualInput] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const html5QrCodeRef = useRef(null);
    const qrCodeRegionId = "qr-reader";
    // Hàm xử lý kết quả quét QR
    const handleScanSuccess = async (decodedText) => {
        // Kiểm tra xem đã có scannedData rồi thì không xử lý nữa
        if (scannedData && scannedData.ticketCode === decodedText) {
            return;
        }
        
        try {
            // Dừng quét ngay khi có kết quả
            await stopCamera();
            
            toast.info('Getting ticket information...');
            
            // Gọi API để lấy thông tin ticket từ ticketCode
            const response = await axios.get(`https://localhost:7047/infoticket?ticketCode=${decodedText}`);
            
            if (response.data.success) {
                const ticketData = response.data.data;
                setScannedData(ticketData);
                
                // Thêm vào lịch sử
                const newScan = {
                    ...ticketData,
                    scanTime: new Date().toLocaleString('vi-VN'),
                    status: 'success'
                };
                
                setScanHistory(prev => [newScan, ...prev].slice(0, 10));
                toast.success('Ticket information retrieved successfully!');
            } else {
                throw new Error(response.data.message || 'Failed to get ticket info');
            }
        } catch (error) {
            console.error("Error processing QR code:", error);
            const errorMessage = error.response?.data?.message || error.message || 'Error processing QR code';
            toast.error(errorMessage);
            
            // Thêm vào lịch sử với status error
            const errorScan = {
                ticketCode: decodedText,
                scanTime: new Date().toLocaleString('vi-VN'),
                status: 'error',
                errorMessage: errorMessage
            };
            setScanHistory(prev => [errorScan, ...prev].slice(0, 10));
        }
    };

    // Hàm bật camera với html5-qrcode
    const startCamera = async () => {
        try {
            // Set scanning state first để render DOM element
            setIsScanning(true);
            
            // Đợi DOM render
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
            }

            const config = { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            await html5QrCodeRef.current.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    // Gọi handleScanSuccess và dừng quét ngay
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Lỗi quét - không cần hiển thị mỗi lần
                    console.log("Scanning...", errorMessage);
                }
            );

            toast.success('Camera has been turned on');
        } catch (err) {
            console.error("Error accessing camera:", err);
            setIsScanning(false);
            
            toast.error('Unable to access camera. Please grant camera permission or use HTTPS/localhost.');
        }
    };

    // Hàm tắt camera
    const stopCamera = async () => {
        try {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                await html5QrCodeRef.current.stop();
                setIsScanning(false);
            }
        } catch (err) {
            console.error("Error stopping camera:", err);
            setIsScanning(false);
        }
    };

    // Hàm quét QR từ ảnh upload

    // Reset input value and trigger file scan

    // Hàm xử lý nhập code thủ công
    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualCode.trim()) {
            handleScanSuccess(manualCode.trim());
            setManualCode("");
            setShowManualInput(false);
        } else {
            toast.warning('Please enter check-in code');
        }
    };

    // Hàm Check In
    const handleCheckIn = async (ticketId) => {
        if (!ticketId) return;
        
        setIsProcessing(true);
        try {
            const response = await axios.put(`https://localhost:7047/CheckIn?ticketId=${ticketId}`);
            
            if (response.data.success) {
                toast.success('Check-in successful!');
                
                // Cập nhật scannedData với status mới
                setScannedData(prev => ({
                    ...prev,
                    status: 'Checked',
                    checkInTime: new Date().toISOString()
                }));
                
                // Cập nhật lịch sử
                setScanHistory(prev => prev.map((item, idx) => 
                    idx === 0 ? { ...item, status: 'Checked' } : item
                ));
            } else {
                toast.error(response.data.message || 'Check-in failed');
            }
        } catch (error) {
            console.error('Error checking in:', error);
            const errorMessage = error.response?.data?.message || 'Unable to check-in. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    // Hàm Cancel Ticket
    const handleCancelTicket = async (ticketId) => {
        if (!ticketId) return;
        
        if (!window.confirm('Are you sure you want to cancel this ticket?')) return;
        
        setIsProcessing(true);
        try {
            const response = await axios.put(`https://localhost:7047/Cancelled?ticketId=${ticketId}`);
            
            if (response.data.success) {
                toast.success('Ticket cancelled successfully!');
                
                // Cập nhật scannedData với status mới
                setScannedData(prev => ({
                    ...prev,
                    status: 'Cancelled'
                }));
                
                // Cập nhật lịch sử
                setScanHistory(prev => prev.map((item, idx) => 
                    idx === 0 ? { ...item, status: 'Cancelled' } : item
                ));
            } else {
                toast.error(response.data.message || 'Cancel ticket failed');
            }
        } catch (error) {
            console.error('Error cancelling ticket:', error);
            const errorMessage = error.response?.data?.message || 'Unable to cancel ticket. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="qr-scanner-page">
            <SidebarStaff />
            
            <div className="scanner-main">
                <div className="scanner-content">
                    <div className="page-header">
                        <h1>QR Scanner Check-in</h1>
                        <p>Scan attendees' QR code to check-in for the event</p>
                    </div>

                    <div className="scanner-container">
                        <div className="scanner-section">
                            <div className="camera-container">
                                {!isScanning ? (
                                    <div className="camera-placeholder">
                                        <FaQrcode className="qr-icon-large" />
                                        <h3>Camera is not turned on</h3>
                                        <p>Press the button below to start scanning</p>
                                    </div>
                                ) : (
                                    <div id={qrCodeRegionId} className="qr-reader-container"></div>
                                )}
                            </div>

                            <div className="scanner-controls">
                                {!isScanning ? (
                                    <>
                                        <button onClick={startCamera} className="btn-start-camera">
                                            <FaCamera /> Turn On Camera
                                        </button>
                                        <button 
                                            onClick={() => setShowManualInput(!showManualInput)} 
                                            className="btn-manual-input"
                                        >
                                            <FaKeyboard /> Enter Code
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={stopCamera} className="btn-stop-camera">
                                            Turn Off Camera
                                        </button>
                                        <button 
                                            onClick={() => setShowManualInput(!showManualInput)} 
                                            className="btn-manual-input"
                                        >
                                            <FaKeyboard /> Enter Code
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Manual Input Form */}
                            {showManualInput && (
                                <div className="manual-input-section">
                                    <h3>Enter check-in code manually</h3>
                                    <form onSubmit={handleManualSubmit}>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                value={manualCode}
                                                onChange={(e) => setManualCode(e.target.value)}
                                                placeholder="Enter check-in code or User ID..."
                                                className="manual-code-input"
                                                autoFocus
                                            />
                                            <button type="submit" className="btn-submit-code">
                                                Confirm
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {scannedData && (
                                <div className="scanned-result">
                                    <h3>Ticket Information:</h3>
                                    <div className="result-details">
                                        <p><strong>Ticket ID:</strong> {scannedData.ticketId}</p>
                                        <p><strong>Ticket Code:</strong> {scannedData.ticketCode}</p>
                                        <p><strong>User:</strong> {scannedData.userName}</p>
                                        <p><strong>Event:</strong> {scannedData.eventName}</p>
                                        <p><strong>Event Date:</strong> {scannedData.startDay ? new Date(scannedData.startDay).toLocaleDateString('vi-VN') : 'N/A'}</p>
                                        {scannedData.slots && scannedData.slots.length > 0 && (
                                            <p>
                                                <strong>Time Slots:</strong>
                                                {scannedData.slots.map((slot, index) => (
                                                    <div key={index}>
                                                        {slot.slotName}: {slot.startTime} - {slot.endTime}
                                                    </div>
                                                ))}
                                            </p>
                                        )}
                                        <p><strong>Status:</strong> <span className={`status-badge ${scannedData.status?.toLowerCase()}`}>{scannedData.status}</span></p>
                                        {scannedData.checkInTime && (
                                            <p><strong>Check-in Time:</strong> {new Date(scannedData.checkInTime).toLocaleString('vi-VN')}</p>
                                        )}
                                    </div>
                                    <div className="action-buttons">
                                        <button 
                                            className="btn-checkin"
                                            onClick={() => handleCheckIn(scannedData.ticketId)}
                                            disabled={isProcessing || scannedData.status === 'Checked' || scannedData.status === 'Cancelled'}
                                        >
                                            <FaCheckCircle /> Check In
                                        </button>
                                        <button 
                                            className="btn-cancel-ticket"
                                            onClick={() => handleCancelTicket(scannedData.ticketId)}
                                            disabled={isProcessing || scannedData.status === 'Cancelled'}
                                        >
                                            <FaBan /> Cancel Ticket
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Scan History */}
                        <div className="history-section">
                            <h3>Scan History ({scanHistory.length})</h3>
                            <div className="history-list">
                                {scanHistory.length === 0 ? (
                                    <div className="no-history">
                                        <p>No scan history yet</p>
                                    </div>
                                ) : (
                                    scanHistory.map((scan, index) => (
                                        <div key={index} className={`history-item ${scan.status}`}>
                                            <div className="history-icon">
                                                {scan.status === 'success' ? 
                                                    <FaCheckCircle className="icon-success" /> : 
                                                    <FaTimesCircle className="icon-error" />
                                                }
                                            </div>
                                            <div className="history-details">
                                                <p className="history-name">{scan.userName}</p>
                                                <p className="history-id">{scan.userId}</p>
                                                <p className="history-time">{scan.scanTime}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScannerPage;
