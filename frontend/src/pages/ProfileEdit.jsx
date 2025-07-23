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
      await axiosInstance.post('/api/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const res = await axiosInstance.get('/api/profile');
      setProfile(res.data);
    } catch (err) {
      alert('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/profile', profile);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  return (
    <AppLayout>
      <Card className="max-w-4xl mx-auto w-full mt-20 mb-8 shadow-md">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            {profile.profile_image && (
              <img
                src={profile.profile_image}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Profile Image:</Label>
              <Input type="file" onChange={handleImageChange} />
              <Button type="button" onClick={handleImageUpload} className="mt-1" variant="secondary">
                Upload
              </Button>
            </div>

            <div>
              <Label>User Name:</Label>
              <Input name="name" value={profile.name} onChange={handleChange} />
            </div>

            <div>
  <Label>Full Name:</Label>
  <Input name="full_name" value={profile.full_name} onChange={handleChange} />
</div>


            <div>
              <Label>Bio:</Label>
              <Textarea className='h-90' name="bio" value={profile.bio} onChange={handleChange} />
            </div>

            <div>
              <Label>Role:</Label>
              <Select value={profile.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
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
                  <Label>Degree:</Label>
                  <Select value={profile.degree} onValueChange={handleDegreeChange}>
                    <SelectTrigger>
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
                  <Label>Expertise:</Label>
                  <Input name="expertise" value={profile.expertise} onChange={handleChange} />
                </div>

                <div>
                  <Label>University:</Label>
                  <Input name="university" value={profile.university} onChange={handleChange} />
                </div>

                <div>
                  <Label>Institute:</Label>
                  <Input name="institute" value={profile.institute} onChange={handleChange} />
                </div>
              </>
            )}

            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
