import { useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import AppLayout from "../components/AppLayout";

export function IdentityVerificationForm() {
  const [form, setForm] = useState({
    supervisor_name: "",
    supervisor_email: "",
    supervisor_affiliation: "",
    honor_statement: false,
  });

  const [faceImage, setFaceImage] = useState(null);
  const [docImage, setDocImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckboxChange = (checked) => {
    setForm((prev) => ({ ...prev, honor_statement: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!faceImage || !docImage) return alert("両方の画像をアップロードしてください。");
    if (!form.honor_statement) return alert("honor statement を承諾してください。");

    setLoading(true);
    try {
      // ① 画像アップロード
      const imageForm = new FormData();
      imageForm.append("face_image", faceImage);
      imageForm.append("document_image", docImage);

      const uploadRes = await axiosInstance.post("/api/identity-verification/upload-images", imageForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { face_image_url, document_image_url } = uploadRes.data;

      // ② 情報保存
      await axiosInstance.post("/api/identity-verification", {
        face_image_path: face_image_url,
        document_image_path: document_image_url,
        honor_statement: true,
        supervisor_name: form.supervisor_name,
        supervisor_email: form.supervisor_email,
        supervisor_affiliation: form.supervisor_affiliation,
      });

      alert("提出が完了しました！");
    } catch (err) {
      console.error("送信失敗", err);
      alert("送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Card className="max-w-3xl mx-auto mt-20 shadow-md">
        <CardContent className="space-y-6 p-8">
          <h2 className="text-2xl font-bold">本人確認フォーム</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>顔写真:</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFaceImage(e.target.files?.[0] || null)} />
            </div>

            <div>
              <Label>本人確認書類画像:</Label>
              <Input type="file" accept="image/*" onChange={(e) => setDocImage(e.target.files?.[0] || null)} />
            </div>

            <div>
              <Label>指導教員氏名:</Label>
              <Input name="supervisor_name" value={form.supervisor_name} onChange={handleChange} />
            </div>

            <div>
              <Label>指導教員メールアドレス:</Label>
              <Input name="supervisor_email" value={form.supervisor_email} onChange={handleChange} />
            </div>

            <div>
              <Label>指導教員所属機関:</Label>
              <Input name="supervisor_affiliation" value={form.supervisor_affiliation} onChange={handleChange} />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox id="honor_statement" checked={form.honor_statement} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="honor_statement" className="text-sm leading-snug">
                上記の情報が真実であり、不正な資金利用や虚偽の申告を行わないことを誓います。
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "送信中..." : "提出する"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
