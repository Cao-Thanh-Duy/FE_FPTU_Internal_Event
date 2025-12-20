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
                toast.error('Unable to load tickets');
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('An error occurred while loading tickets');
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
                toast.error('Unable to load QR code');
            }
        } catch (error) {
            console.error('Error fetching QR code:', error);
            toast.error('An error occurred while loading QR code');
        }
    };

    const handleDownloadTicket = async (ticket) => {
        try {
            if (!qrCode) {
                const response = await axios.get(`https://localhost:7047/getQR?ticketId=${ticket.ticketId}`);
                if (response.data.success) {
                    downloadQRImage(response.data.qrcode, ticket);
                } else {
                    toast.error('Unable to load QR code');
                }
            } else {
                downloadQRImage(qrCode, ticket);
            }
        } catch (error) {
            console.error('Error downloading ticket:', error);
            toast.error('An error occurred while downloading ticket');
        }
    };

    const downloadQRImage = (qrCodeData, ticket) => {
        const link = document.createElement('a');
        link.href = qrCodeData;
        link.download = `ticket-${ticket.ticketCode || ticket.ticketId}.png`;
        link.click();
        toast.success('Ticket downloaded!', {
            position: "top-right",
            autoClose: 2000,
        });
    };

    const handleCancelTicket = async (ticket) => {
        if (window.confirm(`Are you sure you want to cancel the ticket for event "${ticket.eventName}"?`)) {
            try {
                const response = await axios.put(`https://localhost:7047/Cancelled?ticketId=${ticket.ticketId}`);
                
                if (response.data.success) {
                    toast.success('Ticket cancelled successfully!', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    // Refresh tickets list
                    fetchTickets();
                } else {
                    toast.error(response.data.message || 'Unable to cancel ticket');
                }
            } catch (error) {
                console.error('Error cancelling ticket:', error);
                toast.error(error.response?.data?.message || 'An error occurred while cancelling ticket');
            }
        }
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            "Not Used": { text: "Confirmed", class: "status-confirmed", icon: <FaCheckCircle /> },
            "Used": { text: "Used", class: "status-used", icon: <FaCheckCircle /> },
            "Checked": { text: "Checked In", class: "status-checked", icon: <FaCheckCircle /> },
            "Cancelled": { text: "Cancelled", class: "status-cancelled", icon: <FaTimes /> }
        };
        return statusMap[status] || statusMap["Not Used"];
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const upcomingTickets = myTickets.filter(ticket => {
        if (ticket.status !== 'Not Used') return false;
        
        // Lọc theo ngày: chỉ hiển thị ticket từ ngày hiện tại trở đi
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ticketDate = new Date(ticket.startDay);
        ticketDate.setHours(0, 0, 0, 0);
        
        return ticketDate >= today;
    });
    
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
                            <h1>My Tickets</h1>
                            <p>Manage your registered event tickets</p>
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
                            <div className="stat-label">Upcoming</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">{checkedTickets.length}</div>
                            <div className="stat-label">Attended</div>
                        </div>
                    </div>

                    {/* Upcoming Tickets */}
                    {loading ? (
                        <div className="loading-message">
                            <p>Loading tickets...</p>
                        </div>
                    ) : upcomingTickets.length > 0 ? (
                        <div className="tickets-section">
                            <h2 className="section-title">Upcoming Tickets</h2>
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
                                        <div className="ticket-id">Ticket Code: {ticket.ticketCode || ticket.ticketId}</div>
                                        <div className="ticket-id">Seat Number: {ticket.seatNumber}</div>
                                        
                                        <div className="ticket-details">
                                            <div className="detail-row">
                                                <FaCalendar className="detail-icon" />
                                                <span>{formatDate(ticket.startDay)}</span>
                                            </div>
                                            {ticket.slots && ticket.slots.length > 0 && (
                                                <div className="detail-row">
                                                    <FaClock className="detail-icon" />
                                                    <div className="slots-info">
                                                        {ticket.slots.map((slot, index) => (
                                                            <div key={index} className="slot-detail">
                                                                <span className="slot-name">{slot.slotName}:</span>
                                                                <span className="slot-time"> {slot.startTime} - {slot.endTime}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ticket-actions">
                                            <button 
                                                className="btn-show-qr"
                                                onClick={() => handleShowQR(ticket)}
                                            >
                                                <FaQrcode /> View QR
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
                                                <FaTimes /> Cancel
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
                            <h2 className="section-title">Attended</h2>
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
                                        <div className="ticket-id">Ticket Code: {ticket.ticketCode || ticket.ticketId}</div>
                                        <div className="ticket-id">Seat Number: {ticket.seatNumber}</div>
                                        
                                        <div className="ticket-details">
                                            <div className="detail-row">
                                                <FaCalendar className="detail-icon" />
                                                <span>{formatDate(ticket.startDay)}</span>
                                            </div>
                                            {ticket.slots && ticket.slots.length > 0 && (
                                                <div className="detail-row">
                                                    <FaClock className="detail-icon" />
                                                    <div className="slots-info">
                                                        {ticket.slots.map((slot, index) => (
                                                            <div key={index} className="slot-detail">
                                                                <span className="slot-name">{slot.slotName}:</span>
                                                                <span className="slot-time">{slot.startTime} - {slot.endTime}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && myTickets.length === 0 && (
                        <div className="no-tickets">
                            <FaTicketAlt className="no-tickets-icon" />
                            <p>You have no tickets yet</p>
                            <p className="no-tickets-hint">Register for exciting events!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* QR Code Modal */}
            {showQRModal && selectedTicket && (
                <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Event Ticket</h2>
                        </div>
                        
                        <div className="modal-body">
                            <div className="qr-ticket-container">
                                <div className="qr-ticket-info">
                                    <h3>{selectedTicket.eventName}</h3>
                                    <div className="qr-ticket-details">
                                        <p><strong>Ticket Code:</strong> {selectedTicket.ticketCode || selectedTicket.ticketId}</p>
                                        <p><strong>Seat Number:</strong> {selectedTicket.seatNumber}</p>
                                        <p><strong>Date:</strong> {formatDate(selectedTicket.startDay)}</p>
                                        {selectedTicket.slots && selectedTicket.slots.length > 0 && (
                                            <div className="ticket-slots">
                                                <strong>Time Slots:</strong>
                                                {selectedTicket.slots.map((slot, index) => (
                                                    <div key={index} className="slot-item">
                                                        <FaClock style={{marginRight: '5px'}} />
                                                        {slot.slotName}: {slot.startTime} - {slot.endTime}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <p><strong>Booked by:</strong> {selectedTicket.userName}</p>
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
                                        Please present this QR code when attending the event
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="btn-download-modal" 
                                onClick={() => handleDownloadTicket(selectedTicket)}
                            >
                                <FaDownload /> Download
                            </button>
                            <button 
                                className="btn-close-modal" 
                                onClick={() => setShowQRModal(false)}
                            >
                                Close
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
                                <FaCheckCircle /> Checked In Tickets ({checkedTickets.length})
                            </h2>
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
                                            <div className="ticket-id">Ticket Code: {ticket.ticketCode || ticket.ticketId}</div>
                                            <div className="ticket-id">Seat Number: {ticket.seatNumber}</div>
                                            
                                            <div className="ticket-details">
                                                <div className="detail-row">
                                                    <FaCalendar className="detail-icon" />
                                                    <span>{formatDate(ticket.startDay)}</span>
                                                </div>
                                                {ticket.slots && ticket.slots.length > 0 && (
                                                    <div className="detail-row">
                                                        <FaClock className="detail-icon" />
                                                        <div className="slots-info">
                                                            {ticket.slots.map((slot, index) => (
                                                                <div key={index} className="slot-detail">
                                                                    <span className="slot-name">{slot.slotName}:</span>
                                                                    <span className="slot-time">{slot.startTime} - {slot.endTime}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ticket-actions">
                                                <button 
                                                    className="btn-show-qr"
                                                    onClick={() => {
                                                        setShowCheckedModal(false);
                                                        handleShowQR(ticket);
                                                    }}
                                                >
                                                    <FaQrcode /> View QR
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
                                    <p>No checked-in tickets</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="btn-close-modal" 
                                onClick={() => setShowCheckedModal(false)}
                            >
                                Close
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
                                <FaTimes /> Cancelled Tickets ({cancelledTickets.length})
                            </h2>
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
                                            <div className="ticket-id">Ticket Code: {ticket.ticketCode || ticket.ticketId}</div>
                                            <div className="ticket-id">Seat Number: {ticket.seatNumber}</div>
                                            
                                            <div className="ticket-details">
                                                <div className="detail-row">
                                                    <FaCalendar className="detail-icon" />
                                                    <span>{formatDate(ticket.startDay)}</span>
                                                </div>
                                                {ticket.slots && ticket.slots.length > 0 && (
                                                    <div className="detail-row">
                                                        <FaClock className="detail-icon" />
                                                        <div className="slots-info">
                                                            {ticket.slots.map((slot, index) => (
                                                                <div key={index} className="slot-detail">
                                                                    <span className="slot-name">{slot.slotName}:</span>
                                                                    <span className="slot-time">{slot.startTime} - {slot.endTime}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-tickets">
                                    <FaTicketAlt className="no-tickets-icon" />
                                    <p>No cancelled tickets</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="btn-close-modal" 
                                onClick={() => setShowCancelledModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentTicketsPage;
