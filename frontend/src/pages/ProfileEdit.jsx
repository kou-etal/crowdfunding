// src/pages/ProfileEdit.jsx
import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';

export function ProfileEdit() {
  const [profile, setProfile] = useState({
    name: '',
    full_name: '',
    bio: '',
    profile_image: '',
    role: 'supporter',
    degree: '',
    expertise: '',
    university: '',
    institute: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/api/profile')
      .then(res => {
        const data = res.data;
        setProfile({
          name: data.name || '',
          full_name: data.full_name || '',
          bio: data.bio || '',
          profile_image: data.profile_image || '',
          role: data.role || 'supporter',
          degree: data.degree?.toString() || '',
          expertise: data.expertise || '',
          university: data.university || '',
          institute: data.institute || ''
        });
      })
      .catch(err => console.error('Failed to fetch profile', err));
  }, []);

  const handleChange = e => setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDegreeChange = value => setProfile(prev => ({ ...prev, degree: value }));
  const handleRoleChange = value => setProfile(prev => ({ ...prev, role: value }));

  const handleImageChange = e => {
    const file = e.target.files?.[0] || null;
    setImageError('');
    setImageFile(null);
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const maxBytes = 5 * 1024 * 1024;
    if (!isImage) { setImageError('Please select an image file (jpg, png, webp, etc.). PDFs are not allowed.'); return; }
    if (file.size > maxBytes) { setImageError('Image is too large. Max size is 5MB.'); return; }
    setImageFile(file);
  };

  const handleImageUpload = async () => {
    if (!imageFile) { setImageError('Please select an image first.'); return; }
    if (imageError) return;
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      setLoading(true);
      await axiosInstance.post('/api/profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const res = await axiosInstance.get('/api/profile');
      setProfile(res.data);
      setImageFile(null);
      setImageError('');
      alert('Profile image updated.');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to upload image';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post('/api/profile', profile);
      alert('Profile updated successfully!');
      navigate("/");
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Card className="max-w-3xl mx-auto w-full mt-20 mb-8 shadow-md">
        <CardContent className="p-8 space-y-6 min-w-0">
          <h2 className="text-2xl font-bold text-center text-blue-900">Edit Profile</h2>

          <div className="flex flex-col items-center space-y-4 min-w-0">
            {profile.profile_image && (
              <img
                src={profile.profile_image}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="space-y-2 text-center w-full max-w-md mx-auto">
              <Label htmlFor="profile_image">Profile Image <span className="text-red-500">*</span></Label>
              <Input
                id="profile_image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                aria-label="Select profile image"
              />
              {imageError && <p className="text-sm text-red-600 break-words">{imageError}</p>}
              <p className="text-sm text-gray-500">Upload a clear face photo. (Max 5MB)</p>
              <Button
                type="button"
                onClick={handleImageUpload}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                disabled={loading || !imageFile || !!imageError}
              >
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 min-w-0">
            <div>
              <Label htmlFor="name">User Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
                placeholder="e.g. john"
              />
            </div>

            <div>
              <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="full_name"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                required
                placeholder="e.g. John Doe"
              />
              <p className="text-sm text-gray-500">Enter your full legal name.</p>
            </div>

            <div>
              <Label htmlFor="bio">Bio <span className="text-red-500">*</span></Label>
              <Textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                required
                className="h-32"
                placeholder="Tell us about yourself, your goals, or research interest..."
              />
              <p className="text-sm text-gray-500">Max 2000 characters</p>
            </div>

            <div>
              <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
              <Select value={profile.role} onValueChange={handleRoleChange} required>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supporter">Supporter</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 break-words">
                Choose "Researcher" if you plan to post campaigns.
                Researchers are required to complete identity verification, which includes providing your supervisor's full name, affiliation, and email address.*
              </p>
            </div>

            {profile.role === 'researcher' && (
              <>
                <div>
                  <Label htmlFor="degree">Degree <span className="text-red-500">*</span></Label>
                  <Select value={profile.degree} onValueChange={handleDegreeChange} required>
                    <SelectTrigger id="degree" className="w-full">
                      <SelectValue placeholder="Select your degree" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="修士">Master's</SelectItem>
                      <SelectItem value="博士">PhD</SelectItem>
                      <SelectItem value="その他">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Your current academic degree.</p>
                </div>

                <div>
                  <Label htmlFor="expertise">Expertise <span className="text-red-500">*</span></Label>
                  <Input
                    id="expertise"
                    name="expertise"
                    value={profile.expertise}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Biomedical Engineering"
                  />
                  <p className="text-sm text-gray-500">Field of research or academic expertise.</p>
                </div>

                <div>
                  <Label htmlFor="university">University <span className="text-red-500">*</span></Label>
                  <Input
                    id="university"
                    name="university"
                    value={profile.university}
                    onChange={handleChange}
                    required
                    placeholder="e.g. University of Tokyo"
                  />
                </div>

                <div>
                  <Label htmlFor="institute">Institute <span className="text-red-500">*</span></Label>
                  <Input
                    id="institute"
                    name="institute"
                    value={profile.institute}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Graduate School of Engineering"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
