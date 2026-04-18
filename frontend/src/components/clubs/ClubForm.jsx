import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { clubService } from '../../services';

const ClubForm = ({ club, userId, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(club?.logo || null);
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
  });

  const formik = useFormik({
    initialValues: {
      name: club?.name || '',
      description: club?.description || '',
      type: club?.type || 'Technical',
      tags: club?.tags || [],
      about: club?.about || '',
      officeLocation: club?.officeLocation || '',
      officeOpeningTime: club?.officeOpeningTime || '09:00',
      officeClosingTime: club?.officeClosingTime || '17:00',
      isPublished: club?.isPublished || false,
      memberLimit: club?.memberLimit || 10,
      members: club?.members || [],
      gallery: club?.gallery || []
    },
    validationSchema: clubSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);

      // Validate logo
      if (!logoPreview && !club?.logo) {
        setError('Please upload a club logo');
        setIsLoading(false);
        return;
      }

      try {
        // Convert logo file to base64 if provided
        let logoBase64 = logoPreview || club?.logo || '';
        if (logoFile) {
          logoBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(logoFile);
          });
        }

        // Ensure tags is an array
        const tagsArray = Array.isArray(values.tags) ? values.tags :
          (typeof values.tags === 'string' ? values.tags.split(',').map(t => t.trim()).filter(t => t) : []);

        const clubData = {
          ...values,
          tags: tagsArray,
          logo: logoBase64
        };

        let response;

        if (club?._id) {
          // Update existing club
          response = await clubService.updateClub(club._id, clubData);
        } else {
          // Create new club
          response = await clubService.createClub({
            ...clubData,
            designation: 'Chairman' // Default designation for creator
          });
        }

        if (response.success) {
          // Populate the response data if needed
          const clubData = response.data;
          if (onSuccess) {
            onSuccess(clubData);
          }
        }
      } catch (err) {
        setError(err.message || `Failed to ${club ? 'update' : 'create'} club`);
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

  const handleMemberPhotoChange = (index, file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for the member');
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        setError('Member image size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMembers = [...formik.values.members];
        newMembers[index].photo = reader.result;
        formik.setFieldValue('members', newMembers);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Club Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Club Logo *
        </label>
        <div className="flex items-start gap-4">
          {logoPreview ? (
            <div className="relative">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={() => {
                  setLogoPreview(null);
                  setLogoFile(null);
                  setError(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                title="Remove logo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <label className="cursor-pointer">
              <div className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 inline-block text-sm font-semibold">
                {logoPreview ? 'Change Logo' : 'Upload Logo'}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Recommended: Square image, max 2MB. Formats: JPG, PNG, GIF
            </p>
            {!logoPreview && !club?.logo && (
              <p className="text-xs text-red-500 mt-1">Logo is required</p>
            )}
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
          rows={3}
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

      {/* Club Type */}
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="officeOpeningTime" className="block text-sm font-medium text-gray-700 mb-2">
            Opening Time
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
            Closing Time
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
          rows={4}
          value={formik.values.about}
          onChange={formik.handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Tell us more about your club, its mission, activities, etc."
        />
      </div>

      {/* Tags */}
      {/* <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          type="text"
          name="tags"
          value={Array.isArray(formik.values.tags) ? formik.values.tags.join(', ') : formik.values.tags || ''}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (inputValue.trim() === '') {
              formik.setFieldValue('tags', []);
            } else {
              const tagsArray = inputValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
              formik.setFieldValue('tags', tagsArray);
            }
          }}
          onBlur={formik.handleBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g., Programming, Robotics, AI"
        />
        <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
        {formik.values.tags && formik.values.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formik.values.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => {
                    const newTags = formik.values.tags.filter((_, i) => i !== index);
                    formik.setFieldValue('tags', newTags);
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div> */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tags
        </label>

        <input
          id="tags"
          type="text"
          value={formik.values.tagInput || ""}
          onChange={(e) => {
            formik.setFieldValue("tagInput", e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();

              const value = formik.values.tagInput.trim();
              if (!value) return;

              const newTag = value.replace(",", "");
              const existingTags = formik.values.tags || [];

              if (!existingTags.includes(newTag)) {
                formik.setFieldValue("tags", [...existingTags, newTag]);
              }

              formik.setFieldValue("tagInput", "");
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Type a tag and press Enter"
        />

        <p className="text-xs text-gray-500 mt-1">
          Press Enter or comma to add a tag
        </p>

        {/* TAG CHIPS */}
        {formik.values.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formik.values.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => {
                    const updatedTags = formik.values.tags.filter(
                      (_, i) => i !== index
                    );
                    formik.setFieldValue("tags", updatedTags);
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>


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

      <hr className="my-6 border-gray-200" />

      {/* Member Limit */}
      <div>
        <label htmlFor="memberLimit" className="block text-sm font-medium text-gray-700 mb-2">
          Member Limit *
        </label>
        <select
          id="memberLimit"
          name="memberLimit"
          value={formik.values.memberLimit}
          onChange={formik.handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value={10}>10 Members</option>
          <option value={15}>15 Members</option>
          <option value={20}>20 Members</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Maximum number of members allowed in the club.</p>
      </div>

      {/* Manual Member Management */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Member Management (Manual)</h3>
        <p className="text-sm text-gray-600 mb-4">Add the core team and members of your club manually.</p>

        <div className="space-y-4">
          {formik.values.members.map((member, index) => (
            <div key={index} className="bg-white p-4 rounded border border-gray-300 relative">
              <button
                type="button"
                onClick={() => {
                  const newMembers = [...formik.values.members];
                  newMembers.splice(index, 1);
                  formik.setFieldValue('members', newMembers);
                }}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="First Name"
                  className="px-3 py-1 border rounded"
                  value={member.firstName}
                  onChange={(e) => {
                    const newMembers = [...formik.values.members];
                    newMembers[index].firstName = e.target.value;
                    formik.setFieldValue('members', newMembers);
                  }}
                />
                <input
                  placeholder="Last Name"
                  className="px-3 py-1 border rounded"
                  value={member.lastName}
                  onChange={(e) => {
                    const newMembers = [...formik.values.members];
                    newMembers[index].lastName = e.target.value;
                    formik.setFieldValue('members', newMembers);
                  }}
                />
                <select
                  className="px-3 py-1 border rounded"
                  value={member.designation}
                  onChange={(e) => {
                    const newMembers = [...formik.values.members];
                    newMembers[index].designation = e.target.value;
                    formik.setFieldValue('members', newMembers);
                  }}
                >
                  <option value="Member">Member</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Co-coordinator">Co-coordinator</option>
                </select>
                <input
                  placeholder="Branch (e.g., CSE)"
                  className="px-3 py-1 border rounded"
                  value={member.branch}
                  onChange={(e) => {
                    const newMembers = [...formik.values.members];
                    newMembers[index].branch = e.target.value;
                    formik.setFieldValue('members', newMembers);
                  }}
                />
                <select
                  className="px-3 py-1 border rounded"
                  value={member.graduationYear}
                  onChange={(e) => {
                    const newMembers = [...formik.values.members];
                    newMembers[index].graduationYear = e.target.value;
                    formik.setFieldValue('members', newMembers);
                  }}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
                <input
                  placeholder="Email"
                  className="px-3 py-1 border rounded"
                  value={member.email}
                  onChange={(e) => {
                    const newMembers = [...formik.values.members];
                    newMembers[index].email = e.target.value;
                    formik.setFieldValue('members', newMembers);
                  }}
                />
                <input
                  placeholder="Mobile No"
                  className="px-3 py-1 border rounded"
                  value={member.mobileNo}
                  onChange={(e) => {
                    const newMembers = [...formik.values.members];
                    newMembers[index].mobileNo = e.target.value;
                    formik.setFieldValue('members', newMembers);
                  }}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-700">Member Photo</label>
                  <div className="flex items-center gap-3">
                    {member.photo ? (
                      <div className="relative">
                        <img
                          src={member.photo}
                          alt="Member"
                          className="w-12 h-12 rounded-full object-cover border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newMembers = [...formik.values.members];
                            newMembers[index].photo = '';
                            formik.setFieldValue('members', newMembers);
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <span className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50">
                        {member.photo ? 'Change' : 'Upload'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleMemberPhotoChange(index, e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {formik.values.members.length < formik.values.memberLimit ? (
          <button
            type="button"
            onClick={() => {
              formik.setFieldValue('members', [...formik.values.members, {
                firstName: '', lastName: '', designation: 'Member', branch: '', graduationYear: '', email: '', mobileNo: '', photo: ''
              }]);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Member
          </button>
        ) : (
          <p className="mt-4 text-sm text-amber-600 font-medium italic">Member limit reached ({formik.values.memberLimit}). Increase limit or remove members to add more.</p>
        )}
        <p className="text-xs text-gray-500 mt-2">Vacant seats: {formik.values.memberLimit - formik.values.members.length}</p>
      </div>

      {/* Gallery Management */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Club Gallery</h3>
        <p className="text-sm text-gray-600 mb-4">Upload images to showcase your club's activities.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {formik.values.gallery.map((item, index) => (
            <div key={index} className="relative group">
              <img
                src={item.image}
                alt={`Gallery ${index}`}
                className="w-full h-32 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => {
                  const newGallery = [...formik.values.gallery];
                  newGallery.splice(index, 1);
                  formik.setFieldValue('gallery', newGallery);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-gray-500 mt-1">Add Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    formik.setFieldValue('gallery', [...formik.values.gallery, { image: reader.result, caption: '' }]);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 font-bold"
          >
            {isLoading ? 'Saving...' : (club ? 'Update Club Info' : 'Create Club')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          )}
        </div>

        {club && (
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Are you absolutely sure you want to delete this club? This action cannot be undone.')) {
                try {
                  setIsLoading(true);
                  const response = await clubService.deleteClub(club._id);
                  if (response.success) {
                    if (onSuccess) onSuccess(null);
                  }
                } catch (err) {
                  setError(err.message || 'Failed to delete club');
                  setIsLoading(false);
                }
              }
            }}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Club
          </button>
        )}
      </div>
    </form>
  );
};

export default ClubForm;

