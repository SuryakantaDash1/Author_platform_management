import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

interface ProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  authorData: {
    authorId: string;
    qualification: string;
    university: string;
    createdAt: string;
    address: {
      pinCode: string;
      city: string;
      district: string;
      state: string;
      country: string;
      housePlot: string;
      landmark: string;
    };
  };
  onProfileUpdated: () => void;
}

const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({
  isOpen,
  onClose,
  userData,
  authorData,
  onProfileUpdated,
}) => {
  const [formData, setFormData] = useState({
    qualification: '',
    university: '',
    pinCode: '',
    city: '',
    district: '',
    state: '',
    country: '',
    housePlot: '',
    landmark: '',
  });

  const [pinLoading, setPinLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens or authorData changes
  useEffect(() => {
    if (isOpen && authorData) {
      setFormData({
        qualification: authorData.qualification || '',
        university: authorData.university || '',
        pinCode: authorData.address?.pinCode || '',
        city: authorData.address?.city || '',
        district: authorData.address?.district || '',
        state: authorData.address?.state || '',
        country: authorData.address?.country || '',
        housePlot: authorData.address?.housePlot || '',
        landmark: authorData.address?.landmark || '',
      });
    }
  }, [isOpen, authorData]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'pinCode') {
      // Only allow digits, max 6
      const sanitized = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, pinCode: sanitized }));

      // Auto-fill address when 6 digits entered
      if (sanitized.length === 6) {
        fetchPinCodeDetails(sanitized);
      } else {
        // Clear auto-filled fields if pin is incomplete
        setFormData((prev) => ({
          ...prev,
          pinCode: sanitized,
          city: '',
          district: '',
          state: '',
          country: '',
        }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch pincode details
  const fetchPinCodeDetails = async (pin: string) => {
    setPinLoading(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.UTILITY.PINCODE_LOOKUP(pin));
      if (response.data?.success && response.data?.data) {
        const { city, district, state, country, division } = response.data.data;
        setFormData((prev) => ({
          ...prev,
          city: city || '',
          district: district || division || '',
          state: state || '',
          country: country || 'India',
        }));
        toast.success('Address auto-filled from PIN code');
      } else {
        toast.error('Invalid PIN code. Please check and try again.');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to fetch PIN code details';
      toast.error(message);
    } finally {
      setPinLoading(false);
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Highest qualification is required';
    }
    if (!formData.university.trim()) {
      newErrors.university = 'University name is required';
    }
    if (!formData.pinCode || formData.pinCode.length !== 6) {
      newErrors.pinCode = 'Valid 6-digit PIN code is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required (enter PIN code to auto-fill)';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required (enter PIN code to auto-fill)';
    }
    if (!formData.housePlot.trim()) {
      newErrors.housePlot = 'House/Plot number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear error on field change
  const handleChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
    handleChange(e);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        qualification: formData.qualification.trim(),
        university: formData.university.trim(),
        address: {
          pinCode: formData.pinCode,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          country: formData.country || 'India',
          housePlot: formData.housePlot.trim(),
          landmark: formData.landmark.trim(),
        },
      };

      await axiosInstance.put(API_ENDPOINTS.AUTHOR.UPDATE_PROFILE, payload);
      toast.success('Profile updated successfully');
      onProfileUpdated();
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Format enrollment date
  const enrollmentDate = authorData?.createdAt
    ? new Date(authorData.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Author Profile Update" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Read-only Fields Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="User ID"
            value={userData?.userId || ''}
            disabled
            readOnly
          />
          <Input
            label="Date of Enrollment"
            value={enrollmentDate}
            disabled
            readOnly
          />
          <Input
            label="First Name"
            value={userData?.firstName || ''}
            disabled
            readOnly
          />
          <Input
            label="Last Name"
            value={userData?.lastName || ''}
            disabled
            readOnly
          />
          <Input
            label="Phone No"
            value={userData?.mobile || ''}
            disabled
            readOnly
          />
          <Input
            label="Email ID"
            value={userData?.email || ''}
            disabled
            readOnly
          />
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 dark:border-dark-300" />

        {/* Editable Fields Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Highest Qualification *"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange2}
              placeholder="e.g. M.Tech, PhD, MBA"
            />
            {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
          </div>
          <div>
            <Input
              label="Passing from University *"
              name="university"
              value={formData.university}
              onChange={handleChange2}
              placeholder="e.g. IIT Delhi"
            />
            {errors.university && <p className="text-red-500 text-xs mt-1">{errors.university}</p>}
          </div>
          <div>
            <Input
              label="Enter PIN Code *"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange2}
              placeholder="6-digit PIN code"
              maxLength={6}
              rightIcon={
                pinLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                ) : undefined
              }
            />
            {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode}</p>}
          </div>
          <Input
            label="Division"
            name="district"
            value={formData.district}
            disabled
            readOnly
            placeholder="Auto-filled from PIN"
          />
          <div>
            <Input
              label="City"
              name="city"
              value={formData.city}
              disabled
              readOnly
              placeholder="Auto-filled from PIN"
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
          <Input
            label="District"
            name="district"
            value={formData.district}
            disabled
            readOnly
            placeholder="Auto-filled from PIN"
          />
          <div>
            <Input
              label="State"
              name="state"
              value={formData.state}
              disabled
              readOnly
              placeholder="Auto-filled from PIN"
            />
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
          <Input
            label="Country"
            name="country"
            value={formData.country}
            disabled
            readOnly
            placeholder="Auto-filled from PIN"
          />
          <div>
            <Input
              label="House / Plot No *"
              name="housePlot"
              value={formData.housePlot}
              onChange={handleChange2}
              placeholder="Enter house/plot number"
            />
            {errors.housePlot && <p className="text-red-500 text-xs mt-1">{errors.housePlot}</p>}
          </div>
          <Input
            label="Land Mark"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange2}
            placeholder="Enter nearby landmark (optional)"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 min-w-[140px]"
          >
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileUpdateModal;
