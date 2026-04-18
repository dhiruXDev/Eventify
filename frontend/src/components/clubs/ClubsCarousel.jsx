import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import { clubService } from '../../services';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const ClubsCarousel = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
   
    const fetchClubs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await clubService.getAllClubs({ isPublished: true });
        const clubsData = response?.data || [];
        setClubs(clubsData);
      } catch (err) {
        // Silently handle errors on landing page - don't show to users
        // Just set empty array and continue
        console.error('ClubsCarousel: Error fetching clubs:', err);
        console.warn('ClubsCarousel: Could not fetch clubs for carousel:', err.message);
        setClubs([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Don't show error or empty state - just return null if no clubs
  if (error || clubs.length === 0) {
    return null;
  }

  return (
    <section className="my-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Our Clubs
          </h2>
          <p className="text-gray-600 text-lg">
            Discover amazing clubs and their activities
          </p>
        </div>

        <Swiper
          modules={[Pagination, Autoplay, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          navigation={true}
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 1,
            },
            1024: {
              slidesPerView: 1,
            },
          }}
          className="clubs-carousel"
        >
          {clubs.map((club) => (
            <SwiperSlide key={club._id}>
              <Link to={`/clubs/${club._id}`}>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer">
                  <div className="md:flex">
                    {/* Club Logo/Image Section */}
                    <div className="md:w-1/3 bg-gradient-to-br from-green-500 to-blue-600 p-8 flex items-center justify-center">
                      {club.logo ? (
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="w-32 h-32 object-contain rounded-lg bg-white p-2"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                          <span className="text-4xl font-bold text-green-600">
                            {club.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Club Info Section */}
                    <div className="md:w-2/3 p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                            {club.name}
                          </h3>
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                            {club.type}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {club.description}
                      </p>

                      {/* Tags */}
                      {club.tags && club.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {club.tags.slice(0, 5).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {club.officeLocation && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate max-w-xs">{club.officeLocation}</span>
                          </div>
                        )}
                        {(club.officeOpeningTime || club.officeClosingTime) && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                              {club.officeOpeningTime} - {club.officeClosingTime}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <span className="text-green-600 font-semibold hover:text-green-700">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ClubsCarousel;

