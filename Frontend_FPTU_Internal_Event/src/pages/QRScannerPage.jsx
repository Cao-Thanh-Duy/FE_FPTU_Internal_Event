import React, { useState, useRef, useEffect } from "react";
import "../assets/css/QRScannerPage.css";
import SidebarStaff from "../components/SidebarStaff";
import { FaQrcode, FaCamera, FaCheckCircle, FaTimesCircle, FaUpload, FaKeyboard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Html5Qrcode } from 'html5-qrcode';

const QRScannerPage = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);
    const [manualCode, setManualCode] = useState("");
    const [showManualInput, setShowManualInput] = useState(false);
    const html5QrCodeRef = useRef(null);
    const qrCodeRegionId = "qr-reader";

    // Hàm xử lý kết quả quét QR
    const handleScanSuccess = (decodedText) => {
        // Parse QR code data
        try {
            // Giả sử QR code chứa JSON hoặc format đơn giản
            let qrData;
            try {
                qrData = JSON.parse(decodedText);
            } catch {
                // Nếu không phải JSON, coi như là userId/code đơn giản
                qrData = {
                    userId: decodedText,
                    userName: "User " + decodedText.substring(0, 8),
                    eventId: "EVENT001",
                    timestamp: new Date().toISOString()
                };
            }

            setScannedData(qrData);
            
            // Thêm vào lịch sử
            const newScan = {
                ...qrData,
                scanTime: new Date().toLocaleString('vi-VN'),
                status: 'success'
            };
            
            setScanHistory(prev => [newScan, ...prev].slice(0, 10));
            toast.success(`Check-in thành công: ${qrData.userName || qrData.userId}`);
            
            // Dừng quét sau khi thành công
            stopCamera();
        } catch (error) {
            console.error("Error processing QR code:", error);
            toast.error('Lỗi khi xử lý mã QR');
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
                handleScanSuccess,
                (errorMessage) => {
                    // Lỗi quét - không cần hiển thị mỗi lần
                    console.log("Scanning...", errorMessage);
                }
            );

            toast.success('Camera đã được bật');
        } catch (err) {
            console.error("Error accessing camera:", err);
            setIsScanning(false);
            toast.error('Không thể truy cập camera. Vui lòng cấp quyền camera hoặc sử dụng HTTPS/localhost.');
        }
    };

    // Hàm tắt camera
    const stopCamera = async () => {
        try {
            if (html5QrCodeRef.current && isScanning) {
                await html5QrCodeRef.current.stop();
                setIsScanning(false);
                toast.info('Camera đã được tắt');
            }
        } catch (err) {
            console.error("Error stopping camera:", err);
        }
    };

    // Hàm xử lý upload ảnh QR
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                toast.info('Đang xử lý ảnh QR...');
                
                if (!html5QrCodeRef.current) {
                    html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
                }

                const result = await html5QrCodeRef.current.scanFile(file, true);
                handleScanSuccess(result);
            } catch (err) {
                console.error("Error scanning file:", err);
                toast.error('Không thể đọc mã QR từ ảnh này');
            }
        }
    };

    // Hàm xử lý nhập code thủ công
    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualCode.trim()) {
            handleScanSuccess(manualCode.trim());
            setManualCode("");
            setShowManualInput(false);
        } else {
            toast.warning('Vui lòng nhập mã check-in');
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
                        <h1>Quét QR Check-in</h1>
                        <p>Quét mã QR của người tham gia để check-in sự kiện</p>
                    </div>

                    <div className="scanner-container">
                        <div className="scanner-section">
                            <div className="camera-container">
                                {!isScanning ? (
                                    <div className="camera-placeholder">
                                        <FaQrcode className="qr-icon-large" />
                                        <h3>Camera chưa được bật</h3>
                                        <p>Nhấn nút bên dưới để bắt đầu quét</p>
                                    </div>
                                ) : (
                                    <div id={qrCodeRegionId} className="qr-reader-container"></div>
                                )}
                            </div>

                            <div className="scanner-controls">
                                {!isScanning ? (
                                    <>
                                        <button onClick={startCamera} className="btn-start-camera">
                                            <FaCamera /> Bật Camera
                                        </button>
                                        <label className="btn-upload">
                                            <FaUpload /> Upload ảnh QR
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                        <button 
                                            onClick={() => setShowManualInput(!showManualInput)} 
                                            className="btn-manual-input"
                                        >
                                            <FaKeyboard /> Nhập Code
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={stopCamera} className="btn-stop-camera">
                                            Tắt Camera
                                        </button>
                                        <button 
                                            onClick={() => setShowManualInput(!showManualInput)} 
                                            className="btn-manual-input"
                                        >
                                            <FaKeyboard /> Nhập Code
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Manual Input Form */}
                            {showManualInput && (
                                <div className="manual-input-section">
                                    <h3>Nhập mã check-in thủ công</h3>
                                    <form onSubmit={handleManualSubmit}>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                value={manualCode}
                                                onChange={(e) => setManualCode(e.target.value)}
                                                placeholder="Nhập mã check-in hoặc User ID..."
                                                className="manual-code-input"
                                                autoFocus
                                            />
                                            <button type="submit" className="btn-submit-code">
                                                Xác nhận
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {scannedData && (
                                <div className="scanned-result">
                                    <h3>Kết quả quét:</h3>
                                    <div className="result-details">
                                        <p><strong>User ID:</strong> {scannedData.userId}</p>
                                        <p><strong>Tên:</strong> {scannedData.userName}</p>
                                        <p><strong>Event ID:</strong> {scannedData.eventId}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Scan History */}
                        <div className="history-section">
                            <h3>Lịch sử quét ({scanHistory.length})</h3>
                            <div className="history-list">
                                {scanHistory.length === 0 ? (
                                    <div className="no-history">
                                        <p>Chưa có lịch sử quét</p>
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
