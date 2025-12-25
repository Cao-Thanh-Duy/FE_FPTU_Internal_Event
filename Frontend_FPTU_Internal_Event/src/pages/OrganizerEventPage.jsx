import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarOrganizer from '../components/SidebarOrganizer';
import { FaPlus, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaUsers, FaClock, FaMicrophone, FaInfoCircle, FaEdit, FaUserFriends, FaSortAmountDown, FaSortAmountUp, FaSearch, FaComment } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getUserInfo } from '../utils/auth';
import '../assets/css/OrganizerEventPage.css';

const OrganizerEventPage = () => {
    const navigate = useNavigate();
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);
    const [attendeesData, setAttendeesData] = useState(null);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const [showSpeakerModal, setShowSpeakerModal] = useState(false);
    const [selectedSpeaker, setSelectedSpeaker] = useState(null);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [staffData, setStaffData] = useState(null);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [selectedEventForDescription, setSelectedEventForDescription] = useState(null);
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
    const [sortOrder, setSortOrder] = useState('nearest'); // nearest, farthest
    const [searchTerm, setSearchTerm] = useState('');
    const [attendeesFilter, setAttendeesFilter] = useState('Not Used'); // 'Not Used', 'Checked', 'Cancelled'

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        setLoading(true);
        try {
            const userInfo = getUserInfo();
            
            // ✅ FIXED: Backend expects organizerId as query parameter
            const response = await axios.get('https://localhost:7047/api/Event/my-events', {
                params: {
                    organizerId: parseInt(userInfo.userId)
                }
            });
            
            const data = response.data?. data ??  response.data;
            
            if (Array.isArray(data)) {
                // Sort events by eventDay (earliest first)
                const sortedEvents = data.sort((a, b) => new Date(a.eventDay) - new Date(b.eventDay));
                setMyEvents(sortedEvents);
                
                toast.success(`Loaded ${sortedEvents.length} events successfully!`, {
                    position: 'top-right',
                    autoClose: 2000
                });
            } else {
                setMyEvents([]);
            }
        } catch (error) {
            console.error('Error fetching my events:', error);
            console.error('Error response:', error.response?.data);
            
            toast.error('Failed to fetch your events', {
                position: 'top-right',
                autoClose:  3000
            });
            setMyEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditEvent = (event) => {
        // Navigate to update page with event ID
        navigate('/organizer/update-event', { state: { eventId: event.eventId } });
    };

    const handleViewAttendees = async (eventId) => {
        try {
            setLoadingAttendees(true);
            setShowAttendeesModal(true);
            setAttendeesFilter('Not Used'); // Reset filter về Not Used
            
            // ✅ CORRECT: This API endpoint is already correct
            const response = await axios.get(`https://localhost:7047/api/Ticket/event/${eventId}/attendees`);
            const data = response.data?.data ?? response.data;
            
            setAttendeesData(data);
            
            if (data?. totalAttendees === 0) {
                toast.info('No attendees found for this event. ', {
                    position: 'top-right',
                    autoClose: 2000
                });
            } else {
                toast.success(`Loaded ${data?. totalAttendees || 0} attendees`, {
                    position: 'top-right',
                    autoClose: 2000
                });
            }
        } catch (error) {
            console.error('Error fetching attendees:', error);
            console.error('Error response:', error.response?.data);
            
            toast.error('Failed to load attendees.', {
                position: 'top-right',
                autoClose: 3000
            });
            setShowAttendeesModal(false);
        } finally {
            setLoadingAttendees(false);
        }
    };

    const handleViewSpeaker = (speaker) => {
        setSelectedSpeaker(speaker);
        setShowSpeakerModal(true);
    };

    const closeSpeakerModal = () => {
        setShowSpeakerModal(false);
        setSelectedSpeaker(null);
    };

    const handleViewStaff = async (event) => {
        try {
            setLoadingStaff(true);
            setShowStaffModal(true);
            
            // Lấy danh sách staff từ event.staffEvent
            const staffList = event.staffEvent || [];
            
            setStaffData({
                eventName: event.eventName,
                staffList: staffList
            });
            
            if (staffList.length === 0) {
                toast.info('No staff assigned to this event.', {
                    position: 'top-right',
                    autoClose: 2000
                });
            } else {
                toast.success(`Loaded ${staffList.length} staff members`, {
                    position: 'top-right',
                    autoClose: 2000
                });
            }
        } catch (error) {
            console.error('Error loading staff:', error);
            toast.error('Failed to load staff list.', {
                position: 'top-right',
                autoClose: 3000
            });
            setShowStaffModal(false);
        } finally {
            setLoadingStaff(false);
        }
    };

    const handleViewDescription = (event) => {
        setSelectedEventForDescription(event);
        setShowDescriptionModal(true);
    };

    const closeDescriptionModal = () => {
        setShowDescriptionModal(false);
        setSelectedEventForDescription(null);
    };

    const handleViewFeedback = (eventId) => {
        navigate(`/organizer/event-feedback?eventId=${eventId}`);
    };

    return (
        <div className="organizer-event-page">
            <SidebarOrganizer />
            
            <div className="organizer-main-content">
                <div className="organizer-container">
                    <div className="organizer-header">
                        <h1>Event Management</h1>
                        <button className="btn-create-event" onClick={() => navigate('/organizer/create-event')}>
                            <FaPlus /> Create New Event
                        </button>
                    </div>

                    <div className="filter-toolbar">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search events by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="toolbar-right">
                            <button 
                                className="sort-btn"
                                onClick={() => setSortOrder(sortOrder === 'nearest' ? 'farthest' : 'nearest')}
                                title={sortOrder === 'nearest' ? 'Sort: Nearest first' : 'Sort: Farthest first'}
                            >
                                {sortOrder === 'nearest' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                                {sortOrder === 'nearest' ? 'Nearest First' : 'Farthest First'}
                            </button>
                            <div className="filter-buttons">
                                <button 
                                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('all')}
                                >
                                    All Events
                                </button>
                                <button 
                                    className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('pending')}
                                >
                                    Pending
                                </button>
                                <button 
                                    className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('approved')}
                                >
                                    Approved
                                </button>
                                <button 
                                    className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('rejected')}
                                >
                                    Rejected
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <p>Loading your events...</p>
                        </div>
                    ) : myEvents.length === 0 ?  (
                        <div className="welcome-card">
                            <FaCalendarAlt className="welcome-icon" />
                            <h2>Welcome to Event Management</h2>
                            <p>You haven't created any events yet. Click "Create New Event" to get started. </p>
                        </div>
                    ) : (() => {
                        const filteredEvents = myEvents.filter(event => {
                            // Filter by search term
                            const matchesSearch = event.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                event.eventDescription?.toLowerCase().includes(searchTerm.toLowerCase());
                            
                            if (!matchesSearch) return false;
                            
                            // Filter by status
                            if (filterStatus === 'all') return true;
                            if (filterStatus === 'pending') return event.status === 'Pending';
                            if (filterStatus === 'approved') return event.status === 'Approve' || event.status === 'Approved';
                            if (filterStatus === 'rejected') return event.status === 'Reject' || event.status === 'Rejected';
                            return true;
                        }).sort((a, b) => {
                            const dateA = new Date(a.eventDay);
                            const dateB = new Date(b.eventDay);
                            return sortOrder === 'nearest' ? dateA - dateB : dateB - dateA;
                        });

                        return filteredEvents. length === 0 ? (
                            <div className="no-events-found">
                                <FaInfoCircle className="no-events-icon" />
                                <p>No events found with status:  {filterStatus === 'all' ? 'All' : filterStatus. charAt(0).toUpperCase() + filterStatus.slice(1)}</p>
                            </div>
                        ) : (
                        <div className="events-grid">
                            {filteredEvents. map(event => (
                                <div key={event.eventId} className="event-card">
                                    <div className="event-card-header">
                                        <h3>{event.eventName}</h3>
                                        <div className="event-header-actions">
                                            <span className={`event-status ${
                                                event.status === 'Approve' || event.status === 'Approved' ? 'active' : 
                                                event.status === 'Pending' ? 'pending' : 
                                                'inactive'
                                            }`}>
                                                {event.status || 'Pending'}
                                            </span>
                                            {(event.status === 'Pending' || event.status === 'Approve' || event.status === 'Approved') && (
                                                <button className="btn-edit-event" onClick={() => handleEditEvent(event)}>
                                                    <FaEdit /> Edit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="event-card-body">
                                        <div className="event-description-wrapper">
                                            <p className="event-description">
                                                {event.eventDescription && event.eventDescription.length > 80
                                                    ? event.eventDescription.substring(0, 80) + '...'
                                                    : event.eventDescription}
                                            </p>
                                            {event.eventDescription && event.eventDescription.length > 80 && (
                                                <button 
                                                    className="btn-view-full-description"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDescription(event);
                                                    }}
                                                >
                                                    <FaInfoCircle /> View Full
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="event-info">
                                            <div className="info-item">
                                                <FaCalendarAlt className="info-icon" />
                                                <span>
                                                    {new Date(event.eventDay).toLocaleDateString('vi-VN')}
                                                    {event.slotEvent && event.slotEvent.length > 0 && (() => {
                                                        const startTimes = event.slotEvent.map(slot => slot.startTime);
                                                        const endTimes = event.slotEvent.map(slot => slot.endTime);
                                                        const earliestStart = startTimes.sort()[0];
                                                        const latestEnd = endTimes.sort().reverse()[0];
                                                        return (
                                                            <span className="slot-inline">
                                                                {earliestStart} - {latestEnd}
                                                            </span>
                                                        );
                                                    })()}
                                                </span>
                                            </div>
                                            
                                            <div className="info-item">
                                                <FaMapMarkerAlt className="info-icon" />
                                                <div className="info-details">
                                                    <span className="info-main">{event.venueName || 'N/A'}</span>
                                                    {event.locationDetails && (
                                                        <span className="info-sub">{event.locationDetails}</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="info-item">
                                                <FaTicketAlt className="info-icon" />
                                                <span>{(event.maxTickerCount - (event.currentTickerCount || 0))} / {event.maxTickerCount} tickets booked</span>
                                            </div>
                                            
                                            {event.speakerEvent && event.speakerEvent.length > 0 && (
                                                <div className="info-section">
                                                    <div className="section-header">
                                                        <FaMicrophone className="info-icon" />
                                                        <span className="section-title">Speakers:</span>
                                                    </div>
                                                    <div className="section-content">
                                                        {event. speakerEvent.map((speaker, index) => (
                                                            <div key={index} className="speaker-item">
                                                                <FaMicrophone style={{ color: '#f59e0b', fontSize: '0.75rem' }} />
                                                                <span 
                                                                    className="speaker-name clickable"
                                                                    onClick={() => handleViewSpeaker(speaker)}
                                                                >
                                                                    {speaker.speakerName}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {(event.status === 'Approve' || event.status === 'Approved') && (
                                        <div className="event-card-footer">
                                            <button className="btn-view-attendees" onClick={() => handleViewAttendees(event.eventId)}>
                                                <FaUserFriends /> View Attendees ({event.maxTickerCount - (event.currentTickerCount || 0)})
                                            </button>
                                            <button className="btn-view-feedback" onClick={() => handleViewFeedback(event.eventId)}>
                                                <FaComment /> View Feedback
                                            </button>
                                            <button className="btn-view-staff" onClick={() => handleViewStaff(event)}>
                                                <FaUsers /> View Staff ({event.staffEvent?.length || 0})
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        );
                    })()}
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
                            <button className="btn-close" onClick={() => {
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

            {/* Speaker Modal */}
            {showSpeakerModal && selectedSpeaker && (
                <div className="modal-overlay" onClick={closeSpeakerModal}>
                    <div className="modal-content speaker-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaMicrophone /> Speaker Information
                            </h2>
                            <button className="btn-close" onClick={closeSpeakerModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <h3>{selectedSpeaker.speakerName}</h3>
                            <p>{selectedSpeaker.speakerDescription || 'No description available.'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Description Modal */}
            {showDescriptionModal && selectedEventForDescription && (
                <div className="modal-overlay" onClick={closeDescriptionModal}>
                    <div className="modal-content description-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaInfoCircle /> Event Description
                            </h2>
                            <button className="btn-close" onClick={closeDescriptionModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <h3>{selectedEventForDescription.eventName}</h3>
                            <div className="full-description">
                                <p>{selectedEventForDescription.eventDescription}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Staff Modal */}
            {showStaffModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowStaffModal(false);
                    setStaffData(null);
                }}>
                    <div className="modal-content staff-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaUsers /> Staff List
                            </h2>
                            <button className="btn-close" onClick={() => {
                                setShowStaffModal(false);
                                setStaffData(null);
                            }}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingStaff ? (
                                <div className="loading-staff">
                                    <p>Loading staff list...</p>
                                </div>
                            ) : staffData ? (
                                <>
                                    <div className="staff-summary">
                                        <h3>{staffData.eventName}</h3>
                                        <p className="total-count">
                                            Total staff: <strong>{staffData.staffList?.length || 0}</strong>
                                        </p>
                                    </div>
                                    {staffData.staffList && staffData.staffList.length > 0 ? (
                                        <div className="staff-list">
                                            {staffData.staffList.map((staff, index) => (
                                                <div key={staff.userId || index} className="staff-item">
                                                    <div className="staff-number">{index + 1}</div>
                                                    <div className="staff-info">
                                                        <div className="staff-name">{staff.userName}</div>
                                                        <div className="staff-email">{staff.email || 'No email'}</div>
                                                        <div className="staff-role">
                                                            <span className="role-badge">{staff.roleName || 'Staff'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-staff">
                                            <FaInfoCircle style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                                            <p>No staff assigned to this event yet.</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="no-data">
                                    <p>No data available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizerEventPage;