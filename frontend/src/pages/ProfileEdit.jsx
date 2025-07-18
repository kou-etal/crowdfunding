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
    bio: '',
    profile_image: '',
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

    // degreeなどが数値なら文字列に変換
    setProfile({
      name: data.name || '',
      bio: data.bio || '',
      profile_image: data.profile_image || '',
      degree: data.degree?.toString() || '',
      expertise: data.expertise || '',
      university: data.university || '',
      institute: data.institute || ''
    });

    console.log('レスポンス内容:', data);
  })
  .catch(err => console.error('取得失敗', err));
  }, []);

  const handleChange = e => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDegreeChange = value => {
    setProfile(prev => ({ ...prev, degree: value }));
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
      if (err.response?.status === 401) {
        alert('Please log in.');
      } else {
        console.error('画像アップロード失敗', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/profile', profile);
      alert('Profile updated successfully!');
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Please log in.');
      } else {
        console.error('更新失敗', err);
      }
    }
  };
  return (
    <AppLayout>
      <Card className="max-w-4xl w-full mt-20 mb-8 shadow-md">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            {profile.profile_image && (
              <img
                src={profile.profile_image}
                alt="Profile Picture"
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Select Image:</Label>
              <Input type="file" onChange={handleImageChange} />
              <Button type="button" onClick={handleImageUpload} className="mt-1" variant="secondary">
                Upload
              </Button>
            </div>

            <div>
              <Label>Name:</Label>
              <Input name="name" value={profile.name} onChange={handleChange} />
            </div>

            <div>
              <Label>Bio:</Label>
              <Textarea name="bio" value={profile.bio} onChange={handleChange} />
            </div>

            <div>
  <Label>Degree:</Label>
  <Select value={profile.degree} onValueChange={handleDegreeChange}>
    <SelectTrigger>
      <SelectValue placeholder="Select degree">
        {profile.degree || 'Select degree'}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="修士">修士</SelectItem>
      <SelectItem value="博士">博士</SelectItem>
      <SelectItem value="その他">その他</SelectItem>
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

            <Button type="submit" className="w-full">Save</Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}