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
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await axiosInstance.post('/api/crowdfunding-projects', {
        title,
        description,
        goal_amount: goalAmount,
        deadline,
      });

      setTitle('');
      setDescription('');
      setGoalAmount('');
      setDeadline('');
      alert('Project submitted successfully.');
    } catch (err) {
      console.error('Submission failed', err);
      alert('Submission failed.');
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Title<span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Next-gen Battery Research"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                  required
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Description<span className="text-red-500 ml-1">*</span>
                </label>
                <Textarea
                  placeholder="Background, purpose, how the funds will be used, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className={errors.description ? 'border-red-500' : ''}
                  required
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Funding Goal (USD)<span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g., 500000"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className={errors.goal_amount ? 'border-red-500' : ''}
                  required
                />
                {errors.goal_amount && <p className="text-red-500 text-sm mt-1">{errors.goal_amount}</p>}
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
                {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800">
                  Submit Project for Review
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

