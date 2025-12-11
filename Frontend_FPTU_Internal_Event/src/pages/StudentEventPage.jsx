import React, { useState } from "react";
import "../assets/css/StudentEventPage.css";
import SidebarStudent from "../components/SidebarStudent";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaSearch, FaTicketAlt, FaTimes } from 'react-icons/fa';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';

const StudentEventPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketQRCode, setTicketQRCode] = useState("");
    const [bookedEvents, setBookedEvents] = useState([]);
    
    // Mock data - sẽ thay bằng API sau
    const events = [
        {
            id: 1,
            name: "Workshop ReactJS 2024",
            date: "2024-12-15",
            time: "14:00 - 16:00",
            venue: "Phòng A101",
            availableSeats: 30,
            totalSeats: 50,
            status: "upcoming",
            description: "Workshop về ReactJS cơ bản và nâng cao cho sinh viên",
            organizer: "CLB Lập trình FPT"
        },
        {
            id: 2,
            name: "Hội thảo AI và Machine Learning",
            date: "2024-12-20",
            time: "09:00 - 11:30",
            venue: "Hội trường A",
            availableSeats: 80,
            totalSeats: 120,
            status: "upcoming",
            description: "Hội thảo về xu hướng AI và ML trong năm 2024",
            organizer: "Khoa CNTT"
        },
        {
            id: 3,
            name: "Ngày hội Sinh viên",
            date: "2024-12-22",
            time: "08:00 - 17:00",
            venue: "Sân vận động",
            availableSeats: 200,
            totalSeats: 300,
            status: "upcoming",
            description: "Ngày hội văn hóa sinh viên FPTU với nhiều hoạt động thú vị",
            organizer: "Đoàn thanh niên"
        },
        {
            id: 4,
            name: "Hackathon 2024",
            date: "2024-12-25",
            time: "08:00 - 20:00",
            venue: "Toà nhà A",
            availableSeats: 40,
            totalSeats: 60,
            status: "upcoming",
            description: "Cuộc thi lập trình 12 tiếng cho sinh viên FPTU",
            organizer: "CLB Lập trình"
        }
    ];

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generateTicketQR = async (event) => {
        try {
            // Tạo mã QR với thông tin vé
            const ticketData = {
                eventId: event.id,
                eventName: event.name,
                studentId: "SV001", // Sẽ lấy từ user info
                bookingDate: new Date().toISOString(),
                ticketId: `TKT-${event.id}-${Date.now()}`
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
            if (!bookedEvents.includes(event.id)) {
                setBookedEvents([...bookedEvents, event.id]);
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

    const handleBookTicket = (event) => {
        if (event.availableSeats > 0) {
            generateTicketQR(event);
        } else {
            toast.warning('Sự kiện đã hết chỗ!');
        }
    };

    const downloadTicket = () => {
        const link = document.createElement('a');
        link.href = ticketQRCode;
        link.download = `ticket-${selectedEvent.name.replace(/\s+/g, '-')}.png`;
        link.click();
        toast.success('Đã tải xuống vé!');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            upcoming: { text: "Sắp diễn ra", class: "badge-upcoming" },
            ongoing: { text: "Đang diễn ra", class: "badge-ongoing" },
            completed: { text: "Đã hoàn thành", class: "badge-completed" }
        };
        return statusMap[status] || statusMap.upcoming;
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
                        {filteredEvents.map(event => (
                            <div key={event.id} className="event-card">
                                <div className="event-card-header">
                                    <h3>{event.name}</h3>
                                    <span className={`status-badge ${getStatusBadge(event.status).class}`}>
                                        {getStatusBadge(event.status).text}
                                    </span>
                                </div>
                                
                                <p className="event-description">{event.description}</p>
                                <p className="event-organizer">Tổ chức bởi: <strong>{event.organizer}</strong></p>
                                
                                <div className="event-details">
                                    <div className="detail-item">
                                        <FaCalendar className="detail-icon" />
                                        <span>{event.date}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FaClock className="detail-icon" />
                                        <span>{event.time}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FaMapMarkerAlt className="detail-icon" />
                                        <span>{event.venue}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FaUsers className="detail-icon" />
                                        <span>{event.availableSeats}/{event.totalSeats} chỗ trống</span>
                                    </div>
                                </div>

                                <div className="event-actions">
                                    {bookedEvents.includes(event.id) ? (
                                        <button 
                                            className="btn-booked"
                                            disabled
                                        >
                                            <FaTicketAlt /> Đã đặt vé
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn-book"
                                            onClick={() => handleBookTicket(event)}
                                            disabled={event.availableSeats === 0}
                                        >
                                            <FaTicketAlt /> {event.availableSeats > 0 ? 'Đặt vé ngay' : 'Hết chỗ'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredEvents.length === 0 && (
                        <div className="no-events">
                            <p>Không tìm thấy sự kiện nào phù hợp</p>
                        </div>
                    )}
                </div>
            </div>

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
                                    <h3>{selectedEvent.name}</h3>
                                    <div className="ticket-details">
                                        <p><FaCalendar /> <strong>Ngày:</strong> {selectedEvent.date}</p>
                                        <p><FaClock /> <strong>Thời gian:</strong> {selectedEvent.time}</p>
                                        <p><FaMapMarkerAlt /> <strong>Địa điểm:</strong> {selectedEvent.venue}</p>
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
