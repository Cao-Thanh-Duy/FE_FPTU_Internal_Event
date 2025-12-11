import React, { useState } from "react";
import "../assets/css/StaffEventPage.css";
import SidebarStaff from "../components/SidebarStaff";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaSearch } from 'react-icons/fa';

const StaffEventPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    
    // Mock data - sẽ thay bằng API sau
    const events = [
        {
            id: 1,
            name: "Workshop ReactJS 2024",
            date: "2024-12-15",
            time: "14:00 - 16:00",
            venue: "Phòng A101",
            participants: 45,
            status: "upcoming",
            description: "Workshop về ReactJS cơ bản và nâng cao"
        },
        {
            id: 2,
            name: "Hội thảo AI và Machine Learning",
            date: "2024-12-20",
            time: "09:00 - 11:30",
            venue: "Hội trường A",
            participants: 120,
            status: "upcoming",
            description: "Hội thảo về xu hướng AI và ML trong năm 2024"
        },
        {
            id: 3,
            name: "Ngày hội Sinh viên",
            date: "2024-12-10",
            time: "08:00 - 17:00",
            venue: "Sân vận động",
            participants: 300,
            status: "completed",
            description: "Ngày hội văn hóa sinh viên FPTU"
        }
    ];

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        const statusMap = {
            upcoming: { text: "Sắp diễn ra", class: "badge-upcoming" },
            ongoing: { text: "Đang diễn ra", class: "badge-ongoing" },
            completed: { text: "Đã hoàn thành", class: "badge-completed" }
        };
        return statusMap[status] || statusMap.upcoming;
    };

    return (
        <div className="staff-event-page">
            <SidebarStaff />
            
            <div className="event-main">
                <div className="event-content">
                    <div className="page-header">
                        <div>
                            <h1>Quản lý Events</h1>
                            <p>Danh sách các sự kiện được phân công</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="search-section">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sự kiện..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {/* Events List */}
                    <div className="events-grid">
                        {filteredEvents.map(event => (
                            <div key={event.id} className="event-card">
                                <div className="event-card-header">
                                    <h3>{event.name}</h3>
                                    <span className={`status-badge ${getStatusBadge(event.status).class}`}>
                                        {getStatusBadge(event.status).text}
                                    </span>
                                </div>
                                
                                <p className="event-description">{event.description}</p>
                                
                                <div className="event-details">
                                    <div className="detail-item">
                                        <FaCalendar className="detail-icon" />
                                        <span>{event.date}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FaClock className="detail-icon" />
                                        <span>{event.time}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FaMapMarkerAlt className="detail-icon" />
                                        <span>{event.venue}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FaUsers className="detail-icon" />
                                        <span>{event.participants} người tham gia</span>
                                    </div>
                                </div>
                                
                                <div className="event-actions">
                                    <button className="btn-view">Xem chi tiết</button>
                                    <button className="btn-checkin">Check-in</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredEvents.length === 0 && (
                        <div className="no-results">
                            <p>Không tìm thấy sự kiện nào</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffEventPage;
