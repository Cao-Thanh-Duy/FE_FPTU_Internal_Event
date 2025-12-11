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
        locationDetails: '',
        maxSeat: ''
    });

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://localhost:7047/api/Venue');
            const data = response.data?.data ?? response.data;
            
            if (Array.isArray(data)) {
                setVenues(data);
                toast.success('Venues loaded successfully!', {
                    position: 'top-right',
                    autoClose: 1500
                });
            }
        } catch (error) {
            console.error('Error fetching venues:', error);
            toast.error('Failed to load venues.', {
                position: 'top-right',
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    // Filter venues based on search
    const filteredVenues = venues.filter(venue =>
        venue.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (venue.locationDetails || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle Add Venue
    const handleAddVenue = () => {
        setModalMode('add');
        setFormData({
            venueName: '',
            locationDetails: '',
            maxSeat: ''
        });
        setShowModal(true);
    };

    // Handle Edit Venue
    const handleEditVenue = (venue) => {
        setModalMode('edit');
        setSelectedVenue(venue);
        setFormData({
            venueName: venue.venueName,
            locationDetails: venue.locationDetails,
            maxSeat: venue.maxSeat
        });
        setShowModal(true);
    };

    // Handle Delete Venue
    const handleDeleteVenue = async (venueId) => {
        if (window.confirm('Are you sure you want to delete this venue?')) {
            try {
                const response = await axios.delete(`https://localhost:7047/api/Venue?venueId=${venueId}`);
                
                if (response.data?.success || response.status === 200 || response.status === 204) {
                    toast.success('Venue deleted successfully!', {
                        position: 'top-right',
                        autoClose: 2000
                    });
                    await fetchVenues();
                } else {
                    throw new Error(response.data?.message || 'Failed to delete venue');
                }
            } catch (error) {
                console.error('Error deleting venue:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to delete venue.';
                toast.error(errorMessage, {
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
            const requestData = {
                venueName: formData.venueName,
                maxSeat: parseInt(formData.maxSeat),
                locationDetails: formData.locationDetails
            };

            if (modalMode === 'add') {
                const response = await axios.post('https://localhost:7047/api/Venue', requestData);
                
                if (response.data?.success || response.status === 201 || response.status === 200) {
                    toast.success('Venue created successfully!', {
                        position: 'top-right',
                        autoClose: 2000
                    });
                    await fetchVenues();
                } else {
                    throw new Error(response.data?.message || 'Failed to create venue');
                }
            } else {
                const response = await axios.put(
                    `https://localhost:7047/api/Venue?venueId=${selectedVenue.venueId}`,
                    requestData
                );
                
                if (response.data?.success || response.status === 200) {
                    toast.success('Venue updated successfully!', {
                        position: 'top-right',
                        autoClose: 2000
                    });
                    await fetchVenues();
                } else {
                    throw new Error(response.data?.message || 'Failed to update venue');
                }
            }
            
            setShowModal(false);
            setFormData({
                venueName: '',
                locationDetails: '',
                maxSeat: ''
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save venue.';
            toast.error(errorMessage, {
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
                                            <span>{venue.locationDetails}</span>
                                        </div>
                                        <div className="venue-info-item">
                                            <FaUsers className="info-icon" />
                                            <span>Capacity: {venue.maxSeat}</span>
                                        </div>
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
                                <label>Location Details *</label>
                                <input
                                    type="text"
                                    value={formData.locationDetails}
                                    onChange={(e) => setFormData({...formData, locationDetails: e.target.value})}
                                    required
                                    placeholder="e.g., Building A - Floor 1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Max Seat *</label>
                                <input
                                    type="number"
                                    value={formData.maxSeat}
                                    onChange={(e) => setFormData({...formData, maxSeat: e.target.value})}
                                    required
                                    min="1"
                                    placeholder="Enter maximum seats"
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
