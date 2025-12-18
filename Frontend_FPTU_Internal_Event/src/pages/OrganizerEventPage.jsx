import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { FaPlus, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaUsers, FaClock, FaMicrophone, FaInfoCircle, FaEdit, FaUserFriends, FaSortAmountDown, FaSortAmountUp, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getUserInfo } from '../utils/auth';
import '../assets/css/OrganizerEventPage.css';

const OrganizerEventPage = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);
    const [attendeesData, setAttendeesData] = useState(null);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const [showSpeakerModal, setShowSpeakerModal] = useState(false);
    const [selectedSpeaker, setSelectedSpeaker] = useState(null);
    const [venues, setVenues] = useState([]);
    const [slots, setSlots] = useState([]);
    const [users, setUsers] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
    const [sortOrder, setSortOrder] = useState('nearest'); // nearest, farthest
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        eventName: '',
        eventDescription: '',
        eventDay: '', // ✅ FIXED: Changed from eventDate to eventDay
        maxTicketCount: '',
        venueId: '',
        speakerIds: [],
        slotId: '', // ✅ FIXED:  Changed from slotIds array to single slotId
        staffIds: []
    });

    useEffect(() => {
        fetchMyEvents();
        fetchVenues();
        fetchSlots();
        fetchUsers();
        fetchSpeakers();
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

    const fetchVenues = async () => {
        try {
            const response = await axios.get('https://localhost:7047/api/Venue');
            const data = response.data?.data ??  response.data;
            if (Array.isArray(data)) {
                setVenues(data);
            }
        } catch (error) {
            console.error('Error fetching venues:', error);
        }
    };

    const fetchSlots = async () => {
        try {
            const response = await axios.get('https://localhost:7047/api/Slot');
            const data = response.data?.data ?? response.data;
            if (Array.isArray(data)) {
                setSlots(data);
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('https://localhost:7047/api/User');
            const data = response.data?.data ?? response.data;
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchSpeakers = async () => {
        try {
            const response = await axios.get('https://localhost:7047/api/Speaker');
            const data = response. data?.data ?? response.data;
            if (Array.isArray(data)) {
                setSpeakers(data);
            }
        } catch (error) {
            console.error('Error fetching speakers:', error);
        }
    };

    const handleMultiSelect = (fieldName, value) => {
        const currentValues = formData[fieldName];
        const numValue = parseInt(value);
        
        if (currentValues.includes(numValue)) {
            setFormData({
                ...formData,
                [fieldName]: currentValues.filter(id => id !== numValue)
            });
        } else {
            setFormData({
                ...formData,
                [fieldName]:  [...currentValues, numValue]
            });
        }
    };

    const handleSlotSelect = (slotId) => {
        setFormData({
            ...formData,
            slotId: parseInt(slotId)
        });
    };

    const handleEditEvent = async (event) => {
        try {
            setLoading(true);
            
            // Fetch full event details
            const response = await axios.get(`https://localhost:7047/api/Event/${event.eventId}`);
            const eventData = response.data?.data ?? response.data;
            
            console.log('Fetched event data:', eventData);
            
            // Extract IDs from event relationships
            const speakerIds = (eventData.speakerEvent?. map(s => Number(s.speakerId)) || []).filter(id => !isNaN(id) && id != null);
            const staffIds = (eventData.staffEvent?.map(s => Number(s.staffId || s.userId)) || []).filter(id => !isNaN(id) && id != null);
            
            // ✅ FIXED: Backend returns single slotId, not array
            const slotId = eventData.slotId || (eventData.slotEvent && eventData.slotEvent.length > 0 ? eventData. slotEvent[0].slotId : '');
            
            console.log('Extracted IDs:', { speakerIds, slotId, staffIds });
            
            // Format date to YYYY-MM-DD
            const eventDay = eventData.eventDay ? eventData.eventDay.split('T')[0] : '';
            
            const newFormData = {
                eventName:  eventData.eventName || '',
                eventDescription: eventData.eventDescription || '',
                eventDay:  eventDay, // ✅ FIXED:  Use eventDay instead of eventDate
                maxTicketCount: eventData.maxTickerCount?. toString() || '',
                venueId: eventData.venueId?.toString() || '',
                speakerIds: speakerIds,
                slotId: slotId. toString(), // ✅ FIXED: Single slot as string
                staffIds: staffIds
            };
            
            console.log('Setting form data:', newFormData);
            setFormData(newFormData);
            
            setSelectedEventId(event.eventId);
            setModalMode('edit');
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching event details:', error);
            console.error('Error response:', error. response?.data);
            
            toast.error('Failed to load event details. ', {
                position: 'top-right',
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewAttendees = async (eventId) => {
        try {
            setLoadingAttendees(true);
            setShowAttendeesModal(true);
            
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ✅ FIXED:  Validation
        if (!formData.eventName. trim()) {
            toast.error('Please enter event name', {
                position: 'top-right',
                autoClose:  2000
            });
            return;
        }

        if (!formData.eventDay) {
            toast.error('Please select event date', {
                position: 'top-right',
                autoClose: 2000
            });
            return;
        }

        if (!formData.venueId) {
            toast. error('Please select a venue', {
                position: 'top-right',
                autoClose: 2000
            });
            return;
        }

        if (!formData.slotId) {
            toast.error('Please select a time slot', {
                position: 'top-right',
                autoClose: 2000
            });
            return;
        }

        if (formData.speakerIds. length === 0) {
            toast.error('Please select at least one speaker', {
                position:  'top-right',
                autoClose: 2000
            });
            return;
        }

        if (formData.staffIds.length === 0) {
            toast.error('Please select at least one staff member', {
                position: 'top-right',
                autoClose: 2000
            });
            return;
        }
        
        try {
            // ✅ FIXED:  Payload structure matching backend CreateUpdateEventRequest
            const requestData = {
                eventName:  formData.eventName. trim(),
                eventDescription: formData.eventDescription.trim(),
                eventDay: new Date(formData.eventDay).toISOString(), // ✅ FIXED:  eventDay not eventDate
                maxTicketCount: parseInt(formData.maxTicketCount),
                venueId: parseInt(formData.venueId),
                slotId: parseInt(formData.slotId), // ✅ FIXED:  Single slotId, not array
                speakerIds: formData.speakerIds.map(id => parseInt(id)),
                staffIds: formData.staffIds.map(id => parseInt(id))
            };

            console.log('Mode:', modalMode);
            console. log('Event ID:', selectedEventId);
            console.log('Request data:', JSON.stringify(requestData, null, 2));

            let response;
            if (modalMode === 'create') {
                response = await axios.post('https://localhost:7047/api/Event', requestData);
            } else if (modalMode === 'edit') {
                // ✅ FIXED: Update endpoint with query parameter
                response = await axios. put(
                    `https://localhost:7047/api/Event? eventId=${selectedEventId}`, 
                    requestData
                );
            }
            
            if (response.data?.success || response.status === 201 || response.status === 200) {
                const successMessage = modalMode === 'edit' 
                    ? 'Event updated successfully!  Status set to Pending for admin approval.' 
                    : 'Event created successfully! ';
                    
                toast.success(successMessage, {
                    position: 'top-right',
                    autoClose: 3000
                });
                
                setShowModal(false);
                resetForm();
                
                // Refresh the events list
                await fetchMyEvents();
            } else {
                throw new Error(response.data?.message || `Failed to ${modalMode} event`);
            }
        } catch (error) {
            console. error(`Error ${modalMode === 'edit' ? 'updating' : 'creating'} event:`, error);
            console.error('Error response:', error. response?.data);
            
            const errorMessage = 
                error.response?.data?. message || 
                error.response?.data?.title || 
                error.message || 
                `Failed to ${modalMode === 'edit' ? 'update' :  'save'} event. `;
            
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 4000
            });
        }
    };

    const resetForm = () => {
        setFormData({
            eventName: '',
            eventDescription: '',
            eventDay: '',
            maxTicketCount: '',
            venueId: '',
            speakerIds: [],
            slotId: '',
            staffIds: []
        });
        setModalMode('create');
        setSelectedEventId(null);
    };

    const staffList = users.filter(u => u.roleName === 'Staff');

    return (
        <div className="organizer-event-page">
            <Header />
            
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
                        <button 
                            className="sort-btn"
                            onClick={() => setSortOrder(sortOrder === 'nearest' ? 'farthest' : 'nearest')}
                            title={sortOrder === 'nearest' ? 'Sắp xếp: Gần nhất → Xa nhất' : 'Sắp xếp: Xa nhất → Gần nhất'}
                        >
                            {sortOrder === 'nearest' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                            {sortOrder === 'nearest' ? 'Gần nhất' : 'Xa nhất'}
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
                                            <span className={`event-status ${event.status === 'Approve' ? 'active' : 'inactive'}`}>
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
                                        <p className="event-description">{event.eventDescription}</p>
                                        
                                        <div className="event-info">
                                            <div className="info-item">
                                                <FaCalendarAlt className="info-icon" />
                                                <span>
                                                    {new Date(event.eventDay).toLocaleDateString('vi-VN')}
                                                    {event.slotEvent && event.slotEvent.length > 0 && (
                                                        <span className="slot-inline">
                                                            {event.slotEvent.map((slot, index) => (
                                                                <span key={index}>
                                                                    {index > 0 && ', '}
                                                                    {slot.startTime} - {slot.endTime}
                                                                </span>
                                                            ))}
                                                        </span>
                                                    )}
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
                                                <span>{event.currentTickerCount || 0} / {event.maxTickerCount} tickets</span>
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
                                                                <span 
                                                                    className="speaker-name clickable"
                                                                    onClick={() => handleViewSpeaker(speaker)}
                                                                    style={{ cursor: 'pointer', textDecoration: 'underline', color: '#0891b2' }}
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
                                                <FaUserFriends /> View Attendees ({event.currentTickerCount || 0})
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
                                    <p>Loading attendees...</p>
                                </div>
                            ) : attendeesData ?  (
                                <>
                                    <div className="attendees-summary">
                                        <h3>{attendeesData.eventName}</h3>
                                        <p className="total-count">
                                            Total Attendees: <strong>{attendeesData.totalAttendees}</strong>
                                        </p>
                                    </div>
                                    {attendeesData.attendees && attendeesData.attendees. length > 0 ? (
                                        <div className="attendees-list">
                                            {attendeesData.attendees.map((attendee, index) => (
                                                <div key={attendee.ticketId || index} className="attendee-item">
                                                    <div className="attendee-number">{index + 1}</div>
                                                    <div className="attendee-info">
                                                        <div className="attendee-name">{attendee.userName}</div>
                                                        <div className="attendee-email">{attendee.email}</div>
                                                        <div className="attendee-seat">
                                                            Seat Number: <span className="seat-number-badge">
                                                                {attendee.seatNumber || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="attendee-ticket">
                                                            Ticket Status: <span className={`status-badge ${attendee.status?. toLowerCase()}`}>
                                                                {attendee.status || 'Active'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-attendees">
                                            <FaInfoCircle style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                                            <p>No attendees registered for this event yet.</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="no-data">
                                    <p>No data available. </p>
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

            {/* Create/Edit Event Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowModal(false);
                    resetForm();
                }}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'create' ?  'Create New Event' : 'Edit Event'}</h2>
                            <button className="btn-close" onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Event Name *</label>
                                    <input
                                        type="text"
                                        value={formData.eventName}
                                        onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                                        required
                                        placeholder="Enter event name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Event Date *</label>
                                    <input
                                        type="date"
                                        value={formData.eventDay}
                                        onChange={(e) => setFormData({...formData, eventDay: e.target.value})}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Event Description *</label>
                                <textarea
                                    value={formData.eventDescription}
                                    onChange={(e) => setFormData({...formData, eventDescription: e.target.value})}
                                    required
                                    rows="4"
                                    placeholder="Enter event description"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Max Ticket Count *</label>
                                    <input
                                        type="number"
                                        value={formData.maxTicketCount}
                                        onChange={(e) => setFormData({...formData, maxTicketCount: e. target.value})}
                                        required
                                        min="1"
                                        placeholder="100"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Venue *</label>
                                    <select
                                        value={formData.venueId}
                                        onChange={(e) => setFormData({...formData, venueId: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Venue</option>
                                        {venues.map(venue => (
                                            <option key={venue.venueId} value={venue.venueId}>
                                                {venue.venueName} (Capacity: {venue.maxSeat || 0})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* ✅ FIXED: Single slot selection using radio buttons */}
                            <div className="form-group">
                                <label>Time Slot * (Select one)</label>
                                <div className="radio-group">
                                    {slots.length === 0 ? (
                                        <p className="no-data">No slots available.  Please create slots first.</p>
                                    ) : (
                                        slots.map(slot => (
                                            <label key={slot.slotId} className="radio-label">
                                                <input
                                                    type="radio"
                                                    name="slotId"
                                                    value={slot.slotId}
                                                    checked={formData.slotId == slot.slotId}
                                                    onChange={(e) => handleSlotSelect(e.target.value)}
                                                    required
                                                />
                                                <span>{slot.slotName} ({slot.startTime} - {slot.endTime})</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Speakers * (Select at least one)</label>
                                <div className="checkbox-group">
                                    {speakers.length === 0 ? (
                                        <p className="no-data">No speakers available</p>
                                    ) : (
                                        speakers.map(speaker => (
                                            <label key={speaker.speakerId} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.speakerIds.includes(speaker.speakerId)}
                                                    onChange={() => handleMultiSelect('speakerIds', speaker.speakerId)}
                                                />
                                                <span>{speaker.speakerName}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                <small className="form-hint">
                                    {formData.speakerIds. length} speaker(s) selected
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Staff Members * (Select at least one)</label>
                                <div className="checkbox-group">
                                    {staffList.length === 0 ? (
                                        <p className="no-data">No staff available</p>
                                    ) : (
                                        staffList.map(staff => (
                                            <label key={staff. userId} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={formData. staffIds.includes(staff.userId)}
                                                    onChange={() => handleMultiSelect('staffIds', staff.userId)}
                                                />
                                                <span>{staff.userName} ({staff.email})</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                <small className="form-hint">
                                    {formData.staffIds.length} staff member(s) selected
                                </small>
                            </div>

                            {modalMode === 'edit' && (
                                <div className="form-notice">
                                    <FaInfoCircle /> Note: After updating, the event status will be reset to "Pending" for admin approval.
                                </div>
                            )}

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {modalMode === 'create' ? 'Create Event' : 'Update Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizerEventPage;