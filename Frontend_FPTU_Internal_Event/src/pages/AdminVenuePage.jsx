import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SidebarAdmin from '../components/SidebarAdmin';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaFileExport, FaMapMarkerAlt, FaUsers, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../assets/css/AdminVenuePage.css';

const AdminVenuePage = () => {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [formData, setFormData] = useState({
        venueName: '',
        location: '',
        capacity: '',
        description: ''
    });

    // Mock data for initial display
    useEffect(() => {
        // TODO: Replace with actual API call
        setVenues([
            { venueId: 1, venueName: 'Hall A', location: 'Building A - Floor 1', capacity: 200, description: 'Large conference hall with modern equipment' },
            { venueId: 2, venueName: 'Room B1', location: 'Building B - Floor 1', capacity: 50, description: 'Small meeting room' },
            { venueId: 3, venueName: 'Auditorium', location: 'Main Building', capacity: 500, description: 'Main auditorium for large events' }
        ]);
    }, []);

    // Filter venues based on search
    const filteredVenues = venues.filter(venue =>
        venue.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle Add Venue
    const handleAddVenue = () => {
        setModalMode('add');
        setFormData({
            venueName: '',
            location: '',
            capacity: '',
            description: ''
        });
        setShowModal(true);
    };

    // Handle Edit Venue
    const handleEditVenue = (venue) => {
        setModalMode('edit');
        setSelectedVenue(venue);
        setFormData({
            venueName: venue.venueName,
            location: venue.location,
            capacity: venue.capacity,
            description: venue.description
        });
        setShowModal(true);
    };

    // Handle Delete Venue
    const handleDeleteVenue = async (venueId) => {
        if (window.confirm('Are you sure you want to delete this venue?')) {
            try {
                // TODO: Implement delete API call
                // await axios.delete(`https://localhost:7047/api/Venue?venueId=${venueId}`);
                
                setVenues(venues.filter(venue => venue.venueId !== venueId));
                toast.success('Venue deleted successfully!', {
                    position: 'top-right',
                    autoClose: 2000
                });
            } catch (error) {
                console.error('Error deleting venue:', error);
                toast.error('Failed to delete venue. Please try again.', {
                    position: 'top-right',
                    autoClose: 3000
                });
            }
        }
    };

    // Handle Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (modalMode === 'add') {
                // TODO: Implement add venue API call
                // const response = await axios.post('https://localhost:7047/api/Venue', formData);
                
                const newVenue = {
                    venueId: venues.length + 1,
                    ...formData,
                    capacity: parseInt(formData.capacity)
                };
                setVenues([...venues, newVenue]);
                
                toast.success('Venue created successfully!', {
                    position: 'top-right',
                    autoClose: 2000
                });
            } else {
                // TODO: Implement update venue API call
                // const response = await axios.put(`https://localhost:7047/api/Venue/${selectedVenue.venueId}`, formData);
                
                setVenues(venues.map(venue => 
                    venue.venueId === selectedVenue.venueId 
                        ? { ...venue, ...formData, capacity: parseInt(formData.capacity) }
                        : venue
                ));
                
                toast.success('Venue updated successfully!', {
                    position: 'top-right',
                    autoClose: 2000
                });
            }
            
            setShowModal(false);
            setFormData({
                venueName: '',
                location: '',
                capacity: '',
                description: ''
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Failed to save venue. Please try again.', {
                position: 'top-right',
                autoClose: 3000
            });
        }
    };

    // Handle Export
    const handleExport = () => {
        toast.info('Export functionality will be implemented', {
            position: 'top-right',
            autoClose: 2000
        });
    };

    return (
        <div className="admin-venue-page">
            <SidebarAdmin />
            
            <div className="venue-main-content">
                <div className="venue-container">
                    {/* Header */}
                    <div className="venue-header">
                        <h1>All Venues</h1>
                        <div className="venue-actions">
                            <button className="btn-export" onClick={handleExport}>
                                <FaFileExport /> Export
                            </button>
                            <button className="btn-add-venue" onClick={handleAddVenue}>
                                <FaPlus /> Add Venue
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="venue-toolbar">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search for venues"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Venue Cards Grid */}
                    {loading ? (
                        <div className="loading-container">
                            <p>Loading venues...</p>
                        </div>
                    ) : (
                        <div className="venue-grid">
                            {filteredVenues.map((venue) => (
                                <div key={venue.venueId} className="venue-card">
                                    <div className="venue-card-header">
                                        <div className="venue-icon">
                                            <FaBuilding />
                                        </div>
                                        <h3>{venue.venueName}</h3>
                                    </div>
                                    
                                    <div className="venue-card-body">
                                        <div className="venue-info-item">
                                            <FaMapMarkerAlt className="info-icon" />
                                            <span>{venue.location}</span>
                                        </div>
                                        <div className="venue-info-item">
                                            <FaUsers className="info-icon" />
                                            <span>Capacity: {venue.capacity}</span>
                                        </div>
                                        <p className="venue-description">{venue.description}</p>
                                    </div>
                                    
                                    <div className="venue-card-footer">
                                        <button 
                                            className="btn-edit-card"
                                            onClick={() => handleEditVenue(venue)}
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                        <button 
                                            className="btn-delete-card"
                                            onClick={() => handleDeleteVenue(venue.venueId)}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Venue Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Add New Venue' : 'Edit Venue'}</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Venue Name *</label>
                                <input
                                    type="text"
                                    value={formData.venueName}
                                    onChange={(e) => setFormData({...formData, venueName: e.target.value})}
                                    required
                                    placeholder="Enter venue name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Location *</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    required
                                    placeholder="e.g., Building A - Floor 1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Capacity *</label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                                    required
                                    min="1"
                                    placeholder="Enter capacity"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="4"
                                    placeholder="Enter venue description"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {modalMode === 'add' ? 'Add Venue' : 'Update Venue'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVenuePage;
