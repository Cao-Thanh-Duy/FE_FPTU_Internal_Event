import React, { useState, useEffect } from "react";
import "../assets/css/StudentEventPage.css";
import SidebarStudent from "../components/SidebarStudent";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaSearch, FaTicketAlt, FaTimes } from 'react-icons/fa';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';
import axios from 'axios';

const StudentEventPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketQRCode, setTicketQRCode] = useState("");
    const [bookedEvents, setBookedEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSpeakerModal, setShowSpeakerModal] = useState(false);
    const [selectedSpeaker, setSelectedSpeaker] = useState(null);
    
    // Fetch events from API
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://localhost:7047/api/Event');
            
            if (response.data.success) {
                // Chỉ lấy các event có Status = "Approve"
                const approvedEvents = response.data.data.filter(
                    event => event.status === "Approve"
                );
                console.log('Approved events from API:', approvedEvents);
                setEvents(approvedEvents);
            } else {
                toast.error('Không thể tải danh sách sự kiện');
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Có lỗi xảy ra khi tải sự kiện');
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(event =>
        event.eventName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generateTicketQR = async (event, ticketId) => {
        try {
            // Tạo mã QR với thông tin vé
            const userId = localStorage.getItem('userId');
            const ticketData = {
                eventId: event.eventId,
                eventName: event.eventName,
                studentId: userId,
                bookingDate: new Date().toISOString(),
                ticketId: ticketId
            };
            
            const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(ticketData), {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
            
            setTicketQRCode(qrCodeDataUrl);
            setSelectedEvent(event);
            setShowTicketModal(true);
            
            // Thêm vào danh sách đã đặt
            if (!bookedEvents.includes(event.eventId)) {
                setBookedEvents([...bookedEvents, event.eventId]);
            }
            
            toast.success('Đặt vé thành công!', {
                position: "top-right",
                autoClose: 2000,
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            toast.error('Có lỗi xảy ra khi tạo vé!');
        }
    };

    const handleBookTicket = async (event) => {
        const availableSeats = getAvailableSeats(event);
        if (availableSeats > 0) {
            try {
                const userId = parseInt(localStorage.getItem('userId'));
                const response = await axios.post('https://localhost:7047/api/Ticket', {
                    userId: userId,
                    eventId: event.eventId
                });

                if (response.data.success) {
                    // Lấy ticket ID từ response
                    const ticketId = response.data.data?.ticketId || `TKT-${event.eventId}-${Date.now()}`;
                    await generateTicketQR(event, ticketId);
                    
                    // Cập nhật lại danh sách events để giảm availableSeats
                    fetchEvents();
                } else {
                    toast.error(response.data.message || 'Không thể đặt vé');
                }
            } catch (error) {
                console.error('Error booking ticket:', error);
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt vé!');
            }
        } else {
            toast.warning('Sự kiện đã hết chỗ!');
        }
    };

    const downloadTicket = () => {
        const link = document.createElement('a');
        link.href = ticketQRCode;
        link.download = `ticket-${selectedEvent.eventName.replace(/\s+/g, '-')}.png`;
        link.click();
        toast.success('Đã tải xuống vé!');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            "Approve": { text: "Sắp diễn ra", class: "badge-upcoming" },
            "Pending": { text: "Đang chờ", class: "badge-ongoing" },
            "Reject": { text: "Đã từ chối", class: "badge-completed" }
        };
        return statusMap[status] || { text: "Sắp diễn ra", class: "badge-upcoming" };
    };

    // Format date để hiển thị
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    // Format time range từ slotEvent array
    const formatTimeRange = (slotEvent) => {
        if (!slotEvent || slotEvent.length === 0) return 'Chưa xác định';
        const slot = slotEvent[0]; // Lấy slot đầu tiên
        return `${slot.startTime} - ${slot.endTime}`;
    };

    // Lấy slot name
    const getSlotName = (slotEvent) => {
        if (!slotEvent || slotEvent.length === 0) return '';
        return slotEvent[0].slotName;
    };

    // Lấy số vé còn lại (currentTickerCount là số vé còn lại, giảm dần khi có người đặt)
    const getAvailableSeats = (event) => {
        return event.currentTickerCount;
    };

    const handleViewSpeaker = (speaker) => {
        setSelectedSpeaker(speaker);
        setShowSpeakerModal(true);
    };

    return (
        <div className="student-event-page">
            <SidebarStudent />
            
            <div className="event-main">
                <div className="event-content">
                    <div className="page-header">
                        <div>
                            <h1>Sự kiện sắp diễn ra</h1>
                            <p>Khám phá và đăng ký tham gia các sự kiện tại FPT University</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="search-section">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sự kiện..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {/* Events List */}
                    <div className="events-grid">
                        {loading ? (
                            <div className="loading-message">
                                <p>Đang tải danh sách sự kiện...</p>
                            </div>
                        ) : filteredEvents.length > 0 ? (
                            filteredEvents.map(event => {
                                const availableSeats = getAvailableSeats(event);
                                return (
                                    <div key={event.eventId} className="event-card">
                                        <div className="event-card-header">
                                            <h3>{event.eventName}</h3>
                                            <span className={`status-badge ${getStatusBadge(event.status).class}`}>
                                                {getStatusBadge(event.status).text}
                                            </span>
                                        </div>
                                        
                                        <p className="event-description">{event.eventDescription}</p>
                                        {event.speakerEvent && event.speakerEvent.length > 0 && (
                                            <p className="event-organizer">
                                                Diễn giả: 
                                                {event.speakerEvent.map((speaker, index) => (
                                                    <span key={index}>
                                                        {index > 0 && ', '}
                                                        <strong 
                                                            className="speaker-name-link"
                                                            onClick={() => handleViewSpeaker(speaker)}
                                                            title="Click để xem thông tin diễn giả"
                                                        >
                                                            {speaker.speakerName}
                                                        </strong>
                                                    </span>
                                                ))}
                                            </p>
                                        )}
                                        
                                        <div className="event-details">
                                            <div className="detail-item">
                                                <FaCalendar className="detail-icon" />
                                                <span>{formatDate(event.eventDay)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <FaClock className="detail-icon" />
                                                <span>{getSlotName(event.slotEvent)} ({formatTimeRange(event.slotEvent)})</span>
                                            </div>
                                            <div className="detail-item">
                                                <FaMapMarkerAlt className="detail-icon" />
                                                <span>{event.venueName || 'Chưa xác định'} - {event.locationDetails || ''}</span>
                                            </div>
                                            <div className="detail-item">
                                                <FaUsers className="detail-icon" />
                                                <span>{event.currentTickerCount}/{event.maxTickerCount} vé còn lại</span>
                                            </div>
                                        </div>

                                        <div className="event-actions">
                                            {bookedEvents.includes(event.eventId) ? (
                                                <button 
                                                    className="btn-booked"
                                                    disabled
                                                >
                                                    <FaTicketAlt /> Đã đặt vé
                                                </button>
                                            ) : (
                                                <button 
                                                    className="btn-book"
                                                    onClick={() => {
                                                        console.log('Booking ticket for event:', event);
                                                        handleBookTicket(event);
                                                    }}
                                                    disabled={availableSeats <= 0}
                                                >
                                                    <FaTicketAlt /> {availableSeats > 0 ? 'Đặt vé ngay' : 'Hết chỗ'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-events">
                                <p>Không tìm thấy sự kiện nào phù hợp</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Speaker Modal */}
            {showSpeakerModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowSpeakerModal(false);
                    setSelectedSpeaker(null);
                }}>
                    <div className="modal-content speaker-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Thông tin diễn giả</h2>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowSpeakerModal(false);
                                    setSelectedSpeaker(null);
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            {selectedSpeaker ? (
                                <div className="speaker-details">
                                    <h3 className="speaker-name">{selectedSpeaker.speakerName}</h3>
                                    <div className="speaker-description">
                                        <p>{selectedSpeaker.speakerDescription || selectedSpeaker.speakerDecription || 'Không có thông tin mô tả'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-data">
                                    <p>Không có thông tin</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="btn-close" 
                                onClick={() => {
                                    setShowSpeakerModal(false);
                                    setSelectedSpeaker(null);
                                }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Modal */}
            {showTicketModal && (
                <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Vé tham gia sự kiện</h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowTicketModal(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="ticket-container">
                                <div className="ticket-info">
                                    <h3>{selectedEvent?.eventName}</h3>
                                    <div className="ticket-details">
                                        <p><FaCalendar /> <strong>Ngày:</strong> {formatDate(selectedEvent?.eventDay)}</p>
                                        <p><FaClock /> <strong>Thời gian:</strong> {formatTimeRange(selectedEvent?.slotEvent)}</p>
                                        <p><FaMapMarkerAlt /> <strong>Địa điểm:</strong> {selectedEvent?.venueName} - {selectedEvent?.locationDetails}</p>
                                    </div>
                                </div>
                                
                                <div className="ticket-qr">
                                    <img src={ticketQRCode} alt="QR Code" />
                                    <p className="qr-instruction">Vui lòng xuất trình mã QR này khi tham gia sự kiện</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button className="btn-download" onClick={downloadTicket}>
                                Tải xuống vé
                            </button>
                            <button className="btn-close" onClick={() => setShowTicketModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentEventPage;
