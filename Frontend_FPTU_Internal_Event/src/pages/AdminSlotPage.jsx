import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SidebarAdmin from '../components/SidebarAdmin';
import { FaSearch, FaPlus, FaFileExport, FaEye, FaTimes, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../assets/css/AdminSlotPage.css';

const AdminSlotPage = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', or 'view'
    const [, setSelectedSlot] = useState(null);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [formData, setFormData] = useState({
        slotName: '',
        startTime: '',
        endTime: ''
    });

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://localhost:7047/api/Slot');

            // support APIs that return { success, data } or just an array
            const data = response.data?.data ?? response.data;

            if (Array.isArray(data)) {
                setSlots(data);
                toast.success('Slots loaded successfully!', { position: 'top-right', autoClose: 1500 });
            } else {
                setSlots([]);
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
            toast.error('Failed to load slots. Please try again.', { position: 'top-right', autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const filteredSlots = slots.filter((s) =>
        s.slotName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.startTime ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.endTime ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddSlot = () => {
        setModalMode('add');
        setFormData({ slotName: '', startTime: '', endTime: '' });
        setShowModal(true);
    };

    const handleViewSlot = async (slotId) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://localhost:7047/api/Slot/${slotId}`);
            const data = response.data?.data ?? response.data;
            setSelectedSlot(data);
            setFormData({
                slotName: data.slotName ?? '',
                startTime: data.startTime ?? '',
                endTime: data.endTime ?? ''
            });
            setModalMode('view');
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching slot details:', error);
            toast.error('Failed to load slot details.', { position: 'top-right', autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const handleEditSlot = async (slotId) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://localhost:7047/api/Slot/${slotId}`);
            const data = response.data?.data ?? response.data;
            setSelectedSlot(data);
            setSelectedSlotId(slotId);
            setFormData({
                slotName: data.slotName ?? '',
                startTime: data.startTime ?? '',
                endTime: data.endTime ?? ''
            });
            setModalMode('edit');
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching slot details:', error);
            toast.error('Failed to load slot details.', { position: 'top-right', autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert time format from HH:mm to HH:mm:ss if needed
            const formatTime = (time) => {
                if (!time) return '';
                return time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;
            };

            const requestData = {
                slotName: formData.slotName,
                startTime: formatTime(formData.startTime),
                endTime: formatTime(formData.endTime)
            };

            console.log('Request data:', requestData); // Debug log

            if (modalMode === 'add') {
                const response = await axios.post('https://localhost:7047/api/Slot', requestData);
                if (response.data?.success || response.status === 201 || response.status === 200) {
                    toast.success('Slot created successfully!', { position: 'top-right', autoClose: 1500 });
                    await fetchSlots();
                } else {
                    throw new Error(response.data?.message || 'Failed to create slot');
                }
            } else if (modalMode === 'edit') {
                const response = await axios.put(`https://localhost:7047/api/Slot?slotId=${selectedSlotId}`, requestData);
                if (response.data?.success || response.status === 200) {
                    toast.success('Slot updated successfully!', { position: 'top-right', autoClose: 1500 });
                    await fetchSlots();
                } else {
                    throw new Error(response.data?.message || 'Failed to update slot');
                }
            }

            setShowModal(false);
            setFormData({ slotName: '', startTime: '', endTime: '' });
            setSelectedSlotId(null);
        } catch (error) {
            console.error(`Error ${modalMode === 'edit' ? 'updating' : 'creating'} slot:`, error);
            console.error('Error response:', error.response?.data); // Debug log
            const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || `Failed to ${modalMode === 'edit' ? 'update' : 'save'} slot.`;
            toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (window.confirm('Are you sure you want to delete this slot?')) {
            try {
                const response = await axios.delete(`https://localhost:7047/api/Slot?slotId=${slotId}`);
                
                if (response.data?.success || response.status === 200 || response.status === 204) {
                    toast.success('Slot deleted successfully!', {
                        position: 'top-right',
                        autoClose: 2000
                    });
                    
                    // Refresh slot list
                    await fetchSlots();
                } else {
                    throw new Error(response.data?.message || 'Failed to delete slot');
                }
            } catch (error) {
                console.error('Error deleting slot:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to delete slot. Please try again.';
                toast.error(errorMessage, {
                    position: 'top-right',
                    autoClose: 3000
                });
            }
        }
    };

    const handleExport = () => {
        toast.info('Export functionality will be implemented with backend API', { position: 'top-right', autoClose: 2000 });
    };

    return (
        <div className="admin-slot-page">
            <SidebarAdmin />

            <div className="slot-main-content">
                <div className="slot-container">
                    <div className="slot-header">
                        <h1>All slots</h1>
                        <div className="slot-actions">
                            <button className="btn-export" onClick={handleExport}><FaFileExport /> Export</button>
                            <button className="btn-add-slot" onClick={handleAddSlot}><FaPlus /> Add slot</button>
                        </div>
                    </div>

                    <div className="slot-toolbar">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search for slots"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container"><p>Loading slots...</p></div>
                    ) : (
                        <div className="slot-table-container">
                            <table className="slot-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>NAME</th>
                                        <th>START TIME</th>
                                        <th>END TIME</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSlots.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No slots found</td>
                                        </tr>
                                    ) : (
                                        filteredSlots.map((slot) => (
                                            <tr key={slot.slotId ?? slot.id ?? slot.slotName}>
                                                <td>{slot.slotId ?? slot.id}</td>
                                                <td>{slot.slotName}</td>
                                                <td>{slot.startTime}</td>
                                                <td>{slot.endTime}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="btn-view" onClick={() => handleViewSlot(slot.slotId ?? slot.id)}>
                                                            <FaEye /> View
                                                        </button>
                                                        <button className="btn-edit" onClick={() => handleEditSlot(slot.slotId ?? slot.id)}>
                                                            <FaEdit /> Edit
                                                        </button>
                                                        <button className="btn-delete" onClick={() => handleDeleteSlot(slot.slotId ?? slot.id)}>
                                                            <FaTrash /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Add New Slot' : modalMode === 'edit' ? 'Edit Slot' : 'Slot Details'}</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Slot Name *</label>
                                <input
                                    type="text"
                                    value={formData.slotName}
                                    onChange={(e) => setFormData({ ...formData, slotName: e.target.value })}
                                    required
                                    disabled={modalMode === 'view'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Start Time *</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                    disabled={modalMode === 'view'}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Time *</label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    required
                                    disabled={modalMode === 'view'}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                {modalMode === 'add' && <button type="submit" className="btn-submit">Add Slot</button>}
                                {modalMode === 'edit' && <button type="submit" className="btn-submit">Update Slot</button>}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSlotPage;
