import { useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';

export function CrowdfundingProjectForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [descriptionError, setDescriptionError] = useState('');
  const [goalAmountError, setGoalAmountError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (description.length > 5000 || parseInt(goalAmount) < 10) {
      setLoading(false);
      return;
    }

    try {
      let imageUrl = null;

      if (imageFile) {
        const imageForm = new FormData();
        imageForm.append('image', imageFile);
        const res = await axiosInstance.post('/api/crowdfunding-projects/image', imageForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = res.data.image_url;
      }

      await axiosInstance.post('/api/crowdfunding-projects', {
        title,
        description,
        goal_amount: goalAmount,
        deadline,
        image_path: imageUrl,
      });

      setTitle('');
      setDescription('');
      setGoalAmount('');
      setDeadline('');
      setImageFile(null);
      alert('Project submitted successfully.');
    } catch (err) {
      console.error('Submission failed', err);
      alert('Submission failed.');
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-16 mb-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-blue-900">
          Create a New Crowdfunding Project
        </h2>

        <Card className="shadow-lg border border-blue-100">
          <CardContent className="p-8 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* タイトル */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Title<span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                  required
                />
                {errors.title?.[0] && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Description<span className="text-red-500 ml-1">*</span>
                </label>
                <Textarea
                  onChange={(e) => {
                    const value = e.target.value;
                    setDescription(value);
                    setDescriptionError(value.length > 5000 ? '説明は5000文字以内にしてください' : '');
                  }}
                  value={description}
                  className={`h-150 resize-y ${errors.description || descriptionError ? 'border-red-500' : ''}`}
                  required
                />
                {descriptionError && <p className="text-red-500 text-sm mt-1">{descriptionError}</p>}
                {errors.description?.[0] && <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>}
              </div>

              {/* 金額 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Funding Goal (USD)<span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setGoalAmount(value);
                    setGoalAmountError(parseInt(value) < 10 ? '10ドル以上にしてください' : '');
                  }}
                  className={errors.goal_amount || goalAmountError ? 'border-red-500' : ''}
                  required
                />
                {goalAmountError && <p className="text-red-500 text-sm mt-1">{goalAmountError}</p>}
                {errors.goal_amount?.[0] && <p className="text-red-500 text-sm mt-1">{errors.goal_amount[0]}</p>}
              </div>

              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Deadline<span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={errors.deadline ? 'border-red-500' : ''}
                  required
                />
                {errors.deadline?.[0] && <p className="text-red-500 text-sm mt-1">{errors.deadline[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Project Image (optional)</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Project for Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 text-center mt-4">
          * Your information will be encrypted and securely transmitted.
        </p>
      </div>
    </AppLayout>
  );
}

