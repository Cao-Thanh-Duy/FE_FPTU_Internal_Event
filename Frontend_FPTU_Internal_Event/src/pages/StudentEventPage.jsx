import React, { useState, useEffect } from "react";
import "../assets/css/StudentEventPage.css";
import SidebarStudent from "../components/SidebarStudent";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaSearch, FaTicketAlt, FaTimes, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
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
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = gần nhất, 'desc' = xa nhất
    
    // Fetch events from API
    useEffect(() => {
        const loadData = async () => {
            const eventsList = await fetchEvents();
            await fetchUserTickets(eventsList);
        };
        loadData();
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
                return approvedEvents; // Trả về để sử dụng trong fetchUserTickets
            } else {
                toast.error('Unable to load events list');
                return [];
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('An error occurred while loading events');
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchUserTickets = async (eventsList = null) => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;
            
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://localhost:7047/api/Ticket?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                console.log('User tickets response:', response.data.data);
                // Lấy danh sách eventId từ các ticket chưa bị hủy
                const userTickets = response.data.data || [];
                
                // Sử dụng eventsList nếu được truyền vào, nếu không thì dùng events từ state
                const eventsToCheck = eventsList || events;
                
                const bookedEventIds = userTickets
                    .filter(ticket => ticket.status !== 'Cancelled')
                    .map(ticket => {
                        // Thử lấy eventId trực tiếp từ ticket
                        if (ticket.eventId) {
                            return ticket.eventId;
                        }
                        // Nếu không có eventId, tìm event theo eventName
                        const event = eventsToCheck.find(e => e.eventName === ticket.eventName);
                        return event?.eventId;
                    })
                    .filter(eventId => eventId); // Loại bỏ undefined/null
                
                console.log('User booked event IDs:', bookedEventIds);
                setBookedEvents(bookedEventIds);
            }
        } catch (error) {
            console.error('Error fetching user tickets:', error);
        }
    };

    const filteredEvents = events.filter(event => {
        // Lọc theo tên event
        const matchesSearch = event.eventName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Lọc theo ngày: chỉ hiển thị event từ ngày hiện tại trở đi
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set về 00:00:00 để so sánh chính xác
        const eventDate = new Date(event.eventDay);
        eventDate.setHours(0, 0, 0, 0);
        const isFutureEvent = eventDate >= today;
        
        return matchesSearch && isFutureEvent;
    }).sort((a, b) => {
        const dateA = new Date(a.eventDay);
        const dateB = new Date(b.eventDay);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

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
            
            toast.success('Ticket booked successfully!', {
                position: "top-right",
                autoClose: 2000,
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            toast.error('An error occurred while creating ticket!');
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
                    
                    // Cập nhật lại danh sách events và tickets
                    fetchEvents();
                    fetchUserTickets();
                } else {
                    toast.error(response.data.message || 'Unable to book ticket');
                }
            } catch (error) {
                console.error('Error booking ticket:', error);
                toast.error(error.response?.data?.message || 'An error occurred while booking ticket!');
            }
        } else {
            toast.warning('Event is sold out!');
        }
    };

    const downloadTicket = () => {
        const link = document.createElement('a');
        link.href = ticketQRCode;
        link.download = `ticket-${selectedEvent.eventName.replace(/\s+/g, '-')}.png`;
        link.click();
        toast.success('Ticket downloaded!');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            "Approve": { text: "Upcoming", class: "badge-upcoming" },
            "Pending": { text: "Pending", class: "badge-ongoing" },
            "Reject": { text: "Rejected", class: "badge-completed" }
        };
        return statusMap[status] || { text: "Upcoming", class: "badge-upcoming" };
    };

    // Format date để hiển thị
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    // Format time range từ slotEvent array
    const formatTimeRange = (slotEvent) => {
        if (!slotEvent || slotEvent.length === 0) return 'Not specified';
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
                            <h1>Upcoming Events</h1>
                            <p>Discover and register for events at FPT University</p>
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

                    {/* Events List */}
                    <div className="events-grid">
                        {loading ? (
                            <div className="loading-message">
                                <p>Loading events...</p>
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
                                                Speaker: 
                                                {event.speakerEvent.map((speaker, index) => (
                                                    <span key={index}>
                                                        {index > 0 && ', '}
                                                        <strong 
                                                            className="speaker-name-link"
                                                            onClick={() => handleViewSpeaker(speaker)}
                                                            title="Click to view speaker information"
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
                                                <span>{event.venueName || 'Not specified'} - {event.locationDetails || ''}</span>
                                            </div>
                                            <div className="detail-item">
                                                <FaUsers className="detail-icon" />
                                                <span>{event.currentTickerCount}/{event.maxTickerCount} tickets remaining</span>
                                            </div>
                                        </div>

                                        <div className="event-actions">
                                            {bookedEvents.includes(event.eventId) ? (
                                                <button 
                                                    className="btn-booked"
                                                    disabled
                                                >
                                                    <FaTicketAlt /> Booked
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
                                                    <FaTicketAlt /> {availableSeats > 0 ? 'Book Now' : 'Sold Out'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-events">
                                <p>No matching events found</p>
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
                            <h2>Speaker Information</h2>
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
                                        <p>{selectedSpeaker.speakerDescription || selectedSpeaker.speakerDecription || 'No description available'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-data">
                                    <p>No information available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Modal */}
            {showTicketModal && (
                <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Event Ticket</h2>
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
                                        <p><FaCalendar /> <strong>Date:</strong> {formatDate(selectedEvent?.eventDay)}</p>
                                        <p><FaClock /> <strong>Time:</strong> {formatTimeRange(selectedEvent?.slotEvent)}</p>
                                        <p><FaMapMarkerAlt /> <strong>Location:</strong> {selectedEvent?.venueName} - {selectedEvent?.locationDetails}</p>
                                    </div>
                                </div>
                                
                                <div className="ticket-qr">
                                    <img src={ticketQRCode} alt="QR Code" />
                                    <p className="qr-instruction">Please present this QR code when attending the event</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button className="btn-download" onClick={downloadTicket}>
                                Download Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentEventPage;
