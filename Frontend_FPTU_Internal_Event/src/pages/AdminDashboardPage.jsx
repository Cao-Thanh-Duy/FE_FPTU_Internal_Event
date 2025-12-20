import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaMicrophone,
  FaTicketAlt,
  FaChartLine,
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import "../assets/css/AdminDashboardPage.css";
import SidebarAdmin from "../components/SidebarAdmin";

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalEvents: 0,
    pendingEvents: 0,
    approvedEvents: 0,
    rejectedEvents: 0,
    totalVenues: 0,
    totalSpeakers: 0,
    totalSlots: 0,
    totalTickets: 0,
    usersByRole: {
      admin: 0,
      student: 0,
      staff: 0,
      organizer: 0,
    },
    recentEvents: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [usersRes, eventsRes, venuesRes, speakersRes, slotsRes] =
        await Promise.all([
          axios.get("https://localhost:7047/api/User"),
          axios.get("https://localhost:7047/api/Event"),
          axios.get("https://localhost:7047/api/Venue"),
          axios.get("https://localhost:7047/api/Speaker"),
          axios.get("https://localhost:7047/api/Slot"),
        ]);

      // Extract data
      const users = usersRes.data?.data ?? usersRes.data ?? [];
      const events = eventsRes.data?.data ?? eventsRes.data ?? [];
      const venues = venuesRes.data?.data ?? venuesRes.data ?? [];
      const speakers = speakersRes.data?.data ?? speakersRes.data ?? [];
      const slots = slotsRes.data?.data ?? slotsRes.data ?? [];

      // Calculate statistics
      const pendingEvents = events.filter((e) => e.status === "Pending").length;
      const approvedEvents = events.filter(
        (e) => e.status === "Approve" || e.status === "Approved"
      ).length;
      const rejectedEvents = events.filter(
        (e) => e.status === "Reject" || e.status === "Rejected"
      ).length;

      // Count users by role
      const usersByRole = {
        admin: users.filter((u) => u.roleName === "Admin").length,
        student: users.filter((u) => u.roleName === "Student").length,
        staff: users.filter((u) => u.roleName === "Staff").length,
        organizer: users.filter((u) => u.roleName === "Organizer").length,
      };

      // Calculate total tickets sold
      const totalTickets = events.reduce((sum, event) => {
        const sold = event.maxTickerCount - (event.currentTickerCount || 0);
        return sum + sold;
      }, 0);

      // Get recent events (last 5, sorted by date)
      const recentEvents = events
        .sort((a, b) => new Date(b.eventDay) - new Date(a.eventDay))
        .slice(0, 5);

      setDashboardData({
        totalUsers: users.length,
        totalEvents: events.length,
        pendingEvents,
        approvedEvents,
        rejectedEvents,
        totalVenues: venues.length,
        totalSpeakers: speakers.length,
        totalSlots: slots.length,
        totalTickets,
        usersByRole,
        recentEvents,
      });

      toast.success("Dashboard data loaded successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === "Approve" || status === "Approved") return "status-approved";
    if (status === "Pending") return "status-pending";
    if (status === "Reject" || status === "Rejected") return "status-rejected";
    return "status-default";
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <SidebarAdmin />
        <div className="dashboard-main">
          <div className="dashboard-content">
            <div className="loading-state">
              <p>Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <SidebarAdmin />

      <div className="dashboard-main">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p>Overview of system statistics and recent activities</p>
          </div>

          {/* Statistics Cards Grid */}
          <div className="stats-grid">
            {/* Total Users Card */}
            <div className="stat-card stat-card-blue">
              <div className="stat-icon">
                <FaUsers />
              </div>

              <div className="stat-details">
                <h3>Total Users</h3>

                <div className="stat-main">
                  <p className="stat-number">{dashboardData.totalUsers}</p>
                </div>

                <div className="stat-breakdown">
                  <span>Admin: {dashboardData.usersByRole.admin}</span>
                  <span>Student: {dashboardData.usersByRole.student}</span>
                  <span>Staff: {dashboardData.usersByRole.staff}</span>
                  <span>Organizer: {dashboardData.usersByRole.organizer}</span>
                </div>
              </div>
            </div>

            {/* Total Events Card */}
            <div className="stat-card stat-card-green">
              <div className="stat-icon">
                <FaCalendarAlt />
              </div>
              <div className="stat-details">
                <h3>Total Events</h3>
                <p className="stat-number">{dashboardData.totalEvents}</p>
                <div className="stat-breakdown">
                  <span className="status-approved">
                    <FaCheckCircle /> Approved: {dashboardData.approvedEvents}
                  </span>
                  <span className="status-pending">
                    <FaHourglassHalf /> Pending: {dashboardData.pendingEvents}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Events Card */}
            <div className="stat-card stat-card-orange">
              <div className="stat-icon">
                <FaHourglassHalf />
              </div>
              <div className="stat-details">
                <h3>Pending Approval</h3>
                <p className="stat-number">{dashboardData.pendingEvents}</p>
                <p className="stat-description">Events waiting for approval</p>
              </div>
            </div>

            {/* Total Tickets Card */}
            <div className="stat-card stat-card-purple">
              <div className="stat-icon">
                <FaTicketAlt />
              </div>
              <div className="stat-details">
                <h3>Tickets Sold</h3>
                <p className="stat-number">{dashboardData.totalTickets}</p>
                <p className="stat-description">
                  Total tickets sold across all events
                </p>
              </div>
            </div>

            {/* Venues Card */}
            <div className="stat-card stat-card-teal">
              <div className="stat-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="stat-details">
                <h3>Venues</h3>
                <p className="stat-number">{dashboardData.totalVenues}</p>
                <p className="stat-description">Available event venues</p>
              </div>
            </div>

            {/* Speakers Card */}
            <div className="stat-card stat-card-pink">
              <div className="stat-icon">
                <FaMicrophone />
              </div>
              <div className="stat-details">
                <h3>Speakers</h3>
                <p className="stat-number">{dashboardData.totalSpeakers}</p>
                <p className="stat-description">Registered speakers</p>
              </div>
            </div>

            {/* Slots Card */}
            <div className="stat-card stat-card-yellow">
              <div className="stat-icon">
                <FaClock />
              </div>
              <div className="stat-details">
                <h3>Time Slots</h3>
                <p className="stat-number">{dashboardData.totalSlots}</p>
                <p className="stat-description">Available time slots</p>
              </div>
            </div>

            {/* Rejected Events Card */}
            <div className="stat-card stat-card-red">
              <div className="stat-icon">
                <FaTimesCircle />
              </div>
              <div className="stat-details">
                <h3>Rejected Events</h3>
                <p className="stat-number">{dashboardData.rejectedEvents}</p>
                <p className="stat-description">Events that were rejected</p>
              </div>
            </div>
          </div>

          {/* Recent Events Section */}
          <div className="recent-events-section">
            <div className="section-header">
              <h2>
                <FaChartLine /> Recent Events
              </h2>
              <button className="btn-refresh" onClick={fetchDashboardData}>
                Refresh Data
              </button>
            </div>

            {dashboardData.recentEvents.length === 0 ? (
              <div className="no-events">
                <p>No events found in the system</p>
              </div>
            ) : (
              <div className="events-table-container">
                <table className="events-table">
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Date</th>
                      <th>Venue</th>
                      <th>Tickets</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentEvents.map((event) => (
                      <tr key={event.eventId}>
                        <td className="event-name">{event.eventName}</td>
                        <td>
                          {new Date(event.eventDay).toLocaleDateString("vi-VN")}
                        </td>
                        <td>{event.venueName || "N/A"}</td>
                        <td>
                          <span className="ticket-count">
                            {event.maxTickerCount -
                              (event.currentTickerCount || 0)}{" "}
                            / {event.maxTickerCount}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${getStatusBadgeClass(
                              event.status
                            )}`}
                          >
                            {event.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
