import { useState, useEffect } from 'react';
import { eventService } from '../../services';
import { useAuth } from '../../context';
import defaultUserImage from '../../assets/DefaultImg.png';

const EventReviews = ({ eventId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchReviews();
      if (isAuthenticated) {
        fetchMyReview();
      }
    }
  }, [eventId, isAuthenticated]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEventReviews(eventId);
      
      // Handle different response structures
      if (response && response.data) {
        setReviews(Array.isArray(response.data) ? response.data : []);
        setAverageRating(response.averageRating || 0);
      } else if (Array.isArray(response)) {
        // If response is directly an array
        setReviews(response);
        // Calculate average if not provided
        const avg = response.length > 0
          ? response.reduce((sum, r) => sum + (r.rating || 0), 0) / response.length
          : 0;
        setAverageRating(avg);
      } else {
        setReviews([]);
        setAverageRating(0);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError(err.message || 'Failed to load reviews');
      setReviews([]);
      setAverageRating(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReview = async () => {
    if (!isAuthenticated) {
      setShowReviewForm(false);
      return;
    }
    
    try {
      const review = await eventService.getMyReview(eventId);
      if (review && review._id) {
        setMyReview(review);
        setRating(review.rating || 5);
        setComment(review.comment || '');
        setShowReviewForm(false);
      } else {
        setMyReview(null);
        setRating(5);
        setComment('');
        setShowReviewForm(true);
      }
    } catch (err) {
      // If 404, user hasn't reviewed yet - that's fine
      if (err.message && err.message.includes('404')) {
        setMyReview(null);
        setShowReviewForm(true);
      } else {
        console.error('Failed to fetch my review:', err);
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please login to submit a review');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      // Get actual user name (from name/userName or construct from firstName + lastName)
      const actualUserName = user?.name || user?.userName || 
        (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || 'User');
      // Get user photo or use default
      const actualUserPhoto = user?.photo && user.photo.trim() !== '' ? user.photo : '/DefaultImg.png';
      
      const result = await eventService.createReview(eventId, { 
        rating, 
        comment, 
        userName: actualUserName, 
        userPhoto: actualUserPhoto 
      });
      
      // Refresh reviews and user's review
      await Promise.all([
        fetchReviews(),
        fetchMyReview()
      ]);
      
      setShowReviewForm(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await eventService.deleteReview(eventId, myReview._id);
      setMyReview(null);
      setRating(5);
      setComment('');
      setShowReviewForm(true);
      await fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to delete review');
    }
  };

  const renderStars = (ratingValue, interactive = false, onChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
            }`}
            disabled={!interactive || submitting}
          >
            <svg
              className={`w-6 h-6 ${
                star <= ratingValue
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg mt-8">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Ratings & Reviews
            </h3>
            <div className="mt-2 flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-3xl font-bold text-gray-900">
                  {isNaN(averageRating) || averageRating === 0 ? '0.0' : averageRating.toFixed(1)}
                </span>
                <span className="ml-2 text-gray-500">/ 5.0</span>
              </div>
              <div className="flex items-center">
                {renderStars(Math.round(averageRating) || 0)}
                <span className="ml-2 text-sm text-gray-500">
                  ({reviews && reviews.length ? reviews.length : 0} {reviews && reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Review Form - Show if authenticated and (no review exists or user wants to edit) */}
        {isAuthenticated && (user.role === 'participant' || user.role === 'organizer') && (
          <div className="mb-6 border-b border-gray-200 pb-6">
            {myReview ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Your Review</h4>
                    <div className="mt-1">{renderStars(myReview.rating)}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowReviewForm(true);
                    }}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                {myReview.comment && (
                  <p className="text-gray-700 mt-2">{myReview.comment}</p>
                )}
                <button
                  onClick={handleDeleteReview}
                  className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete Review
                </button>
              </div>
            ) : null}

            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating
                  </label>
                  {renderStars(rating, true, setRating)}
                </div>
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Review (Optional)
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Share your experience with this event..."
                    disabled={submitting}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
                  </button>
                  {myReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setRating(myReview.rating);
                        setComment(myReview.comment || '');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            {!myReview && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Write a Review
              </button>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => {
              // Ensure review has required fields
              if (!review || !review._id) return null;
              
              const userName = review.userName || 'User';
              const userRole = review.userRole || 'participant';
              const userPhoto = review.userPhoto || '';
              const rating = review.rating || 0;
              const comment = review.comment || '';
              const createdAt = review.createdAt || review.created_at || new Date();
              
              return (
                <div
                  key={review._id}
                  className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-lg shadow-md overflow-hidden">
                          {userPhoto && userPhoto !== '/DefaultImg.png' && userPhoto.trim() !== '' && (userPhoto.startsWith('data:') || userPhoto.startsWith('http') || userPhoto.startsWith('/')) ? (
                            <img
                              src={userPhoto}
                              alt={userName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // If image fails to load, try default image, then show initials
                                if (e.target.src !== defaultUserImage) {
                                  e.target.src = defaultUserImage;
                                  e.target.onerror = () => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<span class="text-white text-lg font-semibold">${userName.charAt(0).toUpperCase()}</span>`;
                                  };
                                } else {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `<span class="text-white text-lg font-semibold">${userName.charAt(0).toUpperCase()}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <img
                              src={defaultUserImage}
                              alt={userName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // If default image fails, show initials
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<span class="text-white text-lg font-semibold">${userName.charAt(0).toUpperCase()}</span>`;
                              }}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-base">{userName}</p>
                          <p className="text-sm text-gray-500 capitalize">{userRole}</p>
                        </div>
                        <div className="text-right">
                          <div className="mb-1">{renderStars(rating)}</div>
                          <p className="text-xs text-gray-500">
                            {new Date(createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      {comment && (
                        <div className="ml-15 mt-2">
                          <p className="text-gray-700 leading-relaxed">{comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="mt-2 text-gray-500 text-sm">No reviews yet. Be the first to review this event!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventReviews;

