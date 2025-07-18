import { useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import AppLayout from '../components/AppLayout';

export function CrowdfundingProjectForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post('/api/crowdfunding-projects', {
        title,
        description,
        goal_amount: goalAmount,
        deadline,
      });

      // 入力初期化
      setTitle('');
      setDescription('');
      setGoalAmount('');
      setDeadline('');
      alert('プロジェクトを投稿しました');
    } catch (err) {
      console.error('投稿に失敗しました', err);
      alert('投稿に失敗しました');
    }
  };

  return (
    <AppLayout>
      <Card className="max-w-2xl w-full mt-20 mb-8 shadow-md">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold">新しいクラウドファンディング</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              placeholder="プロジェクト名"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              placeholder="プロジェクトの説明"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />

            <Input
              type="number"
              placeholder="目標金額（円）"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              required
            />

            <Input
              type="date"
              placeholder="締切日"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />

            <Button type="submit" className="w-full">
              投稿する
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
