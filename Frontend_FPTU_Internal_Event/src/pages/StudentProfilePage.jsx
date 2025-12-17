import React, { useState, useEffect } from "react";
import axios from 'axios';
import "../assets/css/StudentProfilePage.css";
import SidebarStudent from "../components/SidebarStudent";
import { FaUser, FaEnvelope, FaUserTag, FaIdCard, FaEdit, FaSave, FaTimes, FaSync } from 'react-icons/fa';
import { getUserInfo } from '../utils/auth';
import { toast } from 'react-toastify';

const StudentProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [updating, setUpdating] = useState(false);
    const userInfo = getUserInfo();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            
            // ✅ API: Get user profile by userId
            const response = await axios.get(`https://localhost:7047/api/User/${userInfo.userId}`);
            
            const data = response.data?. data ?? response.data;
            
            if (data) {
                setProfile(data);
                setEditedName(data.userName);
                
                toast.success('Profile loaded successfully!', {
                    position: 'top-right',
                    autoClose: 1500
                });
            } else {
                throw new Error('No profile data received');
            }
        } catch (error) {
            console. error('Error fetching profile:', error);
            console.error('Error response:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                'Failed to load profile. ';
            
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditedName(profile.userName);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedName(profile. userName);
    };

    const handleSaveProfile = async () => {
        if (!editedName.trim()) {
            toast.error('User name cannot be empty!', {
                position: 'top-right',
                autoClose: 2000
            });
            return;
        }

        if (editedName.trim() === profile.userName) {
            toast.info('No changes detected', {
                position: 'top-right',
                autoClose:  2000
            });
            setIsEditing(false);
            return;
        }

        setUpdating(true);
        try {
            // ✅ API: Update user name
            // Backend expects: PUT /api/User?userId={id} with JSON string body
            const response = await axios. put(
                `https://localhost:7047/api/User?userId=${userInfo.userId}`,
                JSON.stringify(editedName. trim()),
                {
                    headers:  {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data?.success || response.status === 200) {
                // Update local profile
                setProfile({
                    ...profile,
                    userName: editedName.trim()
                });

                // Update localStorage
                localStorage.setItem('userName', editedName.trim());

                toast.success('Profile updated successfully!', {
                    position:  'top-right',
                    autoClose: 2000
                });

                setIsEditing(false);

                // Refresh profile from server
                await fetchProfile();
            } else {
                throw new Error(response.data?.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            console. error('Error response:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.title ||
                                error.message || 
                                'Failed to update profile.';
            
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 3000
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleRefresh = () => {
        fetchProfile();
    };

    return (
        <div className="student-profile-page">
            <SidebarStudent />
            
            <div className="profile-main">
                <div className="profile-content">
                    <div className="page-header">
                        <div>
                            <h1>My Profile</h1>
                            <p>Manage your account information</p>
                        </div>
                        <button 
                            className="btn-refresh" 
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            <FaSync className={loading ? 'spinning' : ''} /> Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <p>Loading profile...</p>
                        </div>
                    ) : profile ? (
                        <div className="profile-container">
                            {/* Profile Header Card */}
                            <div className="profile-header-card">
                                <div className="profile-avatar">
                                    <FaUser />
                                </div>
                                <div className="profile-header-info">
                                    {isEditing ? (
                                        <div className="edit-name-container">
                                            <input
                                                type="text"
                                                className="edit-name-input"
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                placeholder="Enter your name"
                                                disabled={updating}
                                                autoFocus
                                            />
                                            <div className="edit-actions">
                                                <button 
                                                    className="btn-save" 
                                                    onClick={handleSaveProfile}
                                                    disabled={updating}
                                                >
                                                    <FaSave /> {updating ? 'Saving...' : 'Save'}
                                                </button>
                                                <button 
                                                    className="btn-cancel" 
                                                    onClick={handleCancelEdit}
                                                    disabled={updating}
                                                >
                                                    <FaTimes /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h2>
                                                {profile.userName}
                                                <button 
                                                    className="btn-edit-inline" 
                                                    onClick={handleEditClick}
                                                    title="Edit name"
                                                >
                                                    <FaEdit />
                                                </button>
                                            </h2>
                                        </>
                                    )}
                                    <p className="profile-role-tag">{profile.roleName}</p>
                                    <p className="profile-email">{profile.email}</p>
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="profile-details-grid">
                                {/* Personal Information */}
                                <div className="profile-section">
                                    <h3 className="section-title">Personal Information</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <div className="info-label">
                                                <FaIdCard className="info-icon" />
                                                <span>User ID</span>
                                            </div>
                                            <div className="info-value">{profile.userId}</div>
                                        </div>

                                        <div className="info-item">
                                            <div className="info-label">
                                                <FaUser className="info-icon" />
                                                <span>User Name</span>
                                            </div>
                                            <div className="info-value">{profile.userName}</div>
                                        </div>

                                        <div className="info-item">
                                            <div className="info-label">
                                                <FaEnvelope className="info-icon" />
                                                <span>Email</span>
                                            </div>
                                            <div className="info-value">{profile.email}</div>
                                        </div>

                                        <div className="info-item">
                                            <div className="info-label">
                                                <FaUserTag className="info-icon" />
                                                <span>Role</span>
                                            </div>
                                            <div className="info-value">
                                                <span className="role-badge">{profile.roleName}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div className="profile-section">
                                    <h3 className="section-title">Account Information</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <div className="info-label">
                                                <span>Account Status</span>
                                            </div>
                                            <div className="info-value">
                                                <span className="status-badge status-active">Active</span>
                                            </div>
                                        </div>

                                        <div className="info-item">
                                            <div className="info-label">
                                                <span>Role ID</span>
                                            </div>
                                            <div className="info-value">{profile.roleId}</div>
                                        </div>
                                    </div>

                                    <div className="info-note">
                                        <p><strong>Note:</strong> You can only update your display name.  Email and role cannot be changed.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-data">
                            <p>No profile data available</p>
                            <button className="btn-retry" onClick={handleRefresh}>
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentProfilePage;
