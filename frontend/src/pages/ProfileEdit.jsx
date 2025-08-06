import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from '../components/AppLayout';

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
  const [loading, setLoading] = useState(false);

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

  const handleChange = e => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDegreeChange = value => {
    setProfile(prev => ({ ...prev, degree: value }));
  };

  const handleRoleChange = value => {
    setProfile(prev => ({ ...prev, role: value }));
  };

  const handleImageChange = e => {
    setImageFile(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      setLoading(true);
      await axiosInstance.post('/api/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const res = await axiosInstance.get('/api/profile');
      setProfile(res.data);
    } catch (err) {
      alert('Failed to upload image');
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
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Card className="max-w-3xl mx-auto w-full mt-20 mb-8 shadow-md">
        <CardContent className="p-8 space-y-6">
          {/* タイトル */}
          <h2 className="text-2xl font-bold text-center text-blue-900">Edit Profile</h2>

          {/* 画像 + アップロード */}
          <div className="flex flex-col items-center space-y-4">
            {profile.profile_image && (
              <img
                src={profile.profile_image}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border"
              />
            )}
            <div className="space-y-2 text-center">
              <Label htmlFor="profile_image">Profile Image <span className="text-red-500">*</span></Label>
              <Input
                id="profile_image"
                type="file"
                onChange={handleImageChange}
                aria-label="Select profile image"
              />
             <Button
  type="button"
  onClick={handleImageUpload}
  className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
  disabled={loading}
>
  {loading ? "Uploading..." : "Upload"}
</Button>

            </div>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">User Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
                aria-required="true"
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
                aria-required="true"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio <span className="text-red-500">*</span></Label>
              <Textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                required
                aria-required="true"
                className="h-32"
              />
            </div>

            <div>
              <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
              <Select
                value={profile.role}
                onValueChange={handleRoleChange}
                required
                aria-required="true"
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supporter">Supporter</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {profile.role === 'researcher' && (
              <>
                <div>
                  <Label htmlFor="degree">Degree <span className="text-red-500">*</span></Label>
                  <Select
                    value={profile.degree}
                    onValueChange={handleDegreeChange}
                    required
                    aria-required="true"
                  >
                    <SelectTrigger id="degree">
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="修士">Master's</SelectItem>
                      <SelectItem value="博士">PhD</SelectItem>
                      <SelectItem value="その他">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expertise">Expertise <span className="text-red-500">*</span></Label>
                  <Input
                    id="expertise"
                    name="expertise"
                    value={profile.expertise}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>

                <div>
                  <Label htmlFor="university">University <span className="text-red-500">*</span></Label>
                  <Input
                    id="university"
                    name="university"
                    value={profile.university}
                    onChange={handleChange}
                    required
                    aria-required="true"
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
                    aria-required="true"
                  />
                </div>
              </>
            )}

            {/* Save ボタン */}
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
