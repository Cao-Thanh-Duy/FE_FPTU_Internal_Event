import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/css/StaffEventPage.css";
import SidebarStaff from "../components/SidebarStaff";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaSearch, FaTimes, FaUserFriends, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
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
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = gần nhất, 'desc' = xa nhất
    const [attendeesFilter, setAttendeesFilter] = useState('Not Used'); // 'Not Used', 'Checked', 'Cancelled'
    
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
                setError("Login information not found");
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
                        time: timeSlots || "No time specified",
                        venue: `${event.venueName} - ${event.locationDetails}`,
                        participants: event.maxTickerCount - event.currentTickerCount,
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
            setError(err.response?.data?.message || "Unable to load events list");
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(event => {
        // Lọc theo tên event
        const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Lọc theo ngày: chỉ hiển thị event từ ngày hiện tại trở đi
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        const isFutureEvent = eventDate >= today;
        
        return matchesSearch && isFutureEvent;
    }).sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const getStatusBadge = (status) => {
        const statusMap = {
            upcoming: { text: "Upcoming", class: "badge-upcoming" },
            ongoing: { text: "Ongoing", class: "badge-ongoing" },
            completed: { text: "Completed", class: "badge-completed" }
        };
        return statusMap[status] || statusMap.upcoming;
    };

    const handleViewAttendees = async (eventId) => {
        try {
            setLoadingAttendees(true);
            setShowAttendeesModal(true);
            setAttendeesFilter('Not Used'); // Reset filter về Not Used
            
            const response = await axios.get(`https://localhost:7047/api/Ticket/event/${eventId}/attendees`);
            const data = response.data?.data ?? response.data;
            
            setAttendeesData(data);
        } catch (error) {
            console.error('Error fetching attendees:', error);
            alert('Unable to load attendees list');
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
                            <h1>Manage Events</h1>
                            <p>List of assigned events</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="search-section">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <button 
                            className="btn-sort"
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            title={sortOrder === 'asc' ? 'Sort: Nearest first' : 'Sort: Farthest first'}
                        >
                            {sortOrder === 'asc' ? (
                                <>
                                    <FaSortAmountDown /> Nearest First
                                </>
                            ) : (
                                <>
                                    <FaSortAmountUp /> Farthest First
                                </>
                            )}
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="loading-message">
                            <p>Loading events list...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="error-message">
                            <p>❌ {error}</p>
                            <button onClick={fetchStaffEvents} className="btn-retry">
                                Retry
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
                                            <span>{event.participants}/{event.maxParticipants} attendees</span>
                                        </div>
                                    </div>
                                    
                                    <div className="event-actions">
                                        <button className="btn-view" onClick={() => handleViewAttendees(event.id)}>View Attendees</button>
                                        <button className="btn-checkin" onClick={() => navigate('/staff/qr-scanner')}>Check-in</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && !error && filteredEvents.length === 0 && (
                        <div className="no-results">
                            <p>No events found</p>
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
                                <FaUserFriends /> Attendees List
                            </h2>
                            <button className="modal-close" onClick={() => {
                                setShowAttendeesModal(false);
                                setAttendeesData(null);
                            }}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingAttendees ? (
                                <div className="loading-attendees">
                                    <p>Loading list...</p>
                                </div>
                            ) : attendeesData ? (
                                <>
                                    <div className="attendees-summary">
                                        <h3>{attendeesData.eventName}</h3>
                                        <p className="total-count">
                                            Total attendees: <strong>
                                                {attendeesData.attendees ? 
                                                    attendeesData.attendees.filter(a => a.status === 'Checked' || a.status === 'Not Used').length 
                                                    : 0}
                                            </strong>
                                        </p>
                                    </div>
                                    
                                    {/* Filter Buttons */}
                                    <div className="attendees-filter-buttons">
                                        <button 
                                            className={`filter-btn ${attendeesFilter === 'Not Used' ? 'active' : ''}`}
                                            onClick={() => setAttendeesFilter('Not Used')}
                                        >
                                            <span className="filter-icon">○</span>
                                            Not Used
                                            <span className="filter-count">
                                                ({attendeesData.attendees?.filter(a => a.status === 'Not Used').length || 0})
                                            </span>
                                        </button>
                                        <button 
                                            className={`filter-btn ${attendeesFilter === 'Checked' ? 'active' : ''}`}
                                            onClick={() => setAttendeesFilter('Checked')}
                                        >
                                            <span className="filter-icon">✓</span>
                                            Checked
                                            <span className="filter-count">
                                                ({attendeesData.attendees?.filter(a => a.status === 'Checked').length || 0})
                                            </span>
                                        </button>
                                        <button 
                                            className={`filter-btn ${attendeesFilter === 'Cancelled' ? 'active' : ''}`}
                                            onClick={() => setAttendeesFilter('Cancelled')}
                                        >
                                            <span className="filter-icon">✕</span>
                                            Cancelled
                                            <span className="filter-count">
                                                ({attendeesData.attendees?.filter(a => a.status === 'Cancelled').length || 0})
                                            </span>
                                        </button>
                                    </div>

                                    {attendeesData.attendees && attendeesData.attendees.length > 0 ? (
                                        <div className="attendees-section">
                                            <div className="attendees-list">
                                                {attendeesData.attendees
                                                    .filter(a => a.status === attendeesFilter)
                                                    .map((attendee, index) => (
                                                        <div key={attendee.ticketId || index} className="attendee-item">
                                                            <div className="attendee-number">{index + 1}</div>
                                                            <div className="attendee-info">
                                                                <div className="attendee-name">
                                                                    {attendee.userName}
                                                                    {attendee.seatNumber && (
                                                                        <span className="seat-number-badge">
                                                                            Seat {attendee.seatNumber}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="attendee-email">{attendee.email}</div>
                                                                <div className="attendee-status">
                                                                    <span className={`ticket-status-badge status-${attendeesFilter.toLowerCase().replace(' ', '-')}`}>
                                                                        {attendeesFilter === 'Not Used' && '○'}
                                                                        {attendeesFilter === 'Checked' && '✓'}
                                                                        {attendeesFilter === 'Cancelled' && '✕'}
                                                                        {' '}{attendeesFilter}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                            {attendeesData.attendees.filter(a => a.status === attendeesFilter).length === 0 && (
                                                <div className="no-attendees">
                                                    <p>No {attendeesFilter.toLowerCase()} attendees</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="no-attendees">
                                            <p>No attendees yet</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="no-data">
                                    <p>No data</p>
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
