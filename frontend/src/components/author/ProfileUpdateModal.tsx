import React, { useState, useEffect } from 'react';
import { Loader2, Plus, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

interface ArticleLink {
  platform: string;
  url: string;
}

interface PublishedArticle {
  bookName: string;
  isbn: string;
  bookPhoto: string;
  links: ArticleLink[];
}

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
    createdAt: string;
    publishedArticles?: PublishedArticle[];
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

const emptyArticle = (): PublishedArticle => ({
  bookName: '',
  isbn: '',
  bookPhoto: '',
  links: [{ platform: '', url: '' }],
});

const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({
  isOpen,
  onClose,
  userData,
  authorData,
  onProfileUpdated,
}) => {
  const [formData, setFormData] = useState({
    pinCode: '',
    city: '',
    district: '',
    state: '',
    country: '',
    housePlot: '',
    landmark: '',
  });

  const [hasPublished, setHasPublished] = useState(false);
  const [articles, setArticles] = useState<PublishedArticle[]>([]);
  const [pinLoading, setPinLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && authorData) {
      setFormData({
        pinCode: authorData.address?.pinCode || '',
        city: authorData.address?.city || '',
        district: authorData.address?.district || '',
        state: authorData.address?.state || '',
        country: authorData.address?.country || '',
        housePlot: authorData.address?.housePlot || '',
        landmark: authorData.address?.landmark || '',
      });
      const existing = authorData.publishedArticles || [];
      setHasPublished(existing.length > 0);
      setArticles(existing.length > 0 ? existing.map(a => ({
        bookName: a.bookName || '',
        isbn: a.isbn || '',
        bookPhoto: a.bookPhoto || '',
        links: a.links?.length ? a.links : [{ platform: '', url: '' }],
      })) : []);
    }
  }, [isOpen, authorData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });

    if (name === 'pinCode') {
      const sanitized = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, pinCode: sanitized }));
      if (sanitized.length === 6) fetchPinCodeDetails(sanitized);
      else setFormData(prev => ({ ...prev, pinCode: sanitized, city: '', district: '', state: '', country: '' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchPinCodeDetails = async (pin: string) => {
    setPinLoading(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.UTILITY.PINCODE_LOOKUP(pin));
      if (response.data?.success && response.data?.data) {
        const { city, district, state, country, division } = response.data.data;
        setFormData(prev => ({ ...prev, city: city || '', district: district || division || '', state: state || '', country: country || 'India' }));
        toast.success('Address auto-filled from PIN code');
      } else {
        toast.error('Invalid PIN code');
      }
    } catch { toast.error('Failed to fetch PIN code details'); }
    finally { setPinLoading(false); }
  };

  // Article handlers
  const updateArticle = (idx: number, field: keyof PublishedArticle, value: any) => {
    setArticles(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };
  const addArticle = () => setArticles(prev => [...prev, emptyArticle()]);
  const removeArticle = (idx: number) => setArticles(prev => prev.filter((_, i) => i !== idx));
  const updateLink = (aIdx: number, lIdx: number, field: keyof ArticleLink, value: string) => {
    setArticles(prev => prev.map((a, ai) => ai === aIdx ? {
      ...a, links: a.links.map((l, li) => li === lIdx ? { ...l, [field]: value } : l)
    } : a));
  };
  const addLink = (aIdx: number) => {
    setArticles(prev => prev.map((a, i) => i === aIdx ? { ...a, links: [...a.links, { platform: '', url: '' }] } : a));
  };
  const removeLink = (aIdx: number, lIdx: number) => {
    setArticles(prev => prev.map((a, i) => i === aIdx ? { ...a, links: a.links.filter((_, li) => li !== lIdx) } : a));
  };

  const handlePhotoUpload = async (aIdx: number, file: File) => {
    const formDataUpload = new FormData();
    formDataUpload.append('profilePicture', file);
    try {
      const res = await axiosInstance.post(API_ENDPOINTS.AUTHOR.UPLOAD_PROFILE_PICTURE, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.data?.profilePicture || res.data?.data?.url || '';
      if (url) updateArticle(aIdx, 'bookPhoto', url);
      toast.success('Photo uploaded');
    } catch { toast.error('Failed to upload photo'); }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.pinCode || formData.pinCode.length !== 6) newErrors.pinCode = 'Valid 6-digit PIN code is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.housePlot.trim()) newErrors.housePlot = 'House/Plot number is required';

    if (hasPublished) {
      articles.forEach((a, i) => {
        if (!a.bookName.trim()) newErrors[`article_${i}_name`] = 'Book name is required';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { toast.error('Please fill all required fields'); return; }

    setSubmitting(true);
    try {
      const payload: any = {
        address: {
          pinCode: formData.pinCode,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          country: formData.country || 'India',
          housePlot: formData.housePlot.trim(),
          landmark: formData.landmark.trim(),
        },
        publishedArticles: hasPublished ? articles.filter(a => a.bookName.trim()).map(a => ({
          bookName: a.bookName.trim(),
          isbn: a.isbn.trim(),
          bookPhoto: a.bookPhoto,
          links: a.links.filter(l => l.platform.trim() && l.url.trim()),
        })) : [],
      };

      await axiosInstance.put(API_ENDPOINTS.AUTHOR.UPDATE_PROFILE, payload);
      toast.success('Profile updated successfully');
      onProfileUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally { setSubmitting(false); }
  };

  const enrollmentDate = authorData?.createdAt
    ? new Date(authorData.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'N/A';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Author Profile Update" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Read-only Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="User ID" value={userData?.userId || ''} disabled readOnly />
          <Input label="Date of Enrollment" value={enrollmentDate} disabled readOnly />
          <Input label="First Name" value={userData?.firstName || ''} disabled readOnly />
          <Input label="Last Name" value={userData?.lastName || ''} disabled readOnly />
          <Input label="Phone No" value={userData?.mobile || 'Not provided'} disabled readOnly />
          <Input label="Email ID" value={userData?.email || ''} disabled readOnly />
        </div>

        <div className="border-t border-neutral-200 dark:border-dark-300" />

        {/* Present Address */}
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Present Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input label="Enter PIN Code *" name="pinCode" value={formData.pinCode} onChange={handleChange} placeholder="6-digit PIN code" maxLength={6}
              rightIcon={pinLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary-500" /> : undefined} />
            {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode}</p>}
          </div>
          <Input label="Division / City" name="district" value={formData.district} disabled readOnly placeholder="Auto-filled from PIN" />
          <div>
            <Input label="City" name="city" value={formData.city} disabled readOnly placeholder="Auto-filled from PIN" />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
          <div>
            <Input label="State" name="state" value={formData.state} disabled readOnly placeholder="Auto-filled from PIN" />
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
          <Input label="Country" name="country" value={formData.country} disabled readOnly placeholder="Auto-filled from PIN" />
          <div>
            <Input label="House / Plot No *" name="housePlot" value={formData.housePlot} onChange={handleChange} placeholder="Enter house/plot number" />
            {errors.housePlot && <p className="text-red-500 text-xs mt-1">{errors.housePlot}</p>}
          </div>
          <Input label="Land Mark" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Enter nearby landmark (optional)" />
        </div>

        <div className="border-t border-neutral-200 dark:border-dark-300" />

        {/* Published Books/Articles Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Have you published books or articles?</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setHasPublished(true); if (articles.length === 0) addArticle(); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${hasPublished ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>
                Yes
              </button>
              <button type="button" onClick={() => setHasPublished(false)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!hasPublished ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>
                No
              </button>
            </div>
          </div>

          {hasPublished && (
            <div className="space-y-4">
              {articles.map((article, aIdx) => (
                <div key={aIdx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3 relative bg-gray-50 dark:bg-gray-800/50">
                  {articles.length > 1 && (
                    <button type="button" onClick={() => removeArticle(aIdx)}
                      className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Input label="Book/Article Name *" value={article.bookName}
                        onChange={(e) => updateArticle(aIdx, 'bookName', e.target.value)} placeholder="Enter Name or Title" />
                      {errors[`article_${aIdx}_name`] && <p className="text-red-500 text-xs mt-1">{errors[`article_${aIdx}_name`]}</p>}
                    </div>
                    <Input label="ISBN Number" value={article.isbn}
                      onChange={(e) => updateArticle(aIdx, 'isbn', e.target.value)} placeholder="Enter the ISBN No" />
                  </div>

                  {/* Book Photo Upload */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Book Photo</label>
                    <div className="flex items-center gap-3">
                      {article.bookPhoto ? (
                        <div className="relative">
                          <img src={article.bookPhoto} alt="Book" className="w-16 h-16 object-cover rounded-lg border" />
                          <button type="button" onClick={() => updateArticle(aIdx, 'bookPhoto', '')}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50">
                          <Upload className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">Upload Photo</span>
                          <input type="file" className="hidden" accept="image/*"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(aIdx, f); }} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Links */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Book Links</label>
                    <div className="space-y-2">
                      {article.links.map((link, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2">
                          <input type="text" value={link.platform} onChange={(e) => updateLink(aIdx, lIdx, 'platform', e.target.value)}
                            placeholder="Platform (e.g. Amazon)" className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                          <input type="text" value={link.url} onChange={(e) => updateLink(aIdx, lIdx, 'url', e.target.value)}
                            placeholder="Paste book link" className="flex-[2] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                          {article.links.length > 1 && (
                            <button type="button" onClick={() => removeLink(aIdx, lIdx)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => addLink(aIdx)}
                        className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium mt-1">
                        <Plus className="w-3.5 h-3.5" /> Add another link
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addArticle}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 w-full justify-center font-medium">
                <Plus className="w-4 h-4" /> Add Another Book/Article
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-dark-300">
          <Button type="submit" variant="primary" isLoading={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 min-w-[140px]">
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileUpdateModal;
