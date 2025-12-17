import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { 
    FaCalendarAlt, 
    FaQrcode, 
    FaUsers, 
    FaCheckCircle,
    FaClock,
    FaMapMarkerAlt,
    FaTicketAlt,
    FaChartBar,
    FaListAlt,
    FaExclamationTriangle
} from "react-icons/fa";
import { getUserInfo } from "../utils/auth";
import "../assets/css/StaffDashboardPage.css";
import SidebarStaff from "../components/SidebarStaff";

const StaffDashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalAssignedEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        totalAttendees: 0,
        totalCheckedIn: 0,
        checkInRate: 0,
        assignedEvents: [],
        upcomingEventsList: []
    });

    useEffect(() => {
        fetchStaffDashboardData();
    }, []);

    const fetchStaffDashboardData = async () => {
        setLoading(true);
        try {
            const userInfo = getUserInfo();
            const staffId = parseInt(userInfo. userId);

            // Fetch staff assigned events
            const eventsResponse = await axios.get(
                `https://localhost:7047/api/Event/staff-events?userId=${staffId}`
            );

            const events = eventsResponse.data?. data ??  eventsResponse.data ??  [];

            // Current date for comparison
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            // Filter events by time
            const upcomingEvents = events.filter(event => {
                const eventDate = new Date(event.eventDay);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= now && (event.status === 'Approve' || event.status === 'Approved');
            });

            const completedEvents = events.filter(event => {
                const eventDate = new Date(event.eventDay);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate < now;
            });

            // Fetch attendees data for approved events to calculate check-in stats
            let totalAttendees = 0;
            let totalCheckedIn = 0;

            const approvedEvents = events.filter(e => 
                e.status === 'Approve' || e.status === 'Approved'
            );

            // Fetch attendees for each approved event
            const attendeesPromises = approvedEvents.map(async (event) => {
                try {
                    const response = await axios.get(
                        `https://localhost:7047/api/Ticket/event/${event.eventId}/attendees`
                    );
                    const data = response.data?.data ?? response.data;
                    
                    if (data && data. attendees) {
                        const eventAttendees = data.attendees. length;
                        const checkedIn = data.attendees.filter(a => 
                            a.status === 'Checked' || a.status === 'CheckedIn'
                        ).length;

                        return { eventAttendees, checkedIn };
                    }
                    return { eventAttendees: 0, checkedIn: 0 };
                } catch (error) {
                    console.error(`Error fetching attendees for event ${event.eventId}:`, error);
                    return { eventAttendees: 0, checkedIn: 0 };
                }
            });

            const attendeesResults = await Promise.all(attendeesPromises);
            attendeesResults.forEach(result => {
                totalAttendees += result.eventAttendees;
                totalCheckedIn += result.checkedIn;
            });

            const checkInRate = totalAttendees > 0 
                ? Math.round((totalCheckedIn / totalAttendees) * 100) 
                : 0;

            // Sort upcoming events by date
            const sortedUpcoming = upcomingEvents
                .sort((a, b) => new Date(a.eventDay) - new Date(b.eventDay))
                .slice(0, 5); // Get next 5 events

            setDashboardData({
                totalAssignedEvents: events.length,
                upcomingEvents: upcomingEvents.length,
                completedEvents: completedEvents. length,
                totalAttendees,
                totalCheckedIn,
                checkInRate,
                assignedEvents: events,
                upcomingEventsList:  sortedUpcoming
            });

            toast.success('Dashboard loaded successfully!', {
                position: 'top-right',
                autoClose: 2000
            });
        } catch (error) {
            console.error('Error fetching staff dashboard data:', error);
            console.error('Error response:', error.response?.data);
            
            toast.error('Failed to load dashboard data', {
                position: 'top-right',
                autoClose:  3000
            });
        } finally {
            setLoading(false);
        }
    };

    const getEventStatus = (event) => {
        const eventDate = new Date(event.eventDay);
        const now = new Date();
        eventDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        if (eventDate < now) return 'completed';
        if (eventDate. getTime() === now.getTime()) return 'today';
        return 'upcoming';
    };

    const getStatusBadgeClass = (status) => {
        if (status === 'completed') return 'status-completed';
        if (status === 'today') return 'status-today';
        return 'status-upcoming';
    };

    const getStatusText = (status) => {
        if (status === 'completed') return 'Completed';
        if (status === 'today') return 'Today';
        return 'Upcoming';
    };

    if (loading) {
        return (
            <div className="staff-dashboard">
                <SidebarStaff />
                <div className="dashboard-main">
                    <div className="dashboard-content">
                        <div className="loading-state">
                            <p>Loading dashboard... </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="staff-dashboard">
            <SidebarStaff />
            
            <div className="dashboard-main">
                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <h1>Staff Dashboard</h1>
                        <p>Chào mừng đến với trang quản lý dành cho nhân viên</p>
                    </div>

                    {/* Quick Action Cards */}
                    <div className="quick-actions">
                        <div 
                            className="action-card action-card-primary"
                            onClick={() => navigate('/staff/events')}
                        >
                            <div className="action-icon">
                                <FaCalendarAlt />
                            </div>
                            <div className="action-content">
                                <h3>Quản lý Events</h3>
                                <p>Xem các sự kiện được phân công</p>
                            </div>
                        </div>
                        
                        <div 
                            className="action-card action-card-secondary"
                            onClick={() => navigate('/staff/qr-scanner')}
                        >
                            <div className="action-icon">
                                <FaQrcode />
                            </div>
                            <div className="action-content">
                                <h3>Quét QR Check-in</h3>
                                <p>Check-in người tham gia sự kiện</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="stats-grid">
                        <div className="stat-card stat-card-blue">
                            <div className="stat-icon">
                                <FaListAlt />
                            </div>
                            <div className="stat-details">
                                <h3>Tổng Events Được Giao</h3>
                                <p className="stat-number">{dashboardData.totalAssignedEvents}</p>
                                <p className="stat-description">Events bạn phụ trách</p>
                            </div>
                        </div>

                        <div className="stat-card stat-card-green">
                            <div className="stat-icon">
                                <FaClock />
                            </div>
                            <div className="stat-details">
                                <h3>Events Sắp Tới</h3>
                                <p className="stat-number">{dashboardData.upcomingEvents}</p>
                                <p className="stat-description">Sự kiện chưa diễn ra</p>
                            </div>
                        </div>

                        <div className="stat-card stat-card-purple">
                            <div className="stat-icon">
                                <FaCheckCircle />
                            </div>
                            <div className="stat-details">
                                <h3>Events Đã Hoàn Thành</h3>
                                <p className="stat-number">{dashboardData.completedEvents}</p>
                                <p className="stat-description">Sự kiện đã kết thúc</p>
                            </div>
                        </div>

                        <div className="stat-card stat-card-orange">
                            <div className="stat-icon">
                                <FaUsers />
                            </div>
                            <div className="stat-details">
                                <h3>Tổng Người Tham Gia</h3>
                                <p className="stat-number">{dashboardData.totalAttendees}</p>
                                <p className="stat-description">Đã đăng ký tham gia</p>
                            </div>
                        </div>

                        <div className="stat-card stat-card-teal">
                            <div className="stat-icon">
                                <FaTicketAlt />
                            </div>
                            <div className="stat-details">
                                <h3>Đã Check-in</h3>
                                <p className="stat-number">{dashboardData.totalCheckedIn}</p>
                                <p className="stat-description">Người đã check-in</p>
                            </div>
                        </div>

                        <div className="stat-card stat-card-pink">
                            <div className="stat-icon">
                                <FaChartBar />
                            </div>
                            <div className="stat-details">
                                <h3>Tỷ Lệ Check-in</h3>
                                <p className="stat-number">{dashboardData.checkInRate}%</p>
                                <p className="stat-description">Hiệu suất check-in</p>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Events Section */}
                    <div className="upcoming-events-section">
                        <div className="section-header">
                            <h2>
                                <FaClock /> Events Sắp Tới
                            </h2>
                            <button 
                                className="btn-view-all"
                                onClick={() => navigate('/staff/events')}
                            >
                                Xem Tất Cả
                            </button>
                        </div>

                        {dashboardData.upcomingEventsList.length === 0 ? (
                            <div className="no-events">
                                <FaExclamationTriangle className="no-events-icon" />
                                <p>Không có sự kiện sắp tới</p>
                            </div>
                        ) : (
                            <div className="events-list">
                                {dashboardData.upcomingEventsList.map((event) => {
                                    const eventStatus = getEventStatus(event);
                                    return (
                                        <div key={event.eventId} className="event-item">
                                            <div className="event-date">
                                                <div className="date-day">
                                                    {new Date(event.eventDay).getDate()}
                                                </div>
                                                <div className="date-month">
                                                    {new Date(event. eventDay).toLocaleDateString('vi-VN', { month: 'short' })}
                                                </div>
                                            </div>
                                            
                                            <div className="event-details">
                                                <h4>{event.eventName}</h4>
                                                <div className="event-info-row">
                                                    <span className="event-info-item">
                                                        <FaMapMarkerAlt />
                                                        {event.venueName || 'N/A'}
                                                    </span>
                                                    <span className="event-info-item">
                                                        <FaUsers />
                                                        {event.currentTickerCount || 0} / {event.maxTickerCount} người
                                                    </span>
                                                </div>
                                                {event.slotEvent && event.slotEvent.length > 0 && (
                                                    <div className="event-time">
                                                        <FaClock />
                                                        {event.slotEvent[0].startTime} - {event.slotEvent[0].endTime}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="event-actions">
                                                <span className={`event-status ${getStatusBadgeClass(eventStatus)}`}>
                                                    {getStatusText(eventStatus)}
                                                </span>
                                                {eventStatus === 'today' && (
                                                    <button 
                                                        className="btn-checkin"
                                                        onClick={() => navigate('/staff/qr-scanner')}
                                                    >
                                                        <FaQrcode /> Check-in
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Refresh Button */}
                    <div className="dashboard-footer">
                        <button 
                            className="btn-refresh"
                            onClick={fetchStaffDashboardData}
                        >
                            Làm Mới Dữ Liệu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboardPage;
