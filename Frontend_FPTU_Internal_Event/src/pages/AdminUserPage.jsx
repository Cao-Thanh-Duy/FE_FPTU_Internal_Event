import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SidebarAdmin from '../components/SidebarAdmin';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaFileExport } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../assets/css/AdminUserPage.css';

const AdminUserPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        roleId: ''
    });

    // Fetch all users from API
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://localhost:7047/api/User');
            
            if (response.data.success) {
                setUsers(response.data.data);
                toast.success('Users loaded successfully!', {
                    position: 'top-right',
                    autoClose: 2000
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users. Please try again.', {
                position: 'top-right',
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roleName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle Add User
    const handleAddUser = () => {
        setModalMode('add');
        setFormData({
            userName: '',
            email: '',
            password: '',
            roleId: ''
        });
        setShowModal(true);
    };

    // Handle Edit User
    const handleEditUser = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({
            userName: user.userName,
            email: user.email,
            password: '',
            roleId: user.roleId || ''
        });
        setShowModal(true);
    };

    // Handle Delete User
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                // Delete User API
                const response = await axios.delete(`https://localhost:7047/api/User?userId=${userId}`);
                
                if (response.data.success || response.status === 200) {
                    toast.success('User deleted successfully!', {
                        position: 'top-right',
                        autoClose: 2000
                    });
                    
                    // Refresh user list
                    await fetchUsers();
                } else {
                    throw new Error(response.data.message || 'Failed to delete user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user. Please try again.';
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
            if (modalMode === 'add') {
                // Create User API
                const requestData = {
                    userName: formData.userName,
                    email: formData.email,
                    password: formData.password,
                    roleId: parseInt(formData.roleId)
                };

                const response = await axios.post('https://localhost:7047/api/User', requestData);
                
                if (response.data.success) {
                    toast.success('User created successfully!', {
                        position: 'top-right',
                        autoClose: 2000
                    });
                    
                    // Refresh user list
                    await fetchUsers();
                } else {
                    throw new Error(response.data.message || 'Failed to create user');
                }
            } else {
                // Update User API - only userName can be updated
                const response = await axios.put(
                    `https://localhost:7047/api/User?userId=${selectedUser.userId}`,
                    JSON.stringify(formData.userName),
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (response.data.success || response.status === 200) {
                    toast.success('User updated successfully!', {
                        position: 'top-right',
                        autoClose: 2000
                    });
                    
                    // Refresh user list
                    await fetchUsers();
                } else {
                    throw new Error(response.data.message || 'Failed to update user');
                }
            }
            
            setShowModal(false);
            setFormData({
                userName: '',
                email: '',
                password: '',
                roleId: ''
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save user. Please try again.';
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 3000
            });
        }
    };

    // Handle Export (placeholder)
    const handleExport = () => {
        toast.info('Export functionality will be implemented with backend API', {
            position: 'top-right',
            autoClose: 2000
        });
    };

    return (
        <div className="admin-user-page">
            <SidebarAdmin />
            
            <div className="user-main-content">
                <div className="user-container">
                    <div className="user-header">
                        <h1>All users</h1>
                        <div className="user-actions">
                            <button className="btn-export" onClick={handleExport}>
                                <FaFileExport /> Export
                            </button>
                            <button className="btn-add-user" onClick={handleAddUser}>
                                <FaPlus /> Add user
                            </button>
                        </div>
                    </div>

                    <div className="user-toolbar">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search for users"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <p>Loading users...</p>
                        </div>
                    ) : (
                    <div className="user-table-container">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input type="checkbox" />
                                    </th>
                                    <th>USER ID</th>
                                    <th>NAME</th>
                                    <th>EMAIL</th>
                                    <th>ROLE</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                    <tr key={user.userId}>
                                        <td>
                                            <input type="checkbox" />
                                        </td>
                                        <td>{user.userId}</td>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar-placeholder">
                                                    {user.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="user-details">
                                                    <span className="user-name">{user.userName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className="role-badge">
                                                {user.roleName}
                                            </span>
                                        </td>
                                        <td>
                                            {user.roleName !== 'Admin' && (
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-edit"
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        <FaEdit /> Edit user
                                                    </button>
                                                    <button 
                                                        className="btn-delete"
                                                        onClick={() => handleDeleteUser(user.userId)}
                                                    >
                                                        <FaTrash /> Delete user
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </div>
            </div>

            {/* Add/Edit User Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>User Name *</label>
                                <input
                                    type="text"
                                    value={formData.userName}
                                    onChange={(e) => setFormData({...formData, userName: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                    disabled={modalMode === 'edit'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required={modalMode === 'add'}
                                    disabled={modalMode === 'edit'}
                                    placeholder={modalMode === 'edit' ? 'Cannot be changed' : ''}
                                />
                            </div>
                            {modalMode === 'add' && (
                                <div className="form-group">
                                    <label>Role *</label>
                                    <select
                                        value={formData.roleId}
                                        onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        <option value="1">Admin</option>
                                        <option value="2">Student</option>
                                        <option value="3">Staff</option>
                                        <option value="4">Organizer</option>
                                    </select>
                                </div>
                            )}
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {modalMode === 'add' ? 'Add User' : 'Update User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserPage;