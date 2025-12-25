import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import SidebarOrganizer from '../components/SidebarOrganizer';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaInfoCircle, FaSave, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../assets/css/OrganizerCreateEventPage.css';

const OrganizerUpdateEventPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const eventId = location.state?.eventId;
    const [loading, setLoading] = useState(false);
    const [loadingEvent, setLoadingEvent] = useState(true);
    
    // Data states
    const [venues, setVenues] = useState([]);
    const [slots, setSlots] = useState([]);
    const [users, setUsers] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [existingEvents, setExistingEvents] = useState([]);
    const [originalEvent, setOriginalEvent] = useState(null);

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
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    // Search states
    const [speakerSearch, setSpeakerSearch] = useState('');
    const [staffSearch, setStaffSearch] = useState('');

    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
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
            toast.error('Authentication required. Please login.', {
                position: 'top-right',
                autoClose: 3000
            });
            navigate('/login');
        }

        if (!eventId) {
            toast.error('Event ID is missing!', {
                position: 'top-right',
                autoClose: 3000
            });
            navigate('/organizer/events');
        }
    }, [navigate, eventId]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (venues.length > 0 && slots.length > 0 && eventId) {
            fetchEventData();
        }
    }, [venues, slots, eventId]);

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

            const venuesData = venuesRes.data?.data ?? venuesRes.data ?? [];
            const slotsData = slotsRes.data?.data ?? slotsRes.data ?? [];
            const usersData = usersRes.data?.data ?? usersRes.data ?? [];
            const speakersData = speakersRes.data?.data ?? speakersRes.data ?? [];

            setVenues(venuesData);
            setSlots(slotsData);
            setUsers(usersData);
            setSpeakers(speakersData);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load form data. Please refresh the page.', {
                position: 'top-right',
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchEventData = async () => {
        try {
            setLoadingEvent(true);
            const response = await axios.get(`https://localhost:7047/api/Event/${eventId}`);
            const eventData = response.data?.data ?? response.data;
            
            console.log('📝 Loaded event data:', eventData);
            setOriginalEvent(eventData);
            
            // Extract Speaker IDs by matching speakerName with speakers list
            const speakerIds = (eventData.speakerEvent || [])
                .map(eventSpeaker => {
                    const matchedSpeaker = speakers.find(s => 
                        s.speakerName === eventSpeaker.speakerName
                    );
                    return matchedSpeaker ? Number(matchedSpeaker.speakerId) : null;
                })
                .filter(id => id !== null);
            
            // Extract Staff IDs from userId
            const staffIds = (eventData.staffEvent?.map(s => Number(s.staffId || s.userId)) || []).filter(id => !isNaN(id) && id != null);
            
            console.log('🎤 Extracted Speaker IDs:', speakerIds);
            console.log('👥 Extracted Staff IDs:', staffIds);
            
            // Extract slot IDs
            const slotIds = (eventData.slotEvent || []).map(eventSlot => {
                const matchedSlot = slots.find(s => 
                    s.slotName === eventSlot.slotName && 
                    s.startTime === eventSlot.startTime
                );
                return matchedSlot ? matchedSlot.slotId : null;
            }).filter(id => id !== null);
            
            // Parse event date
            const eventDateStr = parseBackendDate(eventData.eventDay);
            const eventDate = new Date(eventDateStr + 'T12:00:00');
            
            setFormData({
                eventName: eventData.eventName || '',
                eventDescription: eventData.eventDescription || '',
                maxTicketCount: eventData.maxTickerCount?.toString() || '',
                venueId: eventData.venueId?.toString() || '',
                speakerIds: speakerIds,
                staffIds: staffIds,
            });
            
            setSelectedDate(eventDate);
            setSelectedSlotIds(slotIds);
            setCurrentDate(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
            
            toast.success('Event loaded successfully!', {
                position: 'top-right',
                autoClose: 2000
            });
        } catch (error) {
            console.error('Error fetching event:', error);
            toast.error('Failed to load event data.', {
                position: 'top-right',
                autoClose: 3000
            });
            navigate('/organizer/events');
        } finally {
            setLoadingEvent(false);
        }
    };

    const fetchEventsForAvailability = async () => {
        try {
            const response = await axios.get('https://localhost:7047/api/Event');
            const events = response.data?.data ?? response.data ?? [];
            
            // Filter out the current event being edited and rejected events
            const blockingEvents = events.filter(e => {
                // Exclude current event
                if (e.eventId === eventId) return false;
                
                const s = e.status;
                const isApproved = s === 'Approve' || s === 'Approved' || s === 'approve' || s === 1;
                const isPending = s === 'Pending' || s === 'pending' || s === 0;
                
                return isApproved || isPending;
            });
            
            const mappedEvents = blockingEvents.map(event => {
                const venue = venues.find(v => v.venueName === event.venueName);
                
                return {
                    ...event,
                    venueId: venue?.venueId || null,
                    slotIds: event.slotEvent?.map(slot => {
                        const foundSlot = slots.find(s => 
                            s.slotName === slot.slotName && 
                            s.startTime === slot.startTime
                        );
                        return foundSlot?.slotId;
                    }).filter(id => id !== undefined) || []
                };
            });
            
            setExistingEvents(mappedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
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

    const handleShowStaffInfo = (staff) => {
        setSelectedStaff(staff);
        setShowStaffModal(true);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
    };

    const isSlotBooked = (date, slotId) => {
        if (!formData.venueId) return false;
        
        const dateString = formatLocalDate(date);
        
        const isBooked = existingEvents.some(event => {
            if (!event.venueId || !event.slotIds) return false;
            
            const eventDateString = parseBackendDate(event.eventDay);
            
            const sameDate = eventDateString === dateString;
            const sameVenue = event.venueId == formData.venueId;
            const hasSlot = event.slotIds.includes(parseInt(slotId));
            
            return sameDate && sameVenue && hasSlot;
        });
        
        return isBooked;
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12, 0, 0);
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
    };

    const toggleSlot = (slotId) => {
        if (!selectedDate) return;
        
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

        if (!formData.venueId) {
            toast.error("Please select a venue", {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        if (!formData.eventName.trim()) {
            toast.error("Please enter event name", {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        if (!formData.eventDescription.trim()) {
            toast.error("Please enter event description", {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        if (!formData.maxTicketCount || formData.maxTicketCount < 1) {
            toast.error("Please enter valid max ticket count", {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        if (formData.speakerIds.length === 0) {
            toast.error("Please select at least 1 speaker", {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        if (formData.staffIds.length === 0) {
            toast.error("Please select at least 1 staff member", {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                eventName: formData.eventName.trim(),
                eventDescription: formData.eventDescription.trim(),
                eventDate: formatLocalDate(selectedDate),
                maxTicketCount: parseInt(formData.maxTicketCount),
                venueId: parseInt(formData.venueId),
                slotIds: selectedSlotIds.map(id => parseInt(id)),
                speakerIds: formData.speakerIds.map(id => parseInt(id)),
                staffIds: formData.staffIds.map(id => parseInt(id))
            };

            console.log('📤 Updating event with payload:', payload);

            const response = await axios.put(
                `https://localhost:7047/api/Event?eventId=${eventId}`, 
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                    }
                }
            );
            
            console.log('Update response:', response.data);
            
            toast.success('Event updated successfully! Status set to Pending for admin approval.', {
                position: 'top-right',
                autoClose: 2000
            });
            
            setTimeout(() => {
                navigate('/organizer/events');
            }, 2000);
        } catch (error) {
            console.error('Error updating event:', error);
            console.error('Error response:', error.response?.data);
            
            let errorMessage = 'Failed to update event. Please try again.';
            
            if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please login again.';
                setTimeout(() => navigate('/login'), 2000);
            } else if (error.response?.status === 400) {
                errorMessage = error.response?.data?.message || 
                             error.response?.data?.title ||
                             'Invalid data provided. Please check all fields.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
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

        // Tính ngày giới hạn: hôm nay + 2 ngày = 3 ngày bị disable (21, 22, 23)
        const minAllowedDate = new Date(today);
        minAllowedDate.setDate(today.getDate() + 3);
        minAllowedDate.setHours(0, 0, 0, 0);

        for (let day = 1; day <= days; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12, 0, 0);
            
            const isSelected = selectedDate && 
                             date.getDate() === selectedDate.getDate() && 
                             date.getMonth() === selectedDate.getMonth() &&
                             date.getFullYear() === selectedDate.getFullYear();
            const isToday = date.toDateString() === today.toDateString();
            
            const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            // Disable nếu ngày < ngày hiện tại + 3 ngày
            const isPast = dateMidnight < minAllowedDate;
            
            let bookedSlots = [];
            let availableSlots = [];
            
            if (formData.venueId && slots.length > 0) {
                slots.forEach(slot => {
                    if (isSlotBooked(date, slot.slotId)) {
                        bookedSlots.push(slot.slotId);
                    } else {
                        availableSlots.push(slot.slotId);
                    }
                });
            }

            const hasBooked = bookedSlots.length > 0;
            const hasAvailable = availableSlots.length > 0;
            const isFullyBooked = formData.venueId && slots.length > 0 && !hasAvailable && hasBooked;
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
                        isPartiallyBooked ? `${availableSlots.length} slot(s) available` :
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

    if (loadingEvent) {
        return (
            <div className="create-event-container">
                <SidebarOrganizer />
                <div className="create-event-content">
                    <div className="loading-container">
                        <p>Loading event data...</p>
                    </div>
                </div>
            </div>
        );
    }

    const filteredSpeakers = speakers.filter(speaker =>
        speaker.speakerName?.toLowerCase().includes(speakerSearch.toLowerCase())
    );

    const filteredStaff = users
        .filter(u => u.roleName === 'Staff')
        .filter(staff =>
            staff.userName?.toLowerCase().includes(staffSearch.toLowerCase()) ||
            staff.email?.toLowerCase().includes(staffSearch.toLowerCase())
        );

    return (
        <div className="create-event-container">
            <SidebarOrganizer />
            <div className="create-event-content">
                <div className="page-header">
                    <div className="page-title">
                        <FaCalendarAlt className="text-orange-500" />
                        Update Event
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
                        
                        {originalEvent && (
                            <div style={{
                                backgroundColor: '#e3f2fd',
                                border: '1px solid #2196F3',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                marginBottom: '20px',
                                fontSize: '13px',
                                color: '#0d47a1'
                            }}>
                                <strong>Current data:</strong> {originalEvent.venueName} | 
                                📅 {new Date(originalEvent.eventDay).toLocaleDateString('vi-VN')} | 
                                🕐 {originalEvent.slotEvent?.map(s => s.slotName).join(', ') || 'No slots'}
                            </div>
                        )}
                        
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
                                    <option key={venue.venueId} value={venue.venueId.toString()}>
                                        {venue.venueName} (Capacity: {venue.maxSeat || 0})
                                    </option>
                                ))}
                            </select>
                            {!formData.venueId && (<small className="text-gray-500">Select a venue to see availability calendar</small>)}
                        </div>

                        <div className="form-group">
                            <label>Speakers</label>
                            <div className="search-box-inline">
                                <input
                                    type="text"
                                    placeholder="Search speakers by name..."
                                    value={speakerSearch}
                                    onChange={(e) => setSpeakerSearch(e.target.value)}
                                    className="search-input-inline"
                                />
                            </div>
                            <div className="selection-grid">
                                {speakers.filter(speaker => 
                                    speaker.speakerName.toLowerCase().includes(speakerSearch.toLowerCase())
                                ).map(speaker => {
                                    const isSelected = formData.speakerIds.includes(Number(speaker.speakerId));
                                    return (
                                        <div 
                                            key={speaker.speakerId} 
                                            className={`selection-card ${isSelected ? 'selected' : ''}`}
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
                                    );
                                })}
                                {speakers.filter(speaker => 
                                    speaker.speakerName.toLowerCase().includes(speakerSearch.toLowerCase())
                                ).length === 0 && <div className="text-gray-500 text-sm">No speakers found</div>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Staff</label>
                            <div className="search-box-inline">
                                <input
                                    type="text"
                                    placeholder="Search staff by name..."
                                    value={staffSearch}
                                    onChange={(e) => setStaffSearch(e.target.value)}
                                    className="search-input-inline"
                                />
                            </div>
                            <div className="selection-grid">
                                {users.filter(u => u.roleName === 'Staff' && 
                                    u.userName.toLowerCase().includes(staffSearch.toLowerCase())
                                ).map(user => {
                                    const isSelected = formData.staffIds.includes(Number(user.userId));
                                    return (
                                        <div 
                                            key={user.userId} 
                                            className={`selection-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => toggleSelection('staffIds', user.userId)}
                                        >
                                            <div className="card-content">
                                                <span className="card-name">{user.userName}</span>
                                                <button 
                                                    type="button"
                                                    className="info-btn" 
                                                    onClick={(e) => { e.stopPropagation(); handleShowStaffInfo(user); }}
                                                    title="View Details"
                                                >
                                                    <FaInfoCircle />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {users.filter(u => u.roleName === 'Staff' && 
                                    u.userName.toLowerCase().includes(staffSearch.toLowerCase())
                                ).length === 0 && <div className="text-gray-500 text-sm">No staff found</div>}
                            </div>
                        </div>
                    </div>

                    <div className="form-section full-width">
                        <h3 className="section-title"><FaClock /> Date & Time Selection</h3>
                        
                        {formData.venueId ? (
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
                                        {slots.length === 0 ? (
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
                                                            className={`slot-card ${booked ? 'disabled' : ''} ${selected ? 'selected' : ''}`}
                                                            onClick={() => !booked && toggleSlot(slot.slotId)}
                                                        >
                                                            <strong>{slot.slotName || `Slot ${slot.slotId}`}</strong>
                                                            <span className="slot-time">
                                                                {slot.startTime} - {slot.endTime}
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
                            <FaSave /> {loading ? 'Updating Event...' : 'Update Event'}
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
                                <span className="speaker-detail-label">Bio</span>
                                <span className="speaker-detail-value">{selectedSpeaker.speakerDecription || selectedSpeaker.speakerDescription || selectedSpeaker.bio || 'No biography available.'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showStaffModal && selectedStaff && (
                <div className="modal-overlay" onClick={() => setShowStaffModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Staff Details</h3>
                            <button className="close-modal-btn" onClick={() => setShowStaffModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="speaker-detail-row">
                                <span className="speaker-detail-label">Name</span>
                                <span className="speaker-detail-value">{selectedStaff.userName}</span>
                            </div>
                            <div className="speaker-detail-row">
                                <span className="speaker-detail-label">Email</span>
                                <span className="speaker-detail-value">{selectedStaff.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizerUpdateEventPage;
