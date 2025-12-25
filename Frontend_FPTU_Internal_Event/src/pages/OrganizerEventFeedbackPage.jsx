import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SidebarOrganizer from '../components/SidebarOrganizer';
import { FaStar, FaArrowLeft, FaComment, FaUser, FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../assets/css/OrganizerEventFeedbackPage.css';

const OrganizerEventFeedbackPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Get eventId from URL params or location state
    const eventId = searchParams.get('eventId') || location.state?.eventId;
    
    const [feedbackData, setFeedbackData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest, lowest

    useEffect(() => {
        if (!eventId) {
            toast.error('Event ID not found');
            navigate('/organizer/events');
            return;
        }
        fetchFeedbackSummary();
    }, [eventId]);

    const fetchFeedbackSummary = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://localhost:7047/api/Feedback/event/${eventId}/summary`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Feedback API Response:', response.data);
            
            if (response.data.success) {
                setFeedbackData(response.data.data);
                console.log('Feedback Data:', response.data.data);
                toast.success('Feedback loaded successfully', {
                    position: 'top-right',
                    autoClose: 2000
                });
            } else {
                toast.error('Failed to load feedback');
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'An error occurred while loading feedback');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="star-display">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={star <= rating ? 'star-filled' : 'star-empty'}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSortedFeedbacks = () => {
        if (!feedbackData?.feedbacks) return [];
        
        const sorted = [...feedbackData.feedbacks];
        
        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'highest':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'lowest':
                return sorted.sort((a, b) => a.rating - b.rating);
            default:
                return sorted;
        }
    };

    const getStarPercentage = (count, total) => {
        return total > 0 ? (count / total * 100).toFixed(1) : 0;
    };

    return (
        <div className="organizer-feedback-page">
            <SidebarOrganizer />
            
            <div className="feedback-main-content">
                <div className="feedback-container">
                    <div className="feedback-header">
                        <button className="btn-back" onClick={() => navigate('/organizer/events')}>
                            <FaArrowLeft /> Back to Events
                        </button>
                        <h1><FaComment /> Event Feedback</h1>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <p>Loading feedback...</p>
                        </div>
                    ) : feedbackData ? (
                        <>
                            {/* Event Info Card */}
                            <div className="event-info-card">
                                <h2>{feedbackData.eventName}</h2>
                                <div className="event-stats">
                                    <div className="stat-item">
                                        <div className="stat-number">{feedbackData.totalFeedbacks}</div>
                                        <div className="stat-label">Total Feedbacks</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">{feedbackData.averageRating.toFixed(1)}</div>
                                        <div className="stat-label">Average Rating</div>
                                        {renderStars(Math.round(feedbackData.averageRating))}
                                    </div>
                                </div>
                            </div>

                            {/* Rating Distribution */}
                            <div className="rating-distribution-card">
                                <h3><FaChartBar /> Rating Distribution</h3>
                                <div className="rating-bars">
                                    {[
                                        { stars: 5, count: feedbackData.fiveStars, label: '5 Stars' },
                                        { stars: 4, count: feedbackData.fourStars, label: '4 Stars' },
                                        { stars: 3, count: feedbackData.threeStars, label: '3 Stars' },
                                        { stars: 2, count: feedbackData.twoStars, label: '2 Stars' },
                                        { stars: 1, count: feedbackData.oneStar, label: '1 Star' }
                                    ].map((item) => (
                                        <div key={item.stars} className="rating-bar-item">
                                            <div className="rating-bar-label">
                                                <span className="stars-label">{item.label}</span>
                                                <span className="count-label">{item.count}</span>
                                            </div>
                                            <div className="rating-bar-container">
                                                <div 
                                                    className={`rating-bar rating-bar-${item.stars}`}
                                                    style={{ 
                                                        width: `${getStarPercentage(item.count, feedbackData.totalFeedbacks)}%` 
                                                    }}
                                                />
                                            </div>
                                            <span className="percentage-label">
                                                {getStarPercentage(item.count, feedbackData.totalFeedbacks)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Feedbacks List */}
                            {feedbackData.feedbacks && feedbackData.feedbacks.length > 0 ? (
                                <div className="feedbacks-section">
                                    <div className="feedbacks-header">
                                        <h3>All Feedbacks ({feedbackData.totalFeedbacks})</h3>
                                        <div className="sort-controls">
                                            <label>Sort by:</label>
                                            <select 
                                                value={sortBy} 
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="sort-select"
                                            >
                                                <option value="newest">Newest First</option>
                                                <option value="oldest">Oldest First</option>
                                                <option value="highest">Highest Rating</option>
                                                <option value="lowest">Lowest Rating</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="feedbacks-list">
                                        {getSortedFeedbacks().map((feedback) => (
                                            <div key={feedback.feedbackId} className="feedback-item">
                                                <div className="feedback-header-section">
                                                    <div className="user-info">
                                                        <FaUser className="user-icon" />
                                                        <div>
                                                            <div className="user-name">{feedback.userName}</div>
                                                            <div className="feedback-date">
                                                                <FaCalendarAlt /> {formatDate(feedback.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="feedback-rating">
                                                        {renderStars(feedback.rating)}
                                                        <span className="rating-number">{feedback.rating}/5</span>
                                                    </div>
                                                </div>
                                                <div className="feedback-comment">
                                                    <p>{feedback.comment}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="no-feedbacks">
                                    <FaComment className="no-feedback-icon" />
                                    <h3>No Feedback Yet</h3>
                                    <p>This event hasn't received any feedback from attendees.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-data">
                            <p>No feedback data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizerEventFeedbackPage;
