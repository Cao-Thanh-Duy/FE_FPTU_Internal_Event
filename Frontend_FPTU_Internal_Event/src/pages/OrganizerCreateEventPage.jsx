import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaInfoCircle, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getUserInfo } from '../utils/auth';
import '../assets/css/OrganizerCreateEventPage.css';

const OrganizerCreateEventPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Data states
    const [venues, setVenues] = useState([]);
    const [slots, setSlots] = useState([]);
    const [users, setUsers] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [existingEvents, setExistingEvents] = useState([]);

    // Form states
    const [formData, setFormData] = useState({
        eventName: '',
        eventDescription: '',
        maxTicketCount: '',
        venueId: '',
        speakerIds: [],
        staffIds: [],
    });

    // Calendar states
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlotIds, setSelectedSlotIds] = useState([]);

    // Modal states
    const [showSpeakerModal, setShowSpeakerModal] = useState(false);
    const [selectedSpeaker, setSelectedSpeaker] = useState(null);

    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date. getMonth() + 1).padStart(2, '0');
        const day = String(date. getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const parseBackendDate = (dateValue) => {
        if (!dateValue) return null;
        
        if (typeof dateValue === 'string') {
            return dateValue.split('T')[0];
        } else if (dateValue instanceof Date) {
            return formatLocalDate(dateValue);
        } else {
            const d = new Date(dateValue);
            return formatLocalDate(d);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            toast.error('Authentication required.  Please login. ', {
                position: 'top-right',
                autoClose: 3000
            });
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (formData.venueId) {
            fetchEventsForAvailability();
        }
    }, [currentDate, formData.venueId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [venuesRes, slotsRes, usersRes, speakersRes] = await Promise.all([
                axios.get('https://localhost:7047/api/Venue'),
                axios.get('https://localhost:7047/api/Slot'),
                axios.get('https://localhost:7047/api/User'),
                axios.get('https://localhost:7047/api/Speaker')
            ]);

            const venuesData = venuesRes.data?. data ??  venuesRes.data ??  [];
            const slotsData = slotsRes.data?.data ?? slotsRes.data ?? [];
            const usersData = usersRes. data?.data ?? usersRes. data ?? [];
            const speakersData = speakersRes. data?.data ?? speakersRes.data ?? [];

            setVenues(venuesData);
            setSlots(slotsData);
            setUsers(usersData);
            setSpeakers(speakersData);

            console.log('Loaded venues:', venuesData);
            console.log('Loaded slots:', slotsData);

            toast.success('Form data loaded successfully! ', {
                position: 'top-right',
                autoClose: 1500
            });
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast. error('Failed to load form data. Please refresh the page.', {
                position: 'top-right',
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchEventsForAvailability = async () => {
        try {
            const response = await axios.get('https://localhost:7047/api/Event');
            const events = response.data?. data ?? response.data ?? [];
            
            console.log('📅 Raw events from API:', events);
            
            const approvedEvents = events.filter(e => 
                e.status === 'Approve' || 
                e.status === 'Approved' || 
                e.status === 'approve' ||
                e.status === 1
            );
            
            const mappedEvents = approvedEvents.map(event => {
                const venue = venues.find(v => v.venueName === event.venueName);
                
                return {
                    ... event,
                    venueId: venue?.venueId || null,
                    slotIds: event.slotEvent?.map(slot => {
                        const foundSlot = slots.find(s => 
                            s.slotName === slot.slotName && 
                            s.startTime === slot.startTime
                        );
                        return foundSlot?. slotId;
                    }).filter(id => id !== undefined) || []
                };
            });
            
            console.log('Mapped events with venueId and slotIds:', mappedEvents);
            setExistingEvents(mappedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load event availability', {
                position: 'top-right',
                autoClose:  2000
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ... prev,
            [name]: value
        }));
    };

    const toggleSelection = (field, id) => {
        setFormData(prev => {
            const currentValues = prev[field];
            const numId = parseInt(id);
            if (currentValues.includes(numId)) {
                return { ...prev, [field]: currentValues.filter(val => val !== numId) };
            } else {
                return { ...prev, [field]: [...currentValues, numId] };
            }
        });
    };

    const handleShowSpeakerInfo = (speaker) => {
        setSelectedSpeaker(speaker);
        setShowSpeakerModal(true);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate. getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
        setSelectedDate(null);
        setSelectedSlotIds([]);
    };

    const isSlotBooked = (date, slotId) => {
        if (!formData.venueId) return false;
        
        const dateString = formatLocalDate(date);
        
        const isBooked = existingEvents.some(event => {
            if (!event. venueId || !event.slotIds) return false;
            
            const eventDateString = parseBackendDate(event.eventDay);
            
            const sameDate = eventDateString === dateString;
            const sameVenue = event.venueId == formData.venueId;
            const hasSlot = event.slotIds.includes(parseInt(slotId));
            
            if (sameDate && sameVenue && hasSlot) {
                console.log('🔴 Slot booked:', { 
                    date: dateString, 
                    venue:  formData.venueId, 
                    slot: slotId,
                    eventName: event.eventName 
                });
            }
            
            return sameDate && sameVenue && hasSlot;
        });
        
        return isBooked;
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentDate. getFullYear(), currentDate.getMonth(), day, 12, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (newDate < today) {
            toast.warning("Cannot select past dates", {
                position: 'top-right',
                autoClose: 2000
            });
            return;
        }

        setSelectedDate(newDate);
        setSelectedSlotIds([]);
        
        console.log('📅 Selected date:', formatLocalDate(newDate));
    };

    const toggleSlot = (slotId) => {
        if (! selectedDate) return;
        
        if (selectedSlotIds.includes(slotId)) {
            setSelectedSlotIds(prev => prev.filter(id => id !== slotId));
        } else {
            setSelectedSlotIds(prev => [...prev, slotId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedDate || selectedSlotIds.length === 0) {
            toast.error("Please select a date and at least one slot", {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        if (! formData.venueId) {
            toast. error("Please select a venue", {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        if (! formData.eventName.trim()) {
            toast.error("Please enter event name", {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        if (!formData.eventDescription.trim()) {
            toast.error("Please enter event description", {
                position: 'top-right',
                autoClose:  3000
            });
            return;
        }

        if (!formData.maxTicketCount || formData.maxTicketCount < 1) {
            toast. error("Please enter valid max ticket count", {
                position:  'top-right',
                autoClose: 3000
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                eventName: formData.eventName. trim(),
                eventDescription: formData.eventDescription.trim(),
                eventDate: formatLocalDate(selectedDate),
                maxTicketCount: parseInt(formData.maxTicketCount),
                venueId: parseInt(formData.venueId),
                slotIds: selectedSlotIds. map(id => parseInt(id)),
                speakerIds: formData.speakerIds.map(id => parseInt(id)),
                staffIds: formData.staffIds.map(id => parseInt(id))
            };

            console.log('📤 Creating event with payload:', payload);

            const response = await axios.post('https://localhost:7047/api/Event', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                }
            });
            
            console.log('Create response:', response.data);
            
            if (response.data.success) {
                toast.success('Event created successfully!', {
                    position: 'top-right',
                    autoClose: 2000
                });
                
                setTimeout(() => {
                    navigate('/organizer/events');
                }, 2000);
            } else {
                throw new Error(response.data.message || 'Failed to create event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            console.error('Error response:', error.response?.data);
            
            let errorMessage = 'Failed to create event.  Please try again.';
            
            if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please login again.';
                setTimeout(() => navigate('/login'), 2000);
            } else if (error.response?.status === 400) {
                errorMessage = error.response?.data?.message || 
                             error.response?.data?.title ||
                             'Invalid data provided.  Please check all fields.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response. data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 4000
            });
        } finally {
            setLoading(false);
        }
    };

    const renderCalendar = () => {
        const { days, firstDay } = getDaysInMonth(currentDate);
        const calendarDays = [];
        
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= days; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12, 0, 0);
            
            const isSelected = selectedDate && 
                             date.getDate() === selectedDate.getDate() && 
                             date.getMonth() === selectedDate.getMonth() &&
                             date.getFullYear() === selectedDate.getFullYear();
            const isToday = date.toDateString() === today.toDateString();
            
            const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const isPast = dateMidnight < todayMidnight;
            
            let bookedSlots = [];
            let availableSlots = [];
            
            if (formData.venueId && slots.length > 0) {
                slots.forEach(slot => {
                    if (isSlotBooked(date, slot.slotId)) {
                        bookedSlots. push(slot. slotId);
                    } else {
                        availableSlots.push(slot.slotId);
                    }
                });
            }

            const hasBooked = bookedSlots.length > 0;
            const hasAvailable = availableSlots. length > 0;
            const isFullyBooked = formData.venueId && slots.length > 0 && ! hasAvailable && hasBooked;
            const isPartiallyBooked = hasBooked && hasAvailable;

            let dayClasses = 'calendar-day';
            if (isSelected) dayClasses += ' selected';
            if (isToday) dayClasses += ' today';
            if (isPast) dayClasses += ' past-date';
            else if (isFullyBooked) dayClasses += ' fully-booked';
            else if (isPartiallyBooked) dayClasses += ' partially-booked';

            const isClickable = !isPast && !isFullyBooked;

            calendarDays.push(
                <div 
                    key={day} 
                    className={dayClasses}
                    onClick={() => isClickable && handleDateClick(day)}
                    title={
                        isPast ? 'Past date' : 
                        isFullyBooked ? 'All slots booked' : 
                        isPartiallyBooked ?  `${availableSlots.length} slot(s) available` :
                        hasAvailable ? `${availableSlots.length} slot(s) available` : 
                        'Select date'
                    }
                >
                    <span className="day-number">{day}</span>
                    <div className="day-status-dots">
                        {hasBooked && <span className="status-dot booked" title={`${bookedSlots.length} booked`}></span>}
                        {hasAvailable && <span className="status-dot available" title={`${availableSlots.length} available`}></span>}
                    </div>
                </div>
            );
        }

        return calendarDays;
    };

    const CalendarLegend = () => (
        <div className="calendar-legend">
            <div className="legend-item">
                <div className="legend-box available"></div>
                <span>Available</span>
            </div>
            <div className="legend-item">
                <div className="legend-box partially-booked"></div>
                <span>Partially Booked</span>
            </div>
            <div className="legend-item">
                <div className="legend-box fully-booked"></div>
                <span>Fully Booked</span>
            </div>
            <div className="legend-item">
                <div className="legend-box past"></div>
                <span>Past Date</span>
            </div>
        </div>
    );

    return (
        <div className="create-event-container">
            <Header />
            <div className="create-event-content">
                <div className="page-header">
                    <div className="page-title">
                        <FaCalendarAlt className="text-orange-500" />
                        Create New Event
                    </div>
                    <button className="back-btn" onClick={() => navigate('/organizer/events')}>
                        <FaArrowLeft /> Back to Events
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="event-form-grid">
                    <div className="form-section">
                        <h3 className="section-title"><FaInfoCircle /> Basic Information</h3>
                        
                        <div className="form-group">
                            <label>Event Name *</label>
                            <input
                                type="text"
                                name="eventName"
                                className="form-control"
                                value={formData.eventName}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter event name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                name="eventDescription"
                                className="form-control"
                                value={formData.eventDescription}
                                onChange={handleInputChange}
                                required
                                placeholder="Describe your event..."
                                rows="4"
                            />
                        </div>

                        <div className="form-group">
                            <label>Max Tickets *</label>
                            <input
                                type="number"
                                name="maxTicketCount"
                                className="form-control"
                                value={formData.maxTicketCount}
                                onChange={handleInputChange}
                                required
                                min="1"
                                placeholder="Enter maximum number of tickets"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title"><FaMapMarkerAlt /> Venue & Participants</h3>
                        
                        <div className="form-group">
                            <label>Venue *</label>
                            <select
                                name="venueId"
                                className="form-control"
                                value={formData.venueId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select a Venue</option>
                                {venues.map(venue => (
                                    <option key={venue. venueId} value={venue.venueId}>
                                        {venue.venueName} (Capacity: {venue.maxSeat || 0})
                                    </option>
                                ))}
                            </select>
                            {! formData.venueId && (<small className="text-gray-500">Select a venue to see availability calendar</small>)}
                        </div>

                        <div className="form-group">
                            <label>Speakers</label>
                            <div className="selection-grid">
                                {speakers.map(speaker => (
                                    <div 
                                        key={speaker. speakerId} 
                                        className={`selection-card ${formData.speakerIds.includes(speaker.speakerId) ? 'selected' : ''}`}
                                        onClick={() => toggleSelection('speakerIds', speaker.speakerId)}
                                    >
                                        <div className="card-content">
                                            <span className="card-name">{speaker.speakerName}</span>
                                            <button 
                                                type="button"
                                                className="info-btn" 
                                                onClick={(e) => { e.stopPropagation(); handleShowSpeakerInfo(speaker); }}
                                                title="View Details"
                                            >
                                                <FaInfoCircle />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {speakers.length === 0 && <div className="text-gray-500 text-sm">No speakers available</div>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Staff</label>
                            <div className="selection-grid">
                                {users.filter(u => u.roleName === 'Staff').map(user => (
                                    <div 
                                        key={user.userId} 
                                        className={`selection-card ${formData.staffIds.includes(user.userId) ? 'selected' : ''}`}
                                        onClick={() => toggleSelection('staffIds', user.userId)}
                                    >
                                        <div className="card-content">
                                            <span className="card-name">{user.userName}</span>
                                        </div>
                                    </div>
                                ))}
                                {users.filter(u => u.roleName === 'Staff').length === 0 && <div className="text-gray-500 text-sm">No staff available</div>}
                            </div>
                        </div>
                    </div>

                    <div className="form-section full-width">
                        <h3 className="section-title"><FaClock /> Date & Time Selection</h3>
                        
                        {formData.venueId ?  (
                            <div className="calendar-wrapper">
                                <div className="calendar-container">
                                    <div className="calendar-header">
                                        <button type="button" className="month-nav-btn" onClick={() => changeMonth(-1)}>&lt;</button>
                                        <span className="current-month">
                                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button type="button" className="month-nav-btn" onClick={() => changeMonth(1)}>&gt;</button>
                                    </div>
                                    <div className="calendar-grid">
                                        <div className="calendar-day-header">Sun</div>
                                        <div className="calendar-day-header">Mon</div>
                                        <div className="calendar-day-header">Tue</div>
                                        <div className="calendar-day-header">Wed</div>
                                        <div className="calendar-day-header">Thu</div>
                                        <div className="calendar-day-header">Fri</div>
                                        <div className="calendar-day-header">Sat</div>
                                        {renderCalendar()}
                                    </div>
                                </div>
                                
                                <CalendarLegend />

                                {selectedDate && (
                                    <div className="slot-selection-area">
                                        <div className="selected-date-info">
                                            Available Slots for {selectedDate.toLocaleDateString()}
                                        </div>
                                        {slots.length === 0 ?  (
                                            <div className="text-center py-4 text-gray-500">
                                                No slots available
                                            </div>
                                        ) : (
                                            <div className="slots-grid">
                                                {slots.map(slot => {
                                                    const booked = isSlotBooked(selectedDate, slot.slotId);
                                                    const selected = selectedSlotIds.includes(slot.slotId);
                                                    
                                                    return (
                                                        <div 
                                                            key={slot.slotId}
                                                            className={`slot-card ${booked ? 'disabled' : ''} ${selected ? 'selected' :  ''}`}
                                                            onClick={() => !booked && toggleSlot(slot.slotId)}
                                                        >
                                                            <strong>{slot.slotName || `Slot ${slot.slotId}`}</strong>
                                                            <span className="slot-time">
                                                                {slot.startTime} - {slot. endTime}
                                                            </span>
                                                            {booked && (
                                                                <span className="text-xs text-red-500 block mt-1">
                                                                    Already Booked
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                Please select a Venue above to view the availability calendar. 
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/organizer/events')} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            <FaSave /> {loading ? 'Creating Event...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>

            {showSpeakerModal && selectedSpeaker && (
                <div className="modal-overlay" onClick={() => setShowSpeakerModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Speaker Details</h3>
                            <button className="close-modal-btn" onClick={() => setShowSpeakerModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="speaker-detail-row">
                                <span className="speaker-detail-label">Name</span>
                                <span className="speaker-detail-value">{selectedSpeaker.speakerName}</span>
                            </div>
                            <div className="speaker-detail-row">
                                <span className="speaker-detail-label">Email</span>
                                <span className="speaker-detail-value">{selectedSpeaker.email || 'N/A'}</span>
                            </div>
                            <div className="speaker-detail-row">
                                <span className="speaker-detail-label">Phone</span>
                                <span className="speaker-detail-value">{selectedSpeaker. phoneNumber || 'N/A'}</span>
                            </div>
                            <div className="speaker-detail-row">
                                <span className="speaker-detail-label">Bio</span>
                                <span className="speaker-detail-value">{selectedSpeaker.bio || 'No biography available.'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizerCreateEventPage;