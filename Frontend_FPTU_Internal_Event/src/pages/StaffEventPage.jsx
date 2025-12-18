import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/css/StaffEventPage.css";
import SidebarStaff from "../components/SidebarStaff";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaSearch, FaTimes, FaUserFriends } from 'react-icons/fa';
import { getUserInfo } from "../utils/auth";

const StaffEventPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);
    const [attendeesData, setAttendeesData] = useState(null);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    
    // Lấy events từ API
    useEffect(() => {
        fetchStaffEvents();
    }, []);

    const fetchStaffEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const { userId, token } = getUserInfo();
            
            if (!userId || !token) {
                setError("Không tìm thấy thông tin đăng nhập");
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `https://localhost:7047/api/Event/staff-events?userId=${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'accept': '*/*'
                    }
                }
            );

            if (response.data.success && response.data.data) {
                // Lọc và map dữ liệu từ API sang format của component
                // Chỉ hiển thị events có status = "Approve"
                const mappedEvents = response.data.data
                    .filter(event => event.status === "Approve")
                    .map(event => {
                    // Lấy thông tin slot để hiển thị thời gian
                    const timeSlots = event.slotEvent.map(slot => 
                        `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`
                    ).join(', ');

                    // Map status
                    let status = 'upcoming';
                    if (event.status === 'Completed') {
                        status = 'completed';
                    } else if (event.status === 'Ongoing') {
                        status = 'ongoing';
                    }

                    return {
                        id: event.eventId,
                        name: event.eventName,
                        date: event.eventDay,
                        time: timeSlots || "Chưa có thời gian",
                        venue: `${event.venueName} - ${event.locationDetails}`,
                        participants: event.currentTickerCount,
                        maxParticipants: event.maxTickerCount,
                        status: status,
                        description: event.eventDescription,
                        slotEvent: event.slotEvent,
                        speakerEvent: event.speakerEvent
                    };
                });

                setEvents(mappedEvents);
            }
        } catch (err) {
            console.error("Error fetching staff events:", err);
            setError(err.response?.data?.message || "Không thể tải danh sách sự kiện");
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        const statusMap = {
            upcoming: { text: "Sắp diễn ra", class: "badge-upcoming" },
            ongoing: { text: "Đang diễn ra", class: "badge-ongoing" },
            completed: { text: "Đã hoàn thành", class: "badge-completed" }
        };
        return statusMap[status] || statusMap.upcoming;
    };

    const handleViewAttendees = async (eventId) => {
        try {
            setLoadingAttendees(true);
            setShowAttendeesModal(true);
            
            const response = await axios.get(`https://localhost:7047/api/Ticket/event/${eventId}/attendees`);
            const data = response.data?.data ?? response.data;
            
            setAttendeesData(data);
        } catch (error) {
            console.error('Error fetching attendees:', error);
            alert('Không thể tải danh sách người tham gia');
            setShowAttendeesModal(false);
        } finally {
            setLoadingAttendees(false);
        }
    };

    return (
        <div className="staff-event-page">
            <SidebarStaff />
            
            <div className="event-main">
                <div className="event-content">
                    <div className="page-header">
                        <div>
                            <h1>Quản lý Events</h1>
                            <p>Danh sách các sự kiện được phân công</p>
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

                    {/* Loading State */}
                    {loading && (
                        <div className="loading-message">
                            <p>Đang tải danh sách sự kiện...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="error-message">
                            <p>❌ {error}</p>
                            <button onClick={fetchStaffEvents} className="btn-retry">
                                Thử lại
                            </button>
                        </div>
                    )}

                    {/* Events List */}
                    {!loading && !error && (
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
                                            <span>{event.participants}/{event.maxParticipants} người tham gia</span>
                                        </div>
                                    </div>
                                    
                                    <div className="event-actions">
                                        <button className="btn-view" onClick={() => handleViewAttendees(event.id)}>Xem người tham gia</button>
                                        <button className="btn-checkin" onClick={() => navigate('/staff/qr-scanner')}>Check-in</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && !error && filteredEvents.length === 0 && (
                        <div className="no-results">
                            <p>Không tìm thấy sự kiện nào</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Attendees Modal */}
            {showAttendeesModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowAttendeesModal(false);
                    setAttendeesData(null);
                }}>
                    <div className="modal-content attendees-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaUserFriends /> Danh sách người tham gia
                            </h2>
                            <button className="btn-close-modal" onClick={() => {
                                setShowAttendeesModal(false);
                                setAttendeesData(null);
                            }}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingAttendees ? (
                                <div className="loading-attendees">
                                    <p>Đang tải danh sách...</p>
                                </div>
                            ) : attendeesData ? (
                                <>
                                    <div className="attendees-summary">
                                        <h3>{attendeesData.eventName}</h3>
                                        <p className="total-count">
                                            Tổng số người tham gia: <strong>{attendeesData.totalAttendees}</strong>
                                        </p>
                                    </div>
                                    {attendeesData.attendees && attendeesData.attendees.length > 0 ? (
                                        <div className="attendees-list">
                                            {attendeesData.attendees.map((attendee, index) => (
                                                <div key={attendee.ticketId || index} className="attendee-item">
                                                    <div className="attendee-number">{index + 1}</div>
                                                    <div className="attendee-info">
                                                        <div className="attendee-name">
                                                            {attendee.userName}
                                                            {attendee.seatNumber && (
                                                                <span className="seat-number-badge">
                                                                    Ghế {attendee.seatNumber}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="attendee-email">{attendee.email}</div>
                                                        {attendee.status && (
                                                            <div className="attendee-status">
                                                                <span className={`ticket-status-badge ${attendee.status === 'Used' ? 'status-used' : attendee.status === 'Not Used' ? 'status-not-used' : 'status-cancelled'}`}>
                                                                    {attendee.status === 'Used' ? '✓ Đã sử dụng' : attendee.status === 'Not Used' ? '○ Chưa sử dụng' : '✕ Đã hủy'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-attendees">
                                            <p>Chưa có người tham gia</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="no-data">
                                    <p>Không có dữ liệu</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffEventPage;
