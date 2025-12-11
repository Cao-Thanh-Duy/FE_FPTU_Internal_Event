import React, { useState } from "react";
import "../assets/css/StudentTicketsPage.css";
import SidebarStudent from "../components/SidebarStudent";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaQrcode, FaDownload, FaTimes, FaTicketAlt, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const StudentTicketsPage = () => {
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);

    // Mock data - vé đã đặt
    const myTickets = [
        {
            id: 1,
            ticketId: "TKT-001-2024",
            eventName: "Workshop ReactJS 2024",
            eventDate: "2024-12-15",
            eventTime: "14:00 - 16:00",
            venue: "Phòng A101",
            bookingDate: "2024-12-10 10:30:00",
            status: "confirmed",
            qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" // Mock QR
        },
        {
            id: 2,
            ticketId: "TKT-002-2024",
            eventName: "Hội thảo AI và Machine Learning",
            eventDate: "2024-12-20",
            eventTime: "09:00 - 11:30",
            venue: "Hội trường A",
            bookingDate: "2024-12-11 14:20:00",
            status: "confirmed",
            qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        },
        {
            id: 3,
            ticketId: "TKT-003-2024",
            eventName: "Ngày hội Sinh viên",
            eventDate: "2024-12-22",
            eventTime: "08:00 - 17:00",
            venue: "Sân vận động",
            bookingDate: "2024-12-09 16:45:00",
            status: "confirmed",
            qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        },
        {
            id: 4,
            ticketId: "TKT-004-2024",
            eventName: "Workshop Python cho người mới",
            eventDate: "2024-12-08",
            eventTime: "14:00 - 16:00",
            venue: "Phòng B201",
            bookingDate: "2024-12-05 09:15:00",
            status: "used",
            qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        }
    ];

    const handleShowQR = (ticket) => {
        setSelectedTicket(ticket);
        setShowQRModal(true);
    };

    const handleDownloadTicket = (ticket) => {
        // Mock download - trong thực tế sẽ download QR code
        toast.success('Đã tải xuống vé!', {
            position: "top-right",
            autoClose: 2000,
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            confirmed: { text: "Đã xác nhận", class: "status-confirmed", icon: <FaCheckCircle /> },
            used: { text: "Đã sử dụng", class: "status-used", icon: <FaCheckCircle /> },
            cancelled: { text: "Đã hủy", class: "status-cancelled", icon: <FaTimes /> }
        };
        return statusMap[status] || statusMap.confirmed;
    };

    const upcomingTickets = myTickets.filter(ticket => ticket.status === 'confirmed');
    const usedTickets = myTickets.filter(ticket => ticket.status === 'used');

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
                    </div>

                    {/* Statistics */}
                    <div className="tickets-stats">
                        <div className="stat-box">
                            <div className="stat-number">{upcomingTickets.length}</div>
                            <div className="stat-label">Vé sắp tới</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">{usedTickets.length}</div>
                            <div className="stat-label">Đã tham gia</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">{myTickets.length}</div>
                            <div className="stat-label">Tổng vé</div>
                        </div>
                    </div>

                    {/* Upcoming Tickets */}
                    {upcomingTickets.length > 0 && (
                        <div className="tickets-section">
                            <h2 className="section-title">Vé sắp tới</h2>
                            <div className="tickets-grid">
                                {upcomingTickets.map(ticket => (
                                    <div key={ticket.id} className="ticket-card upcoming">
                                        <div className="ticket-header">
                                            <FaTicketAlt className="ticket-icon" />
                                            <span className={`ticket-status ${getStatusInfo(ticket.status).class}`}>
                                                {getStatusInfo(ticket.status).icon}
                                                {getStatusInfo(ticket.status).text}
                                            </span>
                                        </div>
                                        
                                        <h3 className="ticket-event-name">{ticket.eventName}</h3>
                                        <div className="ticket-id">Mã vé: {ticket.ticketId}</div>
                                        
                                        <div className="ticket-details">
                                            <div className="detail-row">
                                                <FaCalendar className="detail-icon" />
                                                <span>{ticket.eventDate}</span>
                                            </div>
                                            <div className="detail-row">
                                                <FaClock className="detail-icon" />
                                                <span>{ticket.eventTime}</span>
                                            </div>
                                            <div className="detail-row">
                                                <FaMapMarkerAlt className="detail-icon" />
                                                <span>{ticket.venue}</span>
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Used Tickets */}
                    {usedTickets.length > 0 && (
                        <div className="tickets-section">
                            <h2 className="section-title">Đã tham gia</h2>
                            <div className="tickets-grid">
                                {usedTickets.map(ticket => (
                                    <div key={ticket.id} className="ticket-card used">
                                        <div className="ticket-header">
                                            <FaTicketAlt className="ticket-icon" />
                                            <span className={`ticket-status ${getStatusInfo(ticket.status).class}`}>
                                                {getStatusInfo(ticket.status).icon}
                                                {getStatusInfo(ticket.status).text}
                                            </span>
                                        </div>
                                        
                                        <h3 className="ticket-event-name">{ticket.eventName}</h3>
                                        <div className="ticket-id">Mã vé: {ticket.ticketId}</div>
                                        
                                        <div className="ticket-details">
                                            <div className="detail-row">
                                                <FaCalendar className="detail-icon" />
                                                <span>{ticket.eventDate}</span>
                                            </div>
                                            <div className="detail-row">
                                                <FaClock className="detail-icon" />
                                                <span>{ticket.eventTime}</span>
                                            </div>
                                            <div className="detail-row">
                                                <FaMapMarkerAlt className="detail-icon" />
                                                <span>{ticket.venue}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {myTickets.length === 0 && (
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
                                        <p><strong>Mã vé:</strong> {selectedTicket.ticketId}</p>
                                        <p><FaCalendar /> <strong>Ngày:</strong> {selectedTicket.eventDate}</p>
                                        <p><FaClock /> <strong>Giờ:</strong> {selectedTicket.eventTime}</p>
                                        <p><FaMapMarkerAlt /> <strong>Địa điểm:</strong> {selectedTicket.venue}</p>
                                    </div>
                                </div>
                                
                                <div className="qr-code-display">
                                    <div className="qr-code-box">
                                        <FaQrcode className="qr-placeholder" />
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
        </div>
    );
};

export default StudentTicketsPage;
