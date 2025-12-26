import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../assets/css/EventFeedbackPage.css";
import SidebarStudent from "../components/SidebarStudent";
import { FaStar, FaArrowLeft, FaUser, FaCalendar, FaComment, FaPen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const EventFeedbackPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [feedbackData, setFeedbackData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [userFeedback, setUserFeedback] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Get ticket info from navigation state
    const ticketId = location.state?.ticketId;
    const ticketCode = location.state?.ticketCode;

    useEffect(() => {
        fetchFeedbackSummary();
    }, [eventId]);

    const fetchFeedbackSummary = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://localhost:7047/api/Feedback/event/${eventId}/summary`);
            
            if (response.data.success) {
                setFeedbackData(response.data.data);
                console.log('Feedback data:', response.data.data);
                
                // Check if user has already submitted feedback for this ticket
                if (ticketId && response.data.data.feedbacks) {
                    const existingFeedback = response.data.data.feedbacks.find(
                        feedback => feedback.ticketId === ticketId
                    );
                    if (existingFeedback) {
                        setUserFeedback(existingFeedback);
                        console.log('User existing feedback:', existingFeedback);
                    }
                }
            } else {
                toast.error('Unable to load feedback');
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
            toast.error('An error occurred while loading feedback');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={index < rating ? 'star-filled' : 'star-empty'}
            />
        ));
    };

    const getRatingPercentage = (count, total) => {
        if (total === 0) return 0;
        return Math.round((count / total) * 100);
    };

    const handleOpenFeedbackModal = () => {
        if (!ticketId) {
            toast.error('No ticket information found');
            return;
        }
        setFeedbackRating(0);
        setFeedbackComment("");
        setIsEditMode(false);
        setShowFeedbackModal(true);
    };

    const handleOpenEditModal = () => {
        if (!ticketId || !userFeedback) {
            toast.error('No feedback found to edit');
            return;
        }
        // Pre-populate with existing feedback
        setFeedbackRating(userFeedback.rating);
        setFeedbackComment(userFeedback.comment);
        setIsEditMode(true);
        setShowFeedbackModal(true);
    };

    const handleSubmitFeedback = async () => {
        if (feedbackRating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!feedbackComment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        try {
            setSubmittingFeedback(true);
            let response;

            if (isEditMode && userFeedback) {
                // Update existing feedback
                response = await axios.put(`https://localhost:7047/api/Feedback/${userFeedback.feedbackId}`, {
                    rating: feedbackRating,
                    comment: feedbackComment.trim()
                });
            } else {
                // Create new feedback
                response = await axios.post('https://localhost:7047/api/Feedback', {
                    ticketId: ticketId,
                    rating: feedbackRating,
                    comment: feedbackComment.trim()
                });
            }

            if (response.data.success) {
                toast.success(isEditMode ? 'Feedback updated successfully!' : 'Feedback submitted successfully!', {
                    position: "top-right",
                    autoClose: 2000,
                });
                setShowFeedbackModal(false);
                setFeedbackRating(0);
                setFeedbackComment("");
                setIsEditMode(false);
                // Refresh feedback list
                fetchFeedbackSummary();
            } else {
                toast.error(response.data.message || 'Unable to submit feedback');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error(error.response?.data?.message || 'An error occurred while submitting feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    if (loading) {
        return (
            <div className="event-feedback-page">
                <SidebarStudent />
                <div className="feedback-main">
                    <div className="loading-message">
                        <p>Loading feedback...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!feedbackData) {
        return (
            <div className="event-feedback-page">
                <SidebarStudent />
                <div className="feedback-main">
                    <div className="error-message">
                        <p>Unable to load feedback data</p>
                        <button onClick={() => navigate(-1)} className="btn-back">
                            <FaArrowLeft /> Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="event-feedback-page">
            <SidebarStudent />
            
            <div className="feedback-main">
                <div className="feedback-content">
                    <div className="page-header">
                        <button onClick={() => navigate(-1)} className="btn-back">
                            <FaArrowLeft /> Back
                        </button>
                        <div>
                            <h1>Event Feedback</h1>
                            <p className="event-name">{feedbackData.eventName}</p>
                        </div>
                        {ticketId && !userFeedback && (
                            <button onClick={handleOpenFeedbackModal} className="btn-write-feedback">
                                <FaPen /> Write Feedback
                            </button>
                        )}
                        {ticketId && userFeedback && (
                            <button onClick={handleOpenEditModal} className="btn-update-feedback">
                                <FaPen /> Update Feedback
                            </button>
                        )}
                    </div>

                    {/* Feedback Statistics */}
                    <div className="feedback-stats-container">
                        <div className="overall-rating">
                            <div className="rating-number">{feedbackData.averageRating.toFixed(1)}</div>
                            <div className="rating-stars">
                                {renderStars(Math.round(feedbackData.averageRating))}
                            </div>
                            <div className="total-feedbacks">
                                {feedbackData.totalFeedbacks} {feedbackData.totalFeedbacks === 1 ? 'review' : 'reviews'}
                            </div>
                        </div>

                        <div className="rating-breakdown">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = 
                                    star === 5 ? feedbackData.fiveStars :
                                    star === 4 ? feedbackData.fourStars :
                                    star === 3 ? feedbackData.threeStars :
                                    star === 2 ? feedbackData.twoStars :
                                    feedbackData.oneStar;
                                const percentage = getRatingPercentage(count, feedbackData.totalFeedbacks);

                                return (
                                    <div key={star} className="rating-bar-container">
                                        <span className="star-label">{star} <FaStar className="star-icon-small" /></span>
                                        <div className="rating-bar">
                                            <div 
                                                className="rating-bar-fill" 
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="rating-count">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Feedback List */}
                    <div className="feedback-list-section">
                        <h2 className="section-title">
                            <FaComment /> User Reviews ({feedbackData.totalFeedbacks})
                        </h2>
                        
                        {feedbackData.feedbacks && feedbackData.feedbacks.length > 0 ? (
                            <div className="feedback-list">
                                {feedbackData.feedbacks.map((feedback) => (
                                    <div key={feedback.feedbackId} className="feedback-card">
                                        <div className="feedback-header">
                                            <div className="user-info">
                                                <div className="user-avatar">
                                                    <FaUser />
                                                </div>
                                                <div className="user-details">
                                                    <h4 className="user-name">{feedback.userName}</h4>
                                                    <div className="feedback-date">
                                                        <FaCalendar /> {formatDate(feedback.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="feedback-rating">
                                                {renderStars(feedback.rating)}
                                            </div>
                                        </div>
                                        <div className="feedback-comment">
                                            <p>{feedback.comment}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-feedback">
                                <FaComment className="no-feedback-icon" />
                                <p>No feedback yet for this event</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Write/Update Feedback Modal */}
            {showFeedbackModal && (
                <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaPen /> {isEditMode ? 'Update Your Feedback' : 'Write Your Feedback'}
                            </h2>
                        </div>
                        
                        <div className="modal-body">
                            <div className="feedback-form">
                                <div className="feedback-event-info">
                                    <h3>{feedbackData.eventName}</h3>
                                    <p className="feedback-ticket-code">Ticket: {ticketCode || ticketId}</p>
                                </div>

                                <div className="feedback-rating-section">
                                    <label className="feedback-label">Rating *</label>
                                    <div className="star-rating">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className={`star-input ${star <= (hoverRating || feedbackRating) ? 'star-filled' : 'star-empty'}`}
                                                onClick={() => setFeedbackRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                            />
                                        ))}
                                    </div>
                                    <p className="rating-text">
                                        {feedbackRating === 0 ? 'Select a rating' : 
                                         feedbackRating === 1 ? 'Poor' :
                                         feedbackRating === 2 ? 'Fair' :
                                         feedbackRating === 3 ? 'Good' :
                                         feedbackRating === 4 ? 'Very Good' : 'Excellent'}
                                    </p>
                                </div>

                                <div className="feedback-comment-section">
                                    <label className="feedback-label">Your Feedback *</label>
                                    <textarea
                                        className="feedback-textarea"
                                        placeholder="Share your experience with this event..."
                                        value={feedbackComment}
                                        onChange={(e) => setFeedbackComment(e.target.value)}
                                        rows={5}
                                    />
                                    <p className="char-count">{feedbackComment.length} characters</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="btn-submit-feedback" 
                                onClick={handleSubmitFeedback}
                                disabled={submittingFeedback}
                            >
                                {submittingFeedback ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Feedback' : 'Submit Feedback')}
                            </button>
                            <button 
                                className="btn-close-modal" 
                                onClick={() => setShowFeedbackModal(false)}
                                disabled={submittingFeedback}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventFeedbackPage;
