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
    const [users, setUsers] = useState([]); // For staff
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

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch events when month changes or venue changes to update availability
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
            const slotsData = slotsRes.data?. data ?? slotsRes.data ?? [];
            const usersData = usersRes.data?.data ?? usersRes.data ?? [];
            const speakersData = speakersRes.data?.data ?? speakersRes.data ??  [];

            setVenues(venuesData);
            setSlots(slotsData);
            setUsers(usersData);
            setSpeakers(speakersData);

            toast.success('Form data loaded successfully!', {
                position: 'top-right',
                autoClose:  1500
            });
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

    const fetchEventsForAvailability = async () => {
        try {
            const response = await axios.get('https://localhost:7047/api/Event');
            const events = response.data?.data ?? response.data ?? [];
            
            const approvedEvents = events.filter(e => e.status === 'Approve' || e.status === 'Approved' || e.status === 1); 
            setExistingEvents(approvedEvents);
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

    const handleMultiSelectChange = (e, field) => {
        const options = e.target.options;
        const values = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                values.push(options[i].value);
            }
        }
        setFormData(prev => ({
            ...prev,
            [field]: values
        }));
    };

    // Calendar Logic
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
        setSelectedDate(null);
        setSelectedSlotIds([]);
    };

    const isSlotBooked = (date, slotId) => {
        if (!formData.venueId) return false;
        
        const dateString = date.toISOString().split('T')[0];
        
        return existingEvents.some(event => {
            const eventDate = new Date(event.eventDay).toISOString().split('T')[0];
            return eventDate === dateString && 
                   event.venueId == formData.venueId && 
                   event.slotId == slotId;
        });
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        // Prevent selecting past dates
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
        
        // If single slot selection is required:
        setSelectedSlotIds([slotId]);
        
        // If multiple slots allowed per event (uncomment below and comment above):
        // if (selectedSlotIds.includes(slotId)) {
        //     setSelectedSlotIds(prev => prev.filter(id => id !== slotId));
        // } else {
        //     setSelectedSlotIds(prev => [...prev, slotId]);
        // }
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

        if (! formData.eventName. trim()) {
            toast.error("Please enter event name", {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        if (!formData.eventDescription.trim()) {
            toast. error("Please enter event description", {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        if (! formData.maxTicketCount || formData.maxTicketCount < 1) {
            toast.error("Please enter valid max ticket count", {
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
                eventDay: selectedDate.toISOString(),
                maxTicketCount: parseInt(formData. maxTicketCount),
                venueId: parseInt(formData.venueId),
                slotId: parseInt(selectedSlotIds[0]), // Backend chỉ nhận 1 slot
                speakerIds: formData.speakerIds.map(id => parseInt(id)),
                staffIds: formData.staffIds.map(id => parseInt(id))
            };

            console.log('Creating event with payload:', payload);

            const response = await axios.post('https://localhost:7047/api/Event', payload);
            
            if (response.data.success) {
                toast. success('Event created successfully!', {
                    position: 'top-right',
                    autoClose: 2000
                });
                
                // Navigate after short delay to show success message
                setTimeout(() => {
                    navigate('/organizer/events');
                }, 2000);
            } else {
                throw new Error(response.data.message || 'Failed to create event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            console.error('Error response:', error. response?.data);
            
            const errorMessage = 
                error.response?.data?.message || 
                error.response?.data?.title ||
                error.message || 
                'Failed to create event.  Please try again.';
            
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose:  4000
            });
        } finally {
            setLoading(false);
        }
    };

    // Render Calendar
    const renderCalendar = () => {
        const { days, firstDay } = getDaysInMonth(currentDate);
        const calendarDays = [];
        
        // Empty cells for days before start of month
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of month
        for (let day = 1; day <= days; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isSelected = selectedDate && 
                             date.getDate() === selectedDate.getDate() && 
                             date.getMonth() === selectedDate.getMonth()&&
                             date.getFullYear() === selectedDate.getFullYear();
            const isToday = new Date().toDateString() === date.toDateString();
            
            // Check availability summary for dots
            let hasBooked = false;
            let hasAvailable = false;
            
            if (formData.venueId) {
                slots.forEach(slot => {
                    if (isSlotBooked(date, slot.slotId)) {
                        hasBooked = true;
                    } else {
                        hasAvailable = true;
                    }
                });
            }

            calendarDays.push(
                <div 
                    key={day} 
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => handleDateClick(day)}
                >
                    <span className="day-number">{day}</span>
                    <div className="day-status-dots">
                        {hasBooked && <span className="status-dot booked" title="Has booked slots"></span>}
                        {hasAvailable && <span className="status-dot available" title="Has available slots"></span>}
                    </div>
                </div>
            );
        }

        return calendarDays;
    };

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
                    {/* Left Column: Basic Info */}
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

                    {/* Right Column: People & Venue */}
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
                                    <option key={venue.venueId} value={venue.venueId}>
                                        {venue.venueName} (Capacity: {venue.maxSeat || 0})
                                    </option>
                                ))}
                            </select>
                            {!formData.venueId && (<small className="text-gray-500">Select a venue to see availability calendar</small>)}
                        </div>

                        <div className="form-group">
                            <label>Speakers (Hold Ctrl to select multiple)</label>
                            <select
                                multiple
                                className="form-control h-32"
                                onChange={(e) => handleMultiSelectChange(e, 'speakerIds')}
                                value={formData.speakerIds}
                            >
                                {speakers.length === 0 ? (
                                    <option disabled>No speakers available</option>
                                ) : (
                                    speakers.map(speaker => (
                                        <option key={speaker.speakerId} value={speaker.speakerId}>
                                            {speaker.speakerName}
                                        </option>
                                    ))
                                )}
                            </select>
                            <small className="text-gray-500">
                                {formData.speakerIds.length} speaker(s) selected
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Staff (Hold Ctrl to select multiple)</label>
                            <select
                                multiple
                                className="form-control h-32"
                                onChange={(e) => handleMultiSelectChange(e, 'staffIds')}
                                value={formData.staffIds}
                            >
                                {users.filter(u => u.roleName === 'Staff').length === 0 ? (
                                    <option disabled>No staff available</option>
                                ) : (
                                    users.filter(u => u.roleName === 'Staff').map(user => (
                                        <option key={user.userId} value={user.userId}>
                                            {user.userName} - {user.email}
                                        </option>
                                    ))
                                )}
                            </select>
                            <small className="text-gray-500">
                                {formData.staffIds.length} staff member(s) selected
                            </small>
                        </div>
                    </div>

                    {/* Full Width: Calendar & Slot Selection */}
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
                                                    const selected = selectedSlotIds.includes(slot. slotId);
                                                    
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
                            <FaSave /> {loading ? 'Creating Event...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrganizerCreateEventPage;
