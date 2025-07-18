import { useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from '../components/AppLayout';

export function PaidPostForm() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [price, setPrice] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 4);
    setImageFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    formData.append('price', price);
    imageFiles.forEach(file => {
      formData.append('images[]', file);
    });

    try {
      await axiosInstance.post('/api/paid-posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setTitle('');
      setText('');
      setPrice('');
      setImageFiles([]);
      alert('Paid post submitted successfully.');
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Please log in.');
      } else {
        console.error('Failed to submit paid post.', err);
      }
    }
  };

  return (
    <AppLayout>
      <Card className="max-w-4xl w-full mt-20 mb-8 shadow-md">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold">New Paid Post</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
            />

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Please enter your post content."
              rows={4}
              className="resize-none"
            />

            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price (¥)"
              min={100}
              max={10000}
              required
            />

            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              multiple
            />

            <Button type="submit" className="w-full">
              Submit Paid Post
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
