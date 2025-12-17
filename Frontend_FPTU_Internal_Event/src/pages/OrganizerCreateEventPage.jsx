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
        // Date and Slot are handled separately by the calendar
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
            const [venuesRes, slotsRes, usersRes, speakersRes] = await Promise.all([
                axios.get('https://localhost:7047/api/Venue'),
                axios.get('https://localhost:7047/api/Slot'),
                axios.get('https://localhost:7047/api/User'),
                axios.get('https://localhost:7047/api/Speaker')
            ]);

            setVenues(venuesRes.data?.data ?? venuesRes.data ?? []);
            setSlots(slotsRes.data?.data ?? slotsRes.data ?? []);
            setUsers(usersRes.data?.data ?? usersRes.data ?? []);
            setSpeakers(speakersRes.data?.data ?? speakersRes.data ?? []);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load form data');
        }
    };

    const fetchEventsForAvailability = async () => {
        try {
            // Fetch all events to check for conflicts
            // In a real app, you might want to filter by date range (start/end of current month)
            const response = await axios.get('https://localhost:7047/api/Event');
            const events = response.data?.data ?? response.data ?? [];
            
            // Filter only Approved events as they block the slots
            // Assuming status 1 is Approved (adjust based on your API)
            // Or if the requirement is to show all booked slots regardless of status, remove filter
            const approvedEvents = events.filter(e => e.status === 1 || e.status === 'Approved'); 
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
        setSelectedDate(null); // Reset selection when changing month
        setSelectedSlotIds([]);
    };

    const isSlotBooked = (date, slotId) => {
        if (!formData.venueId) return false;
        
        const dateString = date.toISOString().split('T')[0];
        
        return existingEvents.some(event => {
            const eventDate = new Date(event.eventDay).toISOString().split('T')[0];
            // Check if date matches, venue matches, and slot matches
            // Note: event.slotId might be a single ID or array depending on backend. 
            // Assuming event has a single slotId based on typical structure, or check your API response.
            // If event spans multiple slots, logic needs adjustment.
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
            toast.warning("Cannot select past dates");
            return;
        }

        setSelectedDate(newDate);
        setSelectedSlotIds([]); // Reset slots when picking a new date
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
            toast.error("Please select a date and at least one slot");
            return;
        }

        if (!formData.venueId) {
            toast.error("Please select a venue");
            return;
        }

        setLoading(true);
        try {
            const userInfo = getUserInfo();
            
            // Construct payload
            // Note: Adjust payload structure to match your API exactly
            const payload = {
                eventName: formData.eventName,
                eventDescription: formData.eventDescription,
                eventDay: selectedDate.toISOString(), // Send ISO string
                maxTicketCount: parseInt(formData.maxTicketCount),
                organizerId: userInfo.userId,
                venueId: parseInt(formData.venueId),
                slotId: parseInt(selectedSlotIds[0]), // Assuming single slot for now
                speakerIds: formData.speakerIds.map(id => parseInt(id)),
                staffIds: formData.staffIds.map(id => parseInt(id)),
                status: 0 // Pending
            };

            await axios.post('https://localhost:7047/api/Event', payload);
            
            toast.success('Event created successfully!');
            navigate('/organizer/events');
        } catch (error) {
            console.error('Error creating event:', error);
            toast.error(error.response?.data?.message || 'Failed to create event');
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
                             date.getMonth() === selectedDate.getMonth();
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
                            <label>Event Name</label>
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
                            <label>Description</label>
                            <textarea
                                name="eventDescription"
                                className="form-control"
                                value={formData.eventDescription}
                                onChange={handleInputChange}
                                required
                                placeholder="Describe your event..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Max Tickets</label>
                            <input
                                type="number"
                                name="maxTicketCount"
                                className="form-control"
                                value={formData.maxTicketCount}
                                onChange={handleInputChange}
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    {/* Right Column: People & Venue */}
                    <div className="form-section">
                        <h3 className="section-title"><FaMapMarkerAlt /> Venue & Participants</h3>
                        
                        <div className="form-group">
                            <label>Venue</label>
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
                                        {venue.venueName} (Cap: {venue.capacity})
                                    </option>
                                ))}
                            </select>
                            {!formData.venueId && <small className="text-gray-500">Select a venue to see availability calendar</small>}
                        </div>

                        <div className="form-group">
                            <label>Speakers (Hold Ctrl to select multiple)</label>
                            <select
                                multiple
                                className="form-control h-32"
                                onChange={(e) => handleMultiSelectChange(e, 'speakerIds')}
                            >
                                {speakers.map(speaker => (
                                    <option key={speaker.speakerId} value={speaker.speakerId}>
                                        {speaker.speakerName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Staff (Hold Ctrl to select multiple)</label>
                            <select
                                multiple
                                className="form-control h-32"
                                onChange={(e) => handleMultiSelectChange(e, 'staffIds')}
                            >
                                {users.filter(u => u.roleName === 'Staff').map(user => (
                                    <option key={user.userId} value={user.userId}>
                                        {user.userName}
                                    </option>
                                ))}
                            </select>
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
                                                        <strong>Slot {slot.slotId}</strong>
                                                        <span className="slot-time">
                                                            {slot.startTime} - {slot.endTime}
                                                        </span>
                                                        {booked && <span className="text-xs text-red-500 block mt-1">Booked</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
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
                        <button type="button" className="btn-cancel" onClick={() => navigate('/organizer/events')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            <FaSave /> {loading ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrganizerCreateEventPage;
