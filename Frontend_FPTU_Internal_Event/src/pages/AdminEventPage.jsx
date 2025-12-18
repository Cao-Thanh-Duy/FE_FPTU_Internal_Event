import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SidebarAdmin from '../components/SidebarAdmin';
import { FaSearch, FaCheck, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaMicrophone, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../assets/css/AdminEventPage.css';

const AdminEventPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
    const [sortOrder, setSortOrder] = useState('nearest'); // nearest, farthest
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSpeaker, setSelectedSpeaker] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://localhost:7047/api/Event');
            const data = response.data?.data ?? response.data;
            
            if (Array.isArray(data)) {
                setEvents(data);
                toast.success('Events loaded successfully!', {
                    position: 'top-right',
                    autoClose: 1500
                });
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load events.', {
                position: 'top-right',
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (eventId) => {
        if (window.confirm('Are you sure you want to approve this event?')) {
            try {
                const response = await axios.put(`https://localhost:7047/Approve?eventId=${eventId}`);
                
                if (response.data?.success || response.status === 200) {
                    toast.success('Event approved successfully!', {
                        position: 'top-right',
                        autoClose: 2000
                    });
                    await fetchEvents();
                } else {
                    throw new Error(response.data?.message || 'Failed to approve event');
                }
            } catch (error) {
                console.error('Error approving event:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to approve event.';
                toast.error(errorMessage, {
                    position: 'top-right',
                    autoClose: 3000
                });
            }
        }
    };

    const handleReject = async (eventId) => {
        if (window.confirm('Are you sure you want to reject this event?')) {
            try {
                const response = await axios.put(`https://localhost:7047/Reject?eventId=${eventId}`);
                
                if (response.data?.success || response.status === 200) {
                    toast.success('Event rejected successfully!', {
                        position: 'top-right',
                        autoClose: 2000
                    });
                    await fetchEvents();
                } else {
                    throw new Error(response.data?.message || 'Failed to reject event');
                }
            } catch (error) {
                console.error('Error rejecting event:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to reject event.';
                toast.error(errorMessage, {
                    position: 'top-right',
                    autoClose: 3000
                });
            }
        }
    };

    const openSpeakerModal = (speaker) => {
        setSelectedSpeaker(speaker);
        setModalOpen(true);
    };

    const closeSpeakerModal = () => {
        setModalOpen(false);
        setSelectedSpeaker(null);
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = 
            event.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.eventDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.venueName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = 
            filterStatus === 'all' ||
            (filterStatus === 'pending' && event.status === 'Pending') ||
            (filterStatus === 'approved' && (event.status === 'Approved' || event.status === 'Approve')) ||
            (filterStatus === 'rejected' && (event.status === 'Rejected' || event.status === 'Reject'));
        
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        const dateA = new Date(a.eventDay);
        const dateB = new Date(b.eventDay);
        return sortOrder === 'nearest' ? dateA - dateB : dateB - dateA;
    });

    const getStatusBadge = (status) => {
        const statusClasses = {
            'Pending': 'status-pending',
            'Approved': 'status-approved',
            'Approve': 'status-approved',
            'Rejected': 'status-rejected',
            'Reject': 'status-rejected'
        };
        return statusClasses[status] || 'status-pending';
    };

    return (
        <div className="admin-event-page">
            <SidebarAdmin />
            
            <div className="event-main-content">
                <div className="event-container">
                    <div className="event-header">
                        <h1>Event Management</h1>
                    </div>

                    <div className="event-toolbar">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search events..."
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
                                All
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
                        <div className="loading-container">
                            <p>Loading events...</p>
                        </div>
                    ) : (
                        <div className="events-grid">
                            {filteredEvents.length === 0 ? (
                                <div className="no-events">
                                    <p>No events found</p>
                                </div>
                            ) : (
                                filteredEvents.map((event) => (
                                    <div key={event.eventId} className="event-card">
                                        <div className="event-card-header">
                                            <h3>{event.eventName}</h3>
                                            <span className={`status-badge ${getStatusBadge(event.status)}`}>
                                                {event.status || 'Pending'}
                                            </span>
                                        </div>
                                        
                                        <div className="event-card-body">
                                            <p className="event-description">{event.eventDescription}</p>
                                            
                                            <div className="event-details">
                                                <div className="detail-item">
                                                    <FaCalendarAlt className="detail-icon" />
                                                    <span>{event.eventDay ? new Date(event.eventDay).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <FaMapMarkerAlt className="detail-icon" />
                                                    <span>{event.venueName || 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <FaUsers className="detail-icon" />
                                                    <span>Max: {event.maxTickerCount || 0} tickets</span>
                                                </div>
                                            </div>

                                            {event.slotEvent && event.slotEvent.length > 0 && (
                                                <div className="event-slots">
                                                    <FaClock className="detail-icon" />
                                                    <span className="slots-label">Slots:</span>
                                                    <div className="slot-tags">
                                                        {event.slotEvent.map((slot, idx) => (
                                                            <span key={idx} className="slot-tag">{slot.slotName} ({slot.startTime}-{slot.endTime})</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {event.speakerEvent && event.speakerEvent.length > 0 && (
                                                <div className="event-speakers">
                                                    <FaMicrophone className="detail-icon" />
                                                    <span className="speakers-label">Speakers:</span>
                                                    <div className="speaker-list">
                                                        {event.speakerEvent.map((speaker, idx) => (
                                                            <div key={idx} className="speaker-item">
                                                                <span 
                                                                    className="speaker-name clickable" 
                                                                    onClick={() => openSpeakerModal(speaker)}
                                                                    style={{ cursor: 'pointer', textDecoration: 'underline', color: '#007bff' }}
                                                                >
                                                                    {speaker.speakerName}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {event.status === 'Pending' && (
                                            <div className="event-card-footer">
                                                <button 
                                                    className="btn-approve"
                                                    onClick={() => handleApprove(event.eventId)}
                                                >
                                                    <FaCheck /> Approve
                                                </button>
                                                <button 
                                                    className="btn-reject"
                                                    onClick={() => handleReject(event.eventId)}
                                                >
                                                    <FaTimes /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {modalOpen && selectedSpeaker && (
                <div className="modal-overlay" onClick={closeSpeakerModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Speaker Information</h2>
                            <button className="modal-close" onClick={closeSpeakerModal}>
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
        </div>
    );
};

export default AdminEventPage;
