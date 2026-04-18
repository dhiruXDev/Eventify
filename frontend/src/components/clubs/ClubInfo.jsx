import { useState, useEffect } from 'react';
import { clubService } from '../../services';
import { Link } from 'react-router-dom';
import ClubForm from './ClubForm';

const ClubInfo = ({ userId, isEditable = false }) => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDesignation, setUserDesignation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchClub = async () => {
      // Don't fetch if userId is not available
      if (!userId) {
        setLoading(false);
        return;
      }

      // Don't fetch if we're currently editing (creating/updating)
      if (isEditing) {
        return;
      }

      // Only fetch if we don't have club data yet
      // This prevents refetching after successful create/update
      if (club && club._id) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await clubService.getClubByOrganizer(userId);
         
        if(!response.success){
              setClub(null);
              return ;
        } 
        const clubData = response.data;
        setClub(clubData);

        // Find user's designation in the club
        const organizer = clubData.organizers?.find(
          org => {
            const orgUserId = org.userId?._id || org.userId;
            const orgUserIdStr = orgUserId?.toString();
            const userIdStr = userId?.toString();
            return orgUserIdStr === userIdStr || org.userId === userId;
          }
        );
        if (organizer) {
          setUserDesignation(organizer.designation);
        } 
      } catch (err) {
        console.log( "club  Error 1 ", err);
        // Club not found is okay - organizer might not have created a club yet
        // Check if it's a 404 or "not found" error - these are expected
        const isNotFound = err.isNotFound || 
                          err.response?.status === 404 ||
                          err.message?.toLowerCase().includes('no club found') ||
                          err.message?.toLowerCase().includes('not found') ||
                          err.message?.toLowerCase().includes('404');
         
        if (isNotFound) {
          console.log( "club  Error ", err);
          // No club found is expected for new organizers - silently handle
          setError(null);
          setClub(null); // Ensure club is null
        } else {
          // Only show/log actual errors
          console.error('Error fetching club:', err);
          setError(err.message || 'Failed to fetch club');
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch on initial load or when userId changes (not when editing or club changes)
    fetchClub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSuccess = (updatedClub) => {
    // Use the club data directly from the response - no need to refetch
    if (updatedClub) {
      setClub(updatedClub);
      setIsEditing(false);
      
      // Find user's designation in the club
      const organizer = updatedClub.organizers?.find(
        org => {
          const orgUserId = org.userId?._id || org.userId;
          const orgUserIdStr = orgUserId?.toString();
          const userIdStr = userId?.toString();
          return orgUserIdStr === userIdStr || org.userId === userId || org.userId?.toString() === userIdStr;
        }
      );
      if (organizer) {
        setUserDesignation(organizer.designation);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!club && !isEditing) {
    return (
      <div className="mt-6 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200 shadow-lg">
        <h3 className="text-xl font-bold text-yellow-800 mb-2">No Club Information</h3>
        <p className="text-yellow-700 mb-4">You haven't created or joined a club yet. Create your club to get started!</p>
        {isEditable && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
          >
            Create Your Club
          </button>
        )}
      </div>
    );
  }

  if (isEditing || (!club && !loading)) {
    return (
      <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-blue-900">
            {club ? 'Edit Club Information' : 'Create Your Club'}
          </h3>
          {club && (
            <button
              onClick={() => {
                setIsEditing(false);
                // Reset to allow fetch if needed
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <ClubForm
          club={club}
          userId={userId}
          onSuccess={handleSuccess}
          onCancel={club ? () => setIsEditing(false) : null}
        />
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {club.logo && (
            <img 
              src={club.logo} 
              alt={club.name} 
              className="w-20 h-20 rounded-lg object-cover border-2 border-blue-300"
            />
          )}
          <div>
            <h3 className="text-2xl font-bold text-blue-900">{club.name}</h3>
            {userDesignation && (
              <span className="inline-block mt-1 px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                {userDesignation}
              </span>
            )}
          </div>
        </div>
        {isEditable && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-semibold"
          >
            Edit Club
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 mb-2">Club Type</h4>
          <p className="text-blue-600 font-medium">{club.type}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {club.tags && club.tags.length > 0 ? (
              club.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No tags</span>
            )}
          </div>
        </div>

        {club.officeLocation && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-700 mb-2">📍 Office Location</h4>
            <p className="text-gray-800">{club.officeLocation}</p>
          </div>
        )}

        {(club.officeOpeningTime || club.officeClosingTime) && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-700 mb-2">🕐 Office Hours</h4>
            <p className="text-gray-800">
              {club.officeOpeningTime} - {club.officeClosingTime}
            </p>
          </div>
        )}
      </div>

      {club.about && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 mb-2">About the Club</h4>
          <p className="text-gray-800 leading-relaxed">{club.about}</p>
        </div>
      )}

      {club.description && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
          <p className="text-gray-800 leading-relaxed">{club.description}</p>
        </div>
      )}

      {club.eventImages && club.eventImages.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-3">Event Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {club.eventImages.slice(0, 4).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Event ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}

      {club.gallery && club.gallery.filter(img => img.isPublished).length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-3">Gallery</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {club.gallery
              .filter(img => img.isPublished)
              .slice(0, 4)
              .map((item, index) => (
                <div key={index} className="relative">
                  <img
                    src={item.image}
                    alt={item.caption || `Gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  {item.caption && (
                    <p className="text-xs text-gray-600 mt-1 truncate">{item.caption}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link
          to={`/clubs/${club._id}`}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          View Full Club Details
        </Link>
      </div>
    </div>
  );
};

export default ClubInfo;

