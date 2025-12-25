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
    const [showK19Modal, setShowK19Modal] = useState(false);
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        roleId: ''
    });
    const [k19FormData, setK19FormData] = useState({
        userName: '',
        email: '',
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

    // Handle Add Email (K19)
    const handleAddEmailK19 = () => {
        setK19FormData({
            userName: '',
            email: '',
            roleId: ''
        });
        setShowK19Modal(true);
    };

    // Handle Edit User
    const handleEditUser = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({
            userName: user.userName,
            email: user.email,
            password: '',
            roleId: getRoleIdFromName(user.roleName)
        });
        setShowModal(true);
    };

    // Helper function to get roleId from roleName
    const getRoleIdFromName = (roleName) => {
        const roleMap = {
            'Student': '3',
            'Staff': '2',
            'Organizer': '4',
            'Admin': '1'
        };
        return roleMap[roleName] || '';
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
        
        // Validate UserName for special characters
        const userNameRegex = /^[\p{L}0-9_ ]+$/u;
        if (!userNameRegex.test(formData.userName)) {
            toast.error('UserName cannot contain special characters (only letters, numbers, spaces, and underscore allowed)', {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }
        
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
                // Update User API - Admin can ONLY update UserName and RoleId
                const requestData = {
                    userName: formData.userName,
                    roleId: parseInt(formData.roleId)
                };

                const response = await axios.put(
                    `https://localhost:7047/api/User/update-profile-by-admin?userId=${selectedUser.userId}`,
                    requestData
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

    // Handle K19 Email Submit
    const handleK19Submit = async (e) => {
        e.preventDefault();
        
        try {
            const requestData = {
                userName: k19FormData.userName,
                email: k19FormData.email,
                roleId: parseInt(k19FormData.roleId)
            };

            const response = await axios.post('https://localhost:7047/api/User/add-email-for-k19', requestData);
            
            if (response.data.success) {
                toast.success('Email added successfully! User can now login via Google', {
                    position: 'top-right',
                    autoClose: 3000
                });
                
                // Refresh user list
                await fetchUsers();
                setShowK19Modal(false);
                setK19FormData({
                    userName: '',
                    email: '',
                    roleId: ''
                });
            } else {
                throw new Error(response.data.message || 'Failed to add email');
            }
        } catch (error) {
            console.error('Error adding K19 email:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to add email. Please try again.';
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 3000
            });
        }
    };

    return (
        <div className="admin-user-page">
            <SidebarAdmin />
            
            <div className="user-main-content">
                <div className="user-container">
                    <div className="user-header">
                        <h1>All users</h1>
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
                        <div className="toolbar-actions">
                            <button className="btn-export" onClick={handleExport}>
                                <FaFileExport /> Export
                            </button>
                            <button className="btn-add-email-k19" onClick={handleAddEmailK19}>
                                <FaPlus /> Add Email(K19)
                            </button>
                            <button className="btn-add-user" onClick={handleAddUser}>
                                <FaPlus /> Add user
                            </button>
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
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                    <tr key={user.userId}>
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

            {/* Add Email (K19) Modal */}
            {showK19Modal && (
                <div className="modal-overlay" onClick={() => setShowK19Modal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Email for K19 </h2>
                            <button className="btn-close" onClick={() => setShowK19Modal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div style={{
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffc107',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '20px',
                            fontSize: '13px',
                            color: '#856404'
                        }}>
                            <strong>Note: </strong>The username is temporary. When a user logs in via Google for the first time, 
                            The system will automatically update their real name from their Google account.
                        </div>
                        <form onSubmit={handleK19Submit}>
                            <div className="form-group">
                                <label>User Name (Temporary) *</label>
                                <input
                                    type="text"
                                    value={k19FormData.userName}
                                    onChange={(e) => setK19FormData({...k19FormData, userName: e.target.value})}
                                    required
                                    placeholder="Enter a temporary name (this will be replaced when you log in)"
                                />
                                <small style={{color: '#F36F21', fontSize: '12px', fontWeight: '500'}}>
                                    ⮕ This name will automatically change to the user's real name from Google when they log in for the first time.
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Email (FPTU Student Email) *</label>
                                <input
                                    type="email"
                                    value={k19FormData.email}
                                    onChange={(e) => setK19FormData({...k19FormData, email: e.target.value})}
                                    required
                                    placeholder="student@fpt.edu.vn"
                                />
                                <small style={{color: '#666', fontSize: '12px'}}>
                                    Users can only log in using Google OAuth with this email address (no password required).
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Role *</label>
                                <select
                                    value={k19FormData.roleId}
                                    onChange={(e) => setK19FormData({...k19FormData, roleId: e.target.value})}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="2">Student</option>
                                    <option value="3">Staff</option>
                                    <option value="4">Organizer</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowK19Modal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Add Email
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                    style={modalMode === 'edit' ? {backgroundColor: '#f5f5f5', cursor: 'not-allowed'} : {}}
                                />
                                {modalMode === 'edit' && (
                                    <small style={{color: '#F36F21', fontSize: '12px'}}>Email cannot be changed</small>
                                )}
                            </div>
                            {modalMode === 'add' && (
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        required
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Role *</label>
                                <select
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="3">Student</option>
                                    <option value="2">Staff</option>
                                    <option value="4">Organizer</option>
                                </select>
                            </div>
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