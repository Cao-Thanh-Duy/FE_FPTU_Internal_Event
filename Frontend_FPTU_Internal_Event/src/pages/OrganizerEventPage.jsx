import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { FaPlus, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../assets/css/OrganizerEventPage.css';

const OrganizerEventPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [venues, setVenues] = useState([]);
    const [slots, setSlots] = useState([]);
    const [users, setUsers] = useState([]);
    const [speakers, setSpeakers] = useState([]);
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
        fetchVenues();
        fetchSlots();
        fetchUsers();
        fetchSpeakers();
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const requestData = {
                eventName: formData.eventName,
                eventDescription: formData.eventDescription,
                eventDate: formData.eventDate,
                maxTicketCount: parseInt(formData.maxTicketCount),
                venueId: parseInt(formData.venueId),
                speakerIds: formData.speakerIds,
                slotIds: formData.slotIds,
                staffIds: formData.staffIds
            };

            console.log('Request data:', requestData);

            const response = await axios.post('https://localhost:7047/api/Event', requestData);
            
            if (response.data?.success || response.status === 201 || response.status === 200) {
                toast.success('Event created successfully!', {
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
            } else {
                throw new Error(response.data?.message || 'Failed to create event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Failed to create event.';
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

                    <div className="welcome-card">
                        <FaCalendarAlt className="welcome-icon" />
                        <h2>Welcome to Event Management</h2>
                        <p>Create and manage your events here. Click "Create New Event" to get started.</p>
                    </div>
                </div>
            </div>

            {/* Create Event Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Event</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}>
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
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Create Event
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
