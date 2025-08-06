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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckboxChange = (checked) => {
    setForm((prev) => ({ ...prev, honor_statement: checked }));
  };

  const validateForm = () => {
    const newErrors = {};

    // 両方必須に変更
    if (!faceImage) {
      newErrors.faceImage = "Face photo is required.";
    }
    if (!docImage) {
      newErrors.docImage = "Identification document photo is required.";
    }

    if (!form.supervisor_name.trim()) {
      newErrors.supervisor_name = "Supervisor's name is required.";
    }
    if (!form.supervisor_email.trim()) {
      newErrors.supervisor_email = "Supervisor's email is required.";
    }
    if (!form.supervisor_affiliation.trim()) {
      newErrors.supervisor_affiliation = "Supervisor's affiliation is required.";
    }
    if (!form.honor_statement) {
      newErrors.honor_statement = "You must agree to the honor statement.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 画像アップロード
      const imageForm = new FormData();
      imageForm.append("face_image", faceImage);
      imageForm.append("document_image", docImage);

      const uploadRes = await axiosInstance.post(
        "/api/identity-verification/upload-images",
        imageForm,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const { face_image_url, document_image_url } = uploadRes.data;

      // 本体データ送信
      await axiosInstance.post("/api/identity-verification", {
        face_image_path: face_image_url,
        document_image_path: document_image_url,
        honor_statement: form.honor_statement,
        supervisor_name: form.supervisor_name,
        supervisor_email: form.supervisor_email,
        supervisor_affiliation: form.supervisor_affiliation,
      });

      alert("Submission completed successfully!");
    } catch (err) {
      console.error("Submission failed", err.response?.data || err);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Card className="max-w-3xl w-full mx-auto mt-20 mb-10 shadow-md">
        <CardContent className="space-y-8 p-8">
          <h2 className="text-3xl font-bold text-center text-blue-900">
            Identity Verification Form
          </h2>

          <p className="text-sm text-gray-700 text-center">
            Acceptable identification documents:<br />
            <span className="font-medium">
              Passport, Driver's License, or National ID Card
            </span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 顔写真 */}
            <div>
              <Label htmlFor="faceImage">
                Face photo<span className="text-red-500">*</span>
              </Label>
              <Input
                id="faceImage"
                type="file"
                accept="image/*"
                onChange={(e) => setFaceImage(e.target.files?.[0] || null)}
                required
              />
              {errors.faceImage && (
                <p className="text-red-500 text-sm mt-1">{errors.faceImage}</p>
              )}
            </div>

            {/* 本人確認書類 */}
            <div>
              <Label htmlFor="docImage">
                Photo of your identification document <span className="text-red-500">*</span>
              </Label>
              <Input
                id="docImage"
                type="file"
                accept="image/*"
                onChange={(e) => setDocImage(e.target.files?.[0] || null)}
                required
              />
              {errors.docImage && (
                <p className="text-red-500 text-sm mt-1">{errors.docImage}</p>
              )}
            </div>

            {/* Supervisor Name */}
            <div>
              <Label htmlFor="supervisor_name">
                Supervisor's Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supervisor_name"
                name="supervisor_name"
                value={form.supervisor_name}
                onChange={handleChange}
                required
              />
              {errors.supervisor_name && (
                <p className="text-red-500 text-sm mt-1">{errors.supervisor_name}</p>
              )}
            </div>

            {/* Supervisor Email */}
            <div>
              <Label htmlFor="supervisor_email">
                Supervisor's Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supervisor_email"
                name="supervisor_email"
                type="email"
                value={form.supervisor_email}
                onChange={handleChange}
                required
              />
              {errors.supervisor_email && (
                <p className="text-red-500 text-sm mt-1">{errors.supervisor_email}</p>
              )}
            </div>

            {/* Supervisor Affiliation */}
            <div>
              <Label htmlFor="supervisor_affiliation">
                Supervisor's Affiliation <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supervisor_affiliation"
                name="supervisor_affiliation"
                value={form.supervisor_affiliation}
                onChange={handleChange}
                required
              />
              {errors.supervisor_affiliation && (
                <p className="text-red-500 text-sm mt-1">{errors.supervisor_affiliation}</p>
              )}
            </div>

            {/* Honor Statement */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="honor_statement"
                checked={form.honor_statement}
                onCheckedChange={handleCheckboxChange}
                required
              />
              <Label htmlFor="honor_statement" className="text-sm leading-snug">
                I certify that all the information provided above is true and I pledge not to misuse research funding.
              </Label>
            </div>
            {errors.honor_statement && (
              <p className="text-red-500 text-sm mt-1">{errors.honor_statement}</p>
            )}

            {/* 送信ボタン */}
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Verification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

