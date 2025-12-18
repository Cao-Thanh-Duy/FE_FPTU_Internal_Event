import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { FaUser, FaEnvelope, FaUserTag, FaIdCard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getUserInfo } from '../utils/auth';
import '../assets/css/OrganizerProfilePage.css';

const OrganizerProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const userInfo = getUserInfo();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://localhost:7047/api/User/${userInfo.userId}`);
            const data = response.data?.data ?? response.data;
            
            setProfile(data);
            toast.success('Profile loaded successfully!', {
                position: 'top-right',
                autoClose: 1500
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile.', {
                position: 'top-right',
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="organizer-profile-page">
            <Header />
            
            <div className="profile-main">
                <div className="profile-content">
                    <div className="page-header">
                        <div>
                            <h1>My Profile</h1>
                            <p>Manage your account information</p>
                        </div>
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
                                    <h2>{profile.userName}</h2>
                                    <p className="profile-role-tag">{profile.roleName}</p>
                                    <p className="profile-email">{profile.email}</p>
                                    
                                    {/* Personal Information inside card */}
                                    <div className="info-grid-inline">
                                        <div className="info-item-inline">
                                            <div className="info-label-inline">
                                                <FaIdCard className="info-icon-inline" />
                                                <span>User ID</span>
                                            </div>
                                            <div className="info-value-inline">{profile.userId}</div>
                                        </div>

                                        <div className="info-item-inline">
                                            <div className="info-label-inline">
                                                <FaUser className="info-icon-inline" />
                                                <span>User Name</span>
                                            </div>
                                            <div className="info-value-inline">{profile.userName}</div>
                                        </div>

                                        <div className="info-item-inline">
                                            <div className="info-label-inline">
                                                <FaEnvelope className="info-icon-inline" />
                                                <span>Email</span>
                                            </div>
                                            <div className="info-value-inline">{profile.email}</div>
                                        </div>

                                        <div className="info-item-inline">
                                            <div className="info-label-inline">
                                                <FaUserTag className="info-icon-inline" />
                                                <span>Role</span>
                                            </div>
                                            <div className="info-value-inline">
                                                <span className="role-badge-inline">{profile.roleName}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-data">
                            <p>No profile data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizerProfilePage;
