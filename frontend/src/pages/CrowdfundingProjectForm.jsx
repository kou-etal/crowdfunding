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
  const [deadlineError, setDeadlineError] = useState('');
  const [imageError, setImageError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setDescriptionError('');
    setGoalAmountError('');
    setDeadlineError('');
    setImageError('');
    setLoading(true);

    // フロント側バリデーション
    let hasError = false;

    if (description.length > 5000) {
      setDescriptionError('Description must be within 5000 characters.');
      hasError = true;
    }
    if (parseInt(goalAmount) < 10) {
      setGoalAmountError('Funding goal must be at least $10.');
      hasError = true;
    }
    // 未来日チェック
    const today = new Date();
    const selectedDate = new Date(deadline);
    if (!deadline || selectedDate <= today) {
      setDeadlineError('Please select a future date.');
      hasError = true;
    }
    // 画像必須
    if (!imageFile) {
      setImageError('Project image is required.');
      hasError = true;
    }

    if (hasError) {
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

      // 成功後リセット
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
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Crowdfunding project submission form">
              
              {/* Project Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a short, clear project title"
                  required
                />
                <p id="title-help" className="text-xs text-gray-500 mt-1">
                  Keep it concise — around 60 characters is ideal.
                </p>
                {errors.title?.[0] && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
              </div>

              {/* Project Description */}
              {/* Project Description */}
<div>
  <label htmlFor="description" className="block text-sm font-medium mb-1">
    Project Description <span className="text-red-500">*</span>
  </label>
  <Textarea
    id="description"
    onChange={(e) => {
      const value = e.target.value;
      setDescription(value);
      setDescriptionError(value.length > 5000 ? 'Description must be within 5000 characters.' : '');
    }}
    value={description}
    placeholder="Explain your project in detail so supporters understand your goals."
    required
    className={`h-60 resize-y ${errors.description || descriptionError ? 'border-red-500' : ''}`} // ← 高さ拡大
  />
  {descriptionError && <p className="text-red-500 text-sm mt-1">{descriptionError}</p>}
  {errors.description?.[0] && <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>}
</div>

             

              {/* Funding Goal */}
              <div>
                <label htmlFor="goalAmount" className="block text-sm font-medium mb-1">
                  Funding Goal (USD) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="goalAmount"
                  type="number"
                  value={goalAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setGoalAmount(value);
                    setGoalAmountError(parseInt(value) < 10 ? 'Funding goal must be at least $10.' : '');
                  }}
                  placeholder="Enter your target funding amount in USD"
                  required
                />
                {goalAmountError && <p className="text-red-500 text-sm mt-1">{goalAmountError}</p>}
                {errors.goal_amount?.[0] && <p className="text-red-500 text-sm mt-1">{errors.goal_amount[0]}</p>}
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium mb-1">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    const selectedDate = new Date(e.target.value);
                    const today = new Date();
                    if (!e.target.value || selectedDate <= today) {
                      setDeadlineError('Please select a future date.');
                    } else {
                      setDeadlineError('');
                    }
                  }}
                  required
                />
                   <p id="deadline-help" className="text-xs text-gray-500 mt-1">
                  Select the date when your campaign will end.
                </p>
                {deadlineError && <p className="text-red-500 text-sm mt-1">{deadlineError}</p>}
                {errors.deadline?.[0] && <p className="text-red-500 text-sm mt-1">{errors.deadline[0]}</p>}
              </div>

              {/* Project Image */}
              <div>
                <label htmlFor="projectImage" className="block text-sm font-medium mb-1">
                  Project Image <span className="text-red-500">*</span>
                </label>
                <Input
                  id="projectImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setImageFile(e.target.files?.[0] || null);
                    setImageError(e.target.files?.[0] ? '' : 'Project image is required.');
                  }}
                  required
                />
                {imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}
                <p id="image-help" className="text-xs text-gray-500 mt-1">
                  An image helps attract supporters.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800"
                  disabled={loading}
                >
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
