import React, { useState } from "react";
import "../assets/css/StudentProfilePage.css";
import SidebarStudent from "../components/SidebarStudent";
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaGraduationCap, FaCalendar, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { getUserInfo } from '../utils/auth';
import { toast } from 'react-toastify';

const StudentProfilePage = () => {
    const userInfo = getUserInfo();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: userInfo.userName || "Nguyễn Văn A",
        studentId: "SE123456",
        email: userInfo.email || "student@fpt.edu.vn",
        phone: "0123456789",
        major: "Software Engineering",
        semester: "Fall 2024",
        enrollmentDate: "2021-09-01",
        gpa: "3.75",
        address: "Hà Nội, Việt Nam"
    });

    const [editData, setEditData] = useState({ ...profileData });

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({ ...profileData });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({ ...profileData });
    };

    const handleSave = () => {
        // Ở đây sẽ gọi API để cập nhật thông tin
        setProfileData({ ...editData });
        setIsEditing(false);
        toast.success('Cập nhật thông tin thành công!', {
            position: "top-right",
            autoClose: 2000,
        });
    };

    const handleInputChange = (field, value) => {
        setEditData({
            ...editData,
            [field]: value
        });
    };

    return (
        <div className="student-profile-page">
            <SidebarStudent />
            
            <div className="profile-main">
                <div className="profile-content">
                    <div className="page-header">
                        <div>
                            <h1>Thông tin cá nhân</h1>
                            <p>Quản lý thông tin tài khoản của bạn</p>
                        </div>
                        {!isEditing ? (
                            <button className="btn-edit" onClick={handleEdit}>
                                <FaEdit /> Chỉnh sửa
                            </button>
                        ) : (
                            <div className="edit-actions">
                                <button className="btn-save" onClick={handleSave}>
                                    <FaSave /> Lưu
                                </button>
                                <button className="btn-cancel" onClick={handleCancel}>
                                    <FaTimes /> Hủy
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-container">
                        {/* Profile Header Card */}
                        <div className="profile-header-card">
                            <div className="profile-avatar">
                                <FaUser />
                            </div>
                            <div className="profile-header-info">
                                <h2>{profileData.fullName}</h2>
                                <p className="profile-student-id">{profileData.studentId}</p>
                                <p className="profile-major">{profileData.major}</p>
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="profile-details-grid">
                            {/* Personal Information */}
                            <div className="profile-section">
                                <h3 className="section-title">Thông tin cá nhân</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <div className="info-label">
                                            <FaUser className="info-icon" />
                                            <span>Họ và tên</span>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="info-input"
                                                value={editData.fullName}
                                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            />
                                        ) : (
                                            <div className="info-value">{profileData.fullName}</div>
                                        )}
                                    </div>

                                    <div className="info-item">
                                        <div className="info-label">
                                            <FaIdCard className="info-icon" />
                                            <span>Mã sinh viên</span>
                                        </div>
                                        <div className="info-value">{profileData.studentId}</div>
                                    </div>

                                    <div className="info-item">
                                        <div className="info-label">
                                            <FaEnvelope className="info-icon" />
                                            <span>Email</span>
                                        </div>
                                        <div className="info-value">{profileData.email}</div>
                                    </div>

                                    <div className="info-item">
                                        <div className="info-label">
                                            <FaPhone className="info-icon" />
                                            <span>Số điện thoại</span>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="info-input"
                                                value={editData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                            />
                                        ) : (
                                            <div className="info-value">{profileData.phone}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div className="profile-section">
                                <h3 className="section-title">Thông tin học tập</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <div className="info-label">
                                            <FaGraduationCap className="info-icon" />
                                            <span>Chuyên ngành</span>
                                        </div>
                                        <div className="info-value">{profileData.major}</div>
                                    </div>

                                    <div className="info-item">
                                        <div className="info-label">
                                            <FaCalendar className="info-icon" />
                                            <span>Kỳ học hiện tại</span>
                                        </div>
                                        <div className="info-value">{profileData.semester}</div>
                                    </div>

                                    <div className="info-item">
                                        <div className="info-label">
                                            <FaCalendar className="info-icon" />
                                            <span>Ngày nhập học</span>
                                        </div>
                                        <div className="info-value">{profileData.enrollmentDate}</div>
                                    </div>

                                    <div className="info-item">
                                        <div className="info-label">
                                            <FaGraduationCap className="info-icon" />
                                            <span>GPA</span>
                                        </div>
                                        <div className="info-value gpa-value">{profileData.gpa}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="profile-section full-width">
                                <h3 className="section-title">Thông tin bổ sung</h3>
                                <div className="info-grid">
                                    <div className="info-item full-width">
                                        <div className="info-label">
                                            <FaUser className="info-icon" />
                                            <span>Địa chỉ</span>
                                        </div>
                                        {isEditing ? (
                                            <textarea
                                                className="info-textarea"
                                                value={editData.address}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                rows="3"
                                            />
                                        ) : (
                                            <div className="info-value">{profileData.address}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon events">
                                    <FaCalendar />
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">12</div>
                                    <div className="stat-label">Sự kiện đã tham gia</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon tickets">
                                    <FaIdCard />
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">5</div>
                                    <div className="stat-label">Vé đã đặt</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon upcoming">
                                    <FaGraduationCap />
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">3</div>
                                    <div className="stat-label">Sự kiện sắp tới</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfilePage;
