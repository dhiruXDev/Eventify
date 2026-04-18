import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';
import { eventService } from '../../services';

const PlatformRatingForm = () => {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [myRating, setMyRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyRating();
    }
  }, [isAuthenticated]);

  const fetchMyRating = async () => {
    try {
      const rating = await eventService.getMyPlatformRating();
      if (rating) {
        setMyRating(rating);
        setRating(rating.rating);
        setComment(rating.comment || '');
      }
    } catch (err) {
      console.error('Failed to fetch platform rating:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please login to submit a platform rating');
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
      
      await eventService.createPlatformRating({ 
        rating, 
        comment, 
        userName: actualUserName, 
        userPhoto: actualUserPhoto 
      });
        
        
      setSuccess(true);
      await fetchMyRating();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit platform rating');
    } finally {
      setSubmitting(false);
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

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center">
          Please <Link to="/login" className="text-green-600 hover:text-green-700">login</Link> to rate the platform.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Our Platform</h3>
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Platform rating {myRating ? 'updated' : 'submitted'} successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {myRating && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium text-gray-900">Your Platform Rating</h4>
              <div className="mt-1">{renderStars(myRating.rating)}</div>
            </div>
          </div>
          {myRating.comment && (
            <p className="text-gray-700 mt-2">{myRating.comment}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            Your Feedback (Optional)
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Share your experience with our platform..."
            disabled={submitting}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : myRating ? 'Update Rating' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
};

export default PlatformRatingForm;

