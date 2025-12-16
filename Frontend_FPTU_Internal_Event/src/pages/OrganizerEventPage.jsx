import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { FaPlus, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaUsers, FaClock, FaMicrophone, FaInfoCircle, FaEdit, FaUserFriends } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getUserInfo } from '../utils/auth';
import '../assets/css/OrganizerEventPage.css';

const OrganizerEventPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);
    const [attendeesData, setAttendeesData] = useState(null);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const [venues, setVenues] = useState([]);
    const [slots, setSlots] = useState([]);
    const [users, setUsers] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
    const [formData, setFormData] = useState({
        eventName: '',
        eventDescription: '',
        eventDate: '',
        maxTicketCount: '',
        venueId: '',
        speakerIds: [],
        slotIds: [],
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
            const response = await axios.get('https://localhost:7047/api/Event/my-events', {
                params: {
                    organizerId: userInfo.userId
                }
            });
            const data = response.data?.data ?? response.data;
            if (Array.isArray(data)) {
                // Sort events by eventDay (earliest first)
                const sortedEvents = data.sort((a, b) => new Date(a.eventDay) - new Date(b.eventDay));
                setMyEvents(sortedEvents);
            } else {
                setMyEvents([]);
            }
        } catch (error) {
            console.error('Error fetching my events:', error);
            toast.error('Failed to fetch your events', {
                position: 'top-right',
                autoClose: 2000
            });
            setMyEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchVenues = async () => {
        try {
            const response = await axios.get('https://localhost:7047/api/Venue');
            const data = response.data?.data ?? response.data;
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
            const data = response.data?.data ?? response.data;
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
                [fieldName]: [...currentValues, numValue]
            });
        }
    };

    const handleEditEvent = async (event) => {
        try {
            setLoading(true);
            
            // Fetch full event details
            const response = await axios.get(`https://localhost:7047/api/Event/${event.eventId}`);
            const eventData = response.data?.data ?? response.data;
            
            console.log('Fetched event data:', eventData);
            
            // Extract IDs from event relationships and filter out null/undefined
            // Ensure IDs are numbers for proper comparison in checkboxes
            const speakerIds = (eventData.speakerEvent?.map(s => Number(s.speakerId)) || []).filter(id => !isNaN(id) && id != null);
            const slotIds = (eventData.slotEvent?.map(s => Number(s.slotId)) || []).filter(id => !isNaN(id) && id != null);
            const staffIds = (eventData.staffEvent?.map(s => Number(s.staffId || s.userId)) || []).filter(id => !isNaN(id) && id != null);
            
            console.log('Extracted IDs:', { speakerIds, slotIds, staffIds });
            
            // Format date to YYYY-MM-DD
            const eventDate = eventData.eventDay ? eventData.eventDay.split('T')[0] : '';
            
            const newFormData = {
                eventName: eventData.eventName || '',
                eventDescription: eventData.eventDescription || '',
                eventDate: eventDate,
                maxTicketCount: eventData.maxTickerCount?.toString() || '',
                venueId: eventData.venueId?.toString() || '',
                speakerIds: speakerIds,
                slotIds: slotIds,
                staffIds: staffIds
            };
            
            console.log('Setting form data:', newFormData);
            setFormData(newFormData);
            
            setSelectedEventId(event.eventId);
            setModalMode('edit');
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching event details:', error);
            toast.error('Failed to load event details.', {
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
            
            const response = await axios.get(`https://localhost:7047/api/Ticket/event/${eventId}/attendees`);
            const data = response.data?.data ?? response.data;
            
            setAttendeesData(data);
            
            if (data?.totalAttendees === 0) {
                toast.info('No attendees found for this event.', {
                    position: 'top-right',
                    autoClose: 2000
                });
            }
        } catch (error) {
            console.error('Error fetching attendees:', error);
            toast.error('Failed to load attendees.', {
                position: 'top-right',
                autoClose: 3000
            });
            setShowAttendeesModal(false);
        } finally {
            setLoadingAttendees(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Filter out null/undefined values from arrays
            const cleanSpeakerIds = formData.speakerIds.filter(id => id != null && id !== '');
            const cleanSlotIds = formData.slotIds.filter(id => id != null && id !== '');
            const cleanStaffIds = formData.staffIds.filter(id => id != null && id !== '');
            
            const requestData = {
                eventName: formData.eventName,
                eventDescription: formData.eventDescription,
                eventDate: formData.eventDate,
                maxTicketCount: parseInt(formData.maxTicketCount),
                venueId: parseInt(formData.venueId),
                speakerIds: cleanSpeakerIds,
                slotIds: cleanSlotIds,
                staffIds: cleanStaffIds
            };

            console.log('Mode:', modalMode);
            console.log('Event ID:', selectedEventId);
            console.log('Request data:', JSON.stringify(requestData, null, 2));
            console.log('API URL:', modalMode === 'edit' ? `https://localhost:7047/api/Event?eventId=${selectedEventId}` : 'https://localhost:7047/api/Event');

            let response;
            if (modalMode === 'create') {
                response = await axios.post('https://localhost:7047/api/Event', requestData);
            } else if (modalMode === 'edit') {
                response = await axios.put(`https://localhost:7047/api/Event?eventId=${selectedEventId}`, requestData);
            }
            
            if (response.data?.success || response.status === 201 || response.status === 200) {
                toast.success(`Event ${modalMode === 'edit' ? 'updated' : 'created'} successfully!`, {
                    position: 'top-right',
                    autoClose: 2000
                });
                
                setShowModal(false);
                setFormData({
                    eventName: '',
                    eventDescription: '',
                    eventDate: '',
                    maxTicketCount: '',
                    venueId: '',
                    speakerIds: [],
                    slotIds: [],
                    staffIds: []
                });
                setModalMode('create');
                setSelectedEventId(null);
                
                // Refresh the events list
                fetchMyEvents();
            } else {
                throw new Error(response.data?.message || `Failed to ${modalMode} event`);
            }
        } catch (error) {
            console.error(`Error ${modalMode === 'edit' ? 'updating' : 'creating'} event:`, error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Full error response:', JSON.stringify(error.response, null, 2));
            const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || `Failed to ${modalMode === 'edit' ? 'update' : 'save'} event.`;
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 3000
            });
        }
    };

    const staffList = users.filter(u => u.roleName === 'Staff');

    return (
        <div className="organizer-event-page">
            <Header />
            
            <div className="organizer-main-content">
                <div className="organizer-container">
                    <div className="organizer-header">
                        <h1>Event Management</h1>
                        <button className="btn-create-event" onClick={() => setShowModal(true)}>
                            <FaPlus /> Create New Event
                        </button>
                    </div>

                    <div className="filter-toolbar">
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
                    ) : myEvents.length === 0 ? (
                        <div className="welcome-card">
                            <FaCalendarAlt className="welcome-icon" />
                            <h2>Welcome to Event Management</h2>
                            <p>You haven't created any events yet. Click "Create New Event" to get started.</p>
                        </div>
                    ) : (() => {
                        const filteredEvents = myEvents.filter(event => {
                            if (filterStatus === 'all') return true;
                            if (filterStatus === 'pending') return event.status === 'Pending';
                            if (filterStatus === 'approved') return event.status === 'Approve' || event.status === 'Approved';
                            if (filterStatus === 'rejected') return event.status === 'Reject' || event.status === 'Rejected';
                            return true;
                        }).sort((a, b) => new Date(a.eventDay) - new Date(b.eventDay));

                        return filteredEvents.length === 0 ? (
                            <div className="no-events-found">
                                <FaInfoCircle className="no-events-icon" />
                                <p>No events found with status: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}</p>
                            </div>
                        ) : (
                        <div className="events-grid">
                            {filteredEvents.map(event => (
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
                                                <span>{new Date(event.eventDay).toLocaleDateString('vi-VN')}</span>
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
                                            
                                            {event.slotEvent && event.slotEvent.length > 0 && (
                                                <div className="info-section">
                                                    <div className="section-header">
                                                        <FaClock className="info-icon" />
                                                        <span className="section-title">Time Slots:</span>
                                                    </div>
                                                    <div className="section-content">
                                                        {event.slotEvent.map((slot, index) => (
                                                            <div key={index} className="slot-item">
                                                                <span className="slot-name">{slot.slotName}:</span>
                                                                <span className="slot-time">{slot.startTime} - {slot.endTime}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {event.speakerEvent && event.speakerEvent.length > 0 && (
                                                <div className="info-section">
                                                    <div className="section-header">
                                                        <FaMicrophone className="info-icon" />
                                                        <span className="section-title">Speakers:</span>
                                                    </div>
                                                    <div className="section-content">
                                                        {event.speakerEvent.map((speaker, index) => (
                                                            <div key={index} className="speaker-item">
                                                                <span className="speaker-name">{speaker.speakerName}</span>
                                                                {speaker.speakerDescription && (
                                                                    <span className="speaker-desc">{speaker.speakerDescription}</span>
                                                                )}
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
                                                <FaUserFriends /> View Attendees
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
                            ) : attendeesData ? (
                                <>
                                    <div className="attendees-summary">
                                        <h3>{attendeesData.eventName}</h3>
                                        <p className="total-count">
                                            Total Attendees: <strong>{attendeesData.totalAttendees}</strong>
                                        </p>
                                    </div>
                                    {attendeesData.attendees && attendeesData.attendees.length > 0 ? (
                                        <div className="attendees-list">
                                            {attendeesData.attendees.map((attendee, index) => (
                                                <div key={attendee.ticketId || index} className="attendee-item">
                                                    <div className="attendee-number">{index + 1}</div>
                                                    <div className="attendee-info">
                                                        <div className="attendee-name">{attendee.userName}</div>
                                                        <div className="attendee-email">{attendee.email}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-attendees">
                                            <p>No attendees registered for this event yet.</p>
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
            {/* Create Event Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowModal(false);
                    setModalMode('create');
                    setSelectedEventId(null);
                    setFormData({
                        eventName: '',
                        eventDescription: '',
                        eventDate: '',
                        maxTicketCount: '',
                        venueId: '',
                        speakerIds: [],
                        slotIds: [],
                        staffIds: []
                    });
                }}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'create' ? 'Create New Event' : 'Edit Event'}</h2>
                            <button className="btn-close" onClick={() => {
                                setShowModal(false);
                                setModalMode('create');
                                setSelectedEventId(null);
                                setFormData({
                                    eventName: '',
                                    eventDescription: '',
                                    eventDate: '',
                                    maxTicketCount: '',
                                    venueId: '',
                                    speakerIds: [],
                                    slotIds: [],
                                    staffIds: []
                                });
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
                                        value={formData.eventDate}
                                        onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                                        required
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
                                        onChange={(e) => setFormData({...formData, maxTicketCount: e.target.value})}
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
                                                {venue.venueName} (Capacity: {venue.capacity})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Time Slots * (Select at least one)</label>
                                <div className="checkbox-group">
                                    {slots.length === 0 ? (
                                        <p className="no-data">No slots available. Please create slots first.</p>
                                    ) : (
                                        slots.map(slot => (
                                            <label key={slot.slotId} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.slotIds.includes(slot.slotId)}
                                                    onChange={() => handleMultiSelect('slotIds', slot.slotId)}
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
                                                <span>{speaker.speakerName} {speaker.speakerEmail ? `(${speaker.speakerEmail})` : ''}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Staff Members * (Select at least one)</label>
                                <div className="checkbox-group">
                                    {staffList.length === 0 ? (
                                        <p className="no-data">No staff available</p>
                                    ) : (
                                        staffList.map(staff => (
                                            <label key={staff.userId} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.staffIds.includes(staff.userId)}
                                                    onChange={() => handleMultiSelect('staffIds', staff.userId)}
                                                />
                                                <span>{staff.userName} ({staff.email})</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => {
                                    setShowModal(false);
                                    setModalMode('create');
                                    setSelectedEventId(null);
                                    setFormData({
                                        eventName: '',
                                        eventDescription: '',
                                        eventDate: '',
                                        maxTicketCount: '',
                                        venueId: '',
                                        speakerIds: [],
                                        slotIds: [],
                                        staffIds: []
                                    });
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
