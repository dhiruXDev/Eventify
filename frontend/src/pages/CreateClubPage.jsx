import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { clubService } from '../services';
import Navbar from '../components/layout/Navbar';
import GeneralFooter from './GeneralFooter';

const CreateClubPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const clubSchema = Yup.object().shape({
    name: Yup.string()
      .required('Club name is required')
      .min(3, 'Club name must be at least 3 characters')
      .max(100, 'Club name cannot exceed 100 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters'),
    type: Yup.string()
      .required('Club type is required'),
    about: Yup.string(),
    officeLocation: Yup.string(),
    officeOpeningTime: Yup.string(),
    officeClosingTime: Yup.string(),
    designation: Yup.string()
      .required('Your designation is required')
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      type: 'Technical',
      tags: [],
      about: '',
      officeLocation: '',
      officeOpeningTime: '09:00',
      officeClosingTime: '17:00',
      designation: 'Chairman',
      isPublished: false
    },
    validationSchema: clubSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Convert logo file to base64 if provided
        let logoBase64 = '';
        if (logoFile) {
          // Compress image before converting to base64
          logoBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                  if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                  }
                } else {
                  if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                  }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with quality compression (0.8 = 80% quality)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                resolve(compressedBase64);
              };
              img.onerror = reject;
              img.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(logoFile);
          });
        }

        const clubData = {
          ...values,
          logo: logoBase64 || values.logo || ''
        };

        const response = await clubService.createClub(clubData);

        if (response && response.success) {
          // Show success message briefly before navigating
          setError(null);
          navigate('/profile');
        } else {
          setError(response?.message || 'Failed to create club. Please try again.');
        }
      } catch (err) {
        // Extract error message
        const errorMessage = err.message || err.response?.data?.message || 'Failed to create club. Please check your input and try again.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Your Club</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Club Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club Logo
              </label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300"
                  />
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 2MB</p>
                </div>
              </div>
            </div>

            {/* Club Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Club Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Brief description of your club..."
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.description}</p>
              )}
            </div>

            {/* Club Type and Designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Club Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Technical">Technical</option>
                  <option value="Social Service">Social Service</option>
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Academic">Academic</option>
                  <option value="Entrepreneurship">Entrepreneurship</option>
                  <option value="Arts">Arts</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Designation *
                </label>
                <select
                  id="designation"
                  name="designation"
                  value={formik.values.designation}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Chairman">Chairman</option>
                  <option value="Co-ordination">Co-ordination</option>
                  <option value="OverallCoordination">Overall Coordination</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Member">Member</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Office Location */}
            <div>
              <label htmlFor="officeLocation" className="block text-sm font-medium text-gray-700 mb-2">
                Office Location
              </label>
              <input
                id="officeLocation"
                type="text"
                name="officeLocation"
                value={formik.values.officeLocation}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Building A, Room 101"
              />
            </div>

            {/* Office Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="officeOpeningTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Office Opening Time
                </label>
                <input
                  id="officeOpeningTime"
                  type="time"
                  name="officeOpeningTime"
                  value={formik.values.officeOpeningTime}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="officeClosingTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Office Closing Time
                </label>
                <input
                  id="officeClosingTime"
                  type="time"
                  name="officeClosingTime"
                  value={formik.values.officeClosingTime}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* About */}
            <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-2">
                About the Club
              </label>
              <textarea
                id="about"
                name="about"
                rows={6}
                value={formik.values.about}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Tell us more about your club, its mission, activities, etc."
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                name="tags"
                value={formik.values.tags.join(', ')}
                onChange={(e) => {
                  const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                  formik.setFieldValue('tags', tagsArray);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Programming, Robotics, AI"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>

            {/* Publish Option */}
            <div className="flex items-center">
              <input
                id="isPublished"
                type="checkbox"
                name="isPublished"
                checked={formik.values.isPublished}
                onChange={formik.handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                Publish club (make it visible to all users)
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Club'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
            
          </form>
        </div>
      </div>
      <GeneralFooter />
    </div>
  );
};

export default CreateClubPage;

