import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../assets/css/OrganizerSpeakerPage.css';

const OrganizerSpeakerPage = () => {
    const [speakers, setSpeakers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState(null);
    const [formData, setFormData] = useState({
        speakerName: '',
        speakerDecription: '' // Lưu ý: API có typo "Decription"
    });

    useEffect(() => {
        fetchSpeakers();
    }, []);

    const fetchSpeakers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://localhost:7047/api/Speaker');
            const data = response.data?.data ?? response.data;
            
            if (Array.isArray(data)) {
                setSpeakers(data);
            }
        } catch (error) {
            console.error('Error fetching speakers:', error);
            toast.error('Failed to load speakers.', {
                position: 'top-right',
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setCurrentSpeaker(null);
        setFormData({
            speakerName: '',
            speakerDecription: ''
        });
        setShowModal(true);
    };

    const handleOpenEditModal = async (speaker) => {
        setIsEditMode(true);
        setCurrentSpeaker(speaker);
        
        // Lấy chi tiết speaker nếu cần
        try {
            const response = await axios.get(`https://localhost:7047/api/Speaker/${speaker.speakerId}`);
            const speakerData = response.data?.data ?? response.data;
            
            setFormData({
                speakerName: speakerData.speakerName || speaker.speakerName,
                speakerDecription: speakerData.speakerDescription || speaker.speakerDescription || ''
            });
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            // Nếu API get by id không hoạt động, dùng dữ liệu từ list
            setFormData({
                speakerName: speaker.speakerName,
                speakerDecription: speaker.speakerDescription || ''
            });
        }
        
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditMode(false);
        setCurrentSpeaker(null);
        setFormData({
            speakerName: '',
            speakerDecription: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.speakerName.trim()) {
            toast.error('Speaker name is required!', {
                position: 'top-right',
                autoClose: 2000
            });
            return;
        }

        try {
            if (isEditMode && currentSpeaker) {
                // Update speaker - Lưu ý API có typo "Decripton" (thiếu 'i')
                const updateData = {
                    speakerName: formData.speakerName,
                    speakerDecripton: formData.speakerDecription // API typo
                };
                
                await axios.put(
                    `https://localhost:7047/api/Speaker?speakerId=${currentSpeaker.speakerId}`,
                    updateData
                );
                
                toast.success('Speaker updated successfully!', {
                    position: 'top-right',
                    autoClose: 2000
                });
            } else {
                // Add new speaker
                const createData = {
                    speakerName: formData.speakerName,
                    speakerDecription: formData.speakerDecription // API typo
                };
                
                await axios.post('https://localhost:7047/api/Speaker', createData);
                
                toast.success('Speaker created successfully!', {
                    position: 'top-right',
                    autoClose: 2000
                });
            }
            
            handleCloseModal();
            await fetchSpeakers();
        } catch (error) {
            console.error('Error saving speaker:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save speaker.';
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 3000
            });
        }
    };

    const handleDelete = async (speakerId, speakerName) => {
        if (window.confirm(`Are you sure you want to delete speaker "${speakerName}"?`)) {
            try {
                await axios.delete(`https://localhost:7047/api/Speaker?speakerId=${speakerId}`);
                
                toast.success('Speaker deleted successfully!', {
                    position: 'top-right',
                    autoClose: 2000
                });
                
                await fetchSpeakers();
            } catch (error) {
                console.error('Error deleting speaker:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to delete speaker.';
                toast.error(errorMessage, {
                    position: 'top-right',
                    autoClose: 3000
                });
            }
        }
    };

    const filteredSpeakers = speakers.filter(speaker =>
        speaker.speakerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        speaker.speakerDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="organizer-speaker-page">
            <Header />
            
            <div className="speaker-content">
                <div className="speaker-container">
                    <div className="speaker-header">
                        <h1>Speaker Management</h1>
                        <p>Manage your event speakers</p>
                    </div>

                    <div className="speaker-toolbar">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search speakers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-add" onClick={handleOpenAddModal}>
                            <FaPlus /> Add Speaker
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <p>Loading speakers...</p>
                        </div>
                    ) : (
                        <div className="speakers-grid">
                            {filteredSpeakers.length === 0 ? (
                                <div className="no-speakers">
                                    <FaUser className="no-data-icon" />
                                    <p>No speakers found</p>
                                </div>
                            ) : (
                                filteredSpeakers.map((speaker) => (
                                    <div key={speaker.speakerId} className="speaker-card">
                                        <div className="speaker-card-header">
                                            <div className="speaker-avatar">
                                                <FaUser />
                                            </div>
                                            <h3>{speaker.speakerName}</h3>
                                        </div>
                                        
                                        <div className="speaker-card-body">
                                            <p className="speaker-description">
                                                {speaker.speakerDescription || 'No description provided'}
                                            </p>
                                        </div>
                                        
                                        <div className="speaker-card-footer">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleOpenEditModal(speaker)}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(speaker.speakerId, speaker.speakerName)}
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Add/Edit Speaker */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditMode ? 'Edit Speaker' : 'Add New Speaker'}</h2>
                            <button className="btn-close" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="speaker-form">
                            <div className="form-group">
                                <label htmlFor="speakerName">Speaker Name *</label>
                                <input
                                    type="text"
                                    id="speakerName"
                                    value={formData.speakerName}
                                    onChange={(e) => setFormData({...formData, speakerName: e.target.value})}
                                    placeholder="Enter speaker name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="speakerDescription">Description</label>
                                <textarea
                                    id="speakerDescription"
                                    value={formData.speakerDecription}
                                    onChange={(e) => setFormData({...formData, speakerDecription: e.target.value})}
                                    placeholder="Enter speaker description"
                                    rows="4"
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {isEditMode ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default OrganizerSpeakerPage;
