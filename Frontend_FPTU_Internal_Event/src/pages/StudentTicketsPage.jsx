import React, { useState, useEffect } from "react";
import "../assets/css/StudentTicketsPage.css";
import SidebarStudent from "../components/SidebarStudent";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaQrcode, FaDownload, FaTimes, FaTicketAlt, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const StudentTicketsPage = () => {
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [myTickets, setMyTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qrCode, setQrCode] = useState("");
    const [showCheckedModal, setShowCheckedModal] = useState(false);
    const [showCancelledModal, setShowCancelledModal] = useState(false);

    // Fetch tickets from API
    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            const response = await axios.get(`https://localhost:7047/api/Ticket?userId=${userId}`);
            
            if (response.data.success) {
                setMyTickets(response.data.data);
                console.log('Tickets:', response.data.data);
            } else {
                toast.error('Không thể tải danh sách vé');
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Có lỗi xảy ra khi tải danh sách vé');
        } finally {
            setLoading(false);
        }
    };

    const handleShowQR = async (ticket) => {
        try {
            const response = await axios.get(`https://localhost:7047/getQR?ticketId=${ticket.ticketId}`);
            
            if (response.data.success) {
                setQrCode(response.data.qrcode);
                setSelectedTicket(ticket);
                setShowQRModal(true);
            } else {
                toast.error('Không thể tải mã QR');
            }
        } catch (error) {
            console.error('Error fetching QR code:', error);
            toast.error('Có lỗi xảy ra khi tải mã QR');
        }
    };

    const handleDownloadTicket = async (ticket) => {
        try {
            if (!qrCode) {
                const response = await axios.get(`https://localhost:7047/getQR?ticketId=${ticket.ticketId}`);
                if (response.data.success) {
                    downloadQRImage(response.data.qrcode, ticket);
                } else {
                    toast.error('Không thể tải mã QR');
                }
            } else {
                downloadQRImage(qrCode, ticket);
            }
        } catch (error) {
            console.error('Error downloading ticket:', error);
            toast.error('Có lỗi xảy ra khi tải vé');
        }
    };

    const downloadQRImage = (qrCodeData, ticket) => {
        const link = document.createElement('a');
        link.href = qrCodeData;
        link.download = `ticket-${ticket.ticketCode || ticket.ticketId}.png`;
        link.click();
        toast.success('Đã tải xuống vé!', {
            position: "top-right",
            autoClose: 2000,
        });
    };

    const handleCancelTicket = async (ticket) => {
        if (window.confirm(`Bạn có chắc chắn muốn hủy vé cho sự kiện "${ticket.eventName}"?`)) {
            try {
                const response = await axios.put(`https://localhost:7047/Cancelled?ticketId=${ticket.ticketId}`);
                
                if (response.data.success) {
                    toast.success('Đã hủy vé thành công!', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    // Refresh tickets list
                    fetchTickets();
                } else {
                    toast.error(response.data.message || 'Không thể hủy vé');
                }
            } catch (error) {
                console.error('Error cancelling ticket:', error);
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi hủy vé');
            }
        }
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            "Not Used": { text: "Đã xác nhận", class: "status-confirmed", icon: <FaCheckCircle /> },
            "Used": { text: "Đã sử dụng", class: "status-used", icon: <FaCheckCircle /> },
            "Checked": { text: "Đã check-in", class: "status-checked", icon: <FaCheckCircle /> },
            "Cancelled": { text: "Đã hủy", class: "status-cancelled", icon: <FaTimes /> }
        };
        return statusMap[status] || statusMap["Not Used"];
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const upcomingTickets = myTickets.filter(ticket => ticket.status === 'Not Used');
    const checkedTickets = myTickets.filter(ticket => ticket.status === 'Checked');
    const usedTickets = myTickets.filter(ticket => ticket.status === 'Used');
    const cancelledTickets = myTickets.filter(ticket => ticket.status === 'Cancelled');

    return (
        <div className="student-tickets-page">
            <SidebarStudent />
            
            <div className="tickets-main">
                <div className="tickets-content">
                    <div className="page-header">
                        <div>
                            <h1>Vé của tôi</h1>
                            <p>Quản lý các vé sự kiện đã đăng ký</p>
                        </div>
                        <div className="header-buttons">
                            {checkedTickets.length > 0 && (
                                <button 
                                    className="btn-checked-toggle"
                                    onClick={() => setShowCheckedModal(true)}
                                >
                                    <FaCheckCircle /> Checked In ({checkedTickets.length})
                                </button>
                            )}
                            {cancelledTickets.length > 0 && (
                                <button 
                                    className="btn-cancelled-toggle"
                                    onClick={() => setShowCancelledModal(true)}
                                >
                                    <FaTimes /> Cancelled ({cancelledTickets.length})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="tickets-stats">
                        <div className="stat-box">
                            <div className="stat-number">{upcomingTickets.length}</div>
                            <div className="stat-label">Vé sắp tới</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">{checkedTickets.length}</div>
                            <div className="stat-label">Đã tham gia</div>
                        </div>
                    </div>

                    {/* Upcoming Tickets */}
                    {loading ? (
                        <div className="loading-message">
                            <p>Đang tải danh sách vé...</p>
                        </div>
                    ) : upcomingTickets.length > 0 ? (
                        <div className="tickets-section">
                            <h2 className="section-title">Vé sắp tới</h2>
                            <div className="tickets-grid">
                                {upcomingTickets.map(ticket => (
                                    <div key={ticket.ticketId} className="ticket-card upcoming">
                                        <div className="ticket-header">
                                            <FaTicketAlt className="ticket-icon" />
                                            <span className={`ticket-status ${getStatusInfo(ticket.status).class}`}>
                                                {getStatusInfo(ticket.status).icon}
                                                {getStatusInfo(ticket.status).text}
                                            </span>
                                        </div>
                                        
                                        <h3 className="ticket-event-name">{ticket.eventName}</h3>
                                        <div className="ticket-id">Mã vé: {ticket.ticketCode || ticket.ticketId}</div>
                                        <div className="ticket-id">Số ghế: {ticket.seatNumber}</div>
                                        
                                        <div className="ticket-details">
                                            <div className="detail-row">
                                                <FaCalendar className="detail-icon" />
                                                <span>{formatDate(ticket.startDay)}</span>
                                            </div>
                                        </div>

                                        <div className="ticket-actions">
                                            <button 
                                                className="btn-show-qr"
                                                onClick={() => handleShowQR(ticket)}
                                            >
                                                <FaQrcode /> Xem QR
                                            </button>
                                            <button 
                                                className="btn-download"
                                                onClick={() => handleDownloadTicket(ticket)}
                                            >
                                                <FaDownload />
                                            </button>
                                            <button 
                                                className="btn-cancel"
                                                onClick={() => handleCancelTicket(ticket)}
                                            >
                                                <FaTimes /> Hủy vé
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Used Tickets */}
                    {!loading && usedTickets.length > 0 && (
                        <div className="tickets-section">
                            <h2 className="section-title">Đã tham gia</h2>
                            <div className="tickets-grid">
                                {usedTickets.map(ticket => (
                                    <div key={ticket.ticketId} className="ticket-card used">
                                        <div className="ticket-header">
                                            <FaTicketAlt className="ticket-icon" />
                                            <span className={`ticket-status ${getStatusInfo(ticket.status).class}`}>
                                                {getStatusInfo(ticket.status).icon}
                                                {getStatusInfo(ticket.status).text}
                                            </span>
                                        </div>
                                        
                                        <h3 className="ticket-event-name">{ticket.eventName}</h3>
                                        <div className="ticket-id">Mã vé: {ticket.ticketCode || ticket.ticketId}</div>
                                        <div className="ticket-id">Số ghế: {ticket.seatNumber}</div>
                                        
                                        <div className="ticket-details">
                                            <div className="detail-row">
                                                <FaCalendar className="detail-icon" />
                                                <span>{formatDate(ticket.startDay)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && myTickets.length === 0 && (
                        <div className="no-tickets">
                            <FaTicketAlt className="no-tickets-icon" />
                            <p>Bạn chưa có vé nào</p>
                            <p className="no-tickets-hint">Hãy đăng ký tham gia các sự kiện thú vị!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* QR Code Modal */}
            {showQRModal && selectedTicket && (
                <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Vé tham gia sự kiện</h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowQRModal(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="qr-ticket-container">
                                <div className="qr-ticket-info">
                                    <h3>{selectedTicket.eventName}</h3>
                                    <div className="qr-ticket-details">
                                        <p><strong>Mã vé:</strong> {selectedTicket.ticketCode || selectedTicket.ticketId}</p>
                                        <p><strong>Số ghế:</strong> {selectedTicket.seatNumber}</p>
                                        <p><FaCalendar /> <strong>Ngày:</strong> {formatDate(selectedTicket.startDay)}</p>
                                        <p><strong>Người đặt:</strong> {selectedTicket.userName}</p>
                                    </div>
                                </div>
                                
                                <div className="qr-code-display">
                                    <div className="qr-code-box">
                                        {qrCode ? (
                                            <img src={qrCode} alt="QR Code" style={{width: '100%', height: 'auto'}} />
                                        ) : (
                                            <FaQrcode className="qr-placeholder" />
                                        )}
                                    </div>
                                    <p className="qr-instruction">
                                        Vui lòng xuất trình mã QR này khi tham gia sự kiện
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="btn-download-modal" 
                                onClick={() => handleDownloadTicket(selectedTicket)}
                            >
                                <FaDownload /> Tải xuống
                            </button>
                            <button 
                                className="btn-close-modal" 
                                onClick={() => setShowQRModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Checked In Tickets Modal */}
            {showCheckedModal && (
                <div className="modal-overlay" onClick={() => setShowCheckedModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaCheckCircle /> Vé đã check-in ({checkedTickets.length})
                            </h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowCheckedModal(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="modal-body modal-body-tickets">
                            {checkedTickets.length > 0 ? (
                                <div className="tickets-grid">
                                    {checkedTickets.map(ticket => (
                                        <div key={ticket.ticketId} className="ticket-card checked">
                                            <div className="ticket-header">
                                                <FaTicketAlt className="ticket-icon" />
                                                <span className={`ticket-status ${getStatusInfo(ticket.status).class}`}>
                                                    {getStatusInfo(ticket.status).icon}
                                                    {getStatusInfo(ticket.status).text}
                                                </span>
                                            </div>
                                            
                                            <h3 className="ticket-event-name">{ticket.eventName}</h3>
                                            <div className="ticket-id">Mã vé: {ticket.ticketCode || ticket.ticketId}</div>
                                            <div className="ticket-id">Số ghế: {ticket.seatNumber}</div>
                                            
                                            <div className="ticket-details">
                                                <div className="detail-row">
                                                    <FaCalendar className="detail-icon" />
                                                    <span>{formatDate(ticket.startDay)}</span>
                                                </div>
                                            </div>

                                            <div className="ticket-actions">
                                                <button 
                                                    className="btn-show-qr"
                                                    onClick={() => {
                                                        setShowCheckedModal(false);
                                                        handleShowQR(ticket);
                                                    }}
                                                >
                                                    <FaQrcode /> Xem QR
                                                </button>
                                                <button 
                                                    className="btn-download"
                                                    onClick={() => handleDownloadTicket(ticket)}
                                                >
                                                    <FaDownload />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-tickets">
                                    <FaTicketAlt className="no-tickets-icon" />
                                    <p>Không có vé đã check-in</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="btn-close-modal" 
                                onClick={() => setShowCheckedModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancelled Tickets Modal */}
            {showCancelledModal && (
                <div className="modal-overlay" onClick={() => setShowCancelledModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaTimes /> Vé đã hủy ({cancelledTickets.length})
                            </h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowCancelledModal(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="modal-body modal-body-tickets">
                            {cancelledTickets.length > 0 ? (
                                <div className="tickets-grid">
                                    {cancelledTickets.map(ticket => (
                                        <div key={ticket.ticketId} className="ticket-card cancelled">
                                            <div className="ticket-header">
                                                <FaTicketAlt className="ticket-icon" />
                                                <span className={`ticket-status ${getStatusInfo(ticket.status).class}`}>
                                                    {getStatusInfo(ticket.status).icon}
                                                    {getStatusInfo(ticket.status).text}
                                                </span>
                                            </div>
                                            
                                            <h3 className="ticket-event-name">{ticket.eventName}</h3>
                                            <div className="ticket-id">Mã vé: {ticket.ticketCode || ticket.ticketId}</div>
                                            <div className="ticket-id">Số ghế: {ticket.seatNumber}</div>
                                            
                                            <div className="ticket-details">
                                                <div className="detail-row">
                                                    <FaCalendar className="detail-icon" />
                                                    <span>{formatDate(ticket.startDay)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-tickets">
                                    <FaTicketAlt className="no-tickets-icon" />
                                    <p>Không có vé đã hủy</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="btn-close-modal" 
                                onClick={() => setShowCancelledModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentTicketsPage;
