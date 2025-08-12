import { useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import AppLayout from "../components/AppLayout";
import { useNavigate } from "react-router-dom";

export function IdentityVerificationForm() {
  const navigate = useNavigate();

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
    setForm((prev) => ({ ...prev, honor_statement: !!checked }));
  };

  // ★ 画像バリデーション（タイプ & 5MB）
  const validateImage = (file) => {
    if (!file) return "File is required.";
    if (!file.type?.startsWith("image/")) return "Please select an image file.";
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) return "Image is too large. Max size is 5MB.";
    return "";
  };

  const onFaceChange = (e) => {
    const f = e.target.files?.[0] || null;
    const msg = f ? validateImage(f) : "Face photo is required.";
    setFaceImage(f);
    setErrors((prev) => ({ ...prev, faceImage: msg || undefined }));
  };

  const onDocChange = (e) => {
    const f = e.target.files?.[0] || null;
    const msg = f ? validateImage(f) : "Identification document photo is required.";
    setDocImage(f);
    setErrors((prev) => ({ ...prev, docImage: msg || undefined }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!faceImage) newErrors.faceImage = "Face photo is required.";
    if (!docImage) newErrors.docImage = "Identification document photo is required.";
    if (!form.supervisor_name.trim()) newErrors.supervisor_name = "Supervisor's name is required.";
    if (!form.supervisor_email.trim()) newErrors.supervisor_email = "Supervisor's email is required.";
    if (!form.supervisor_affiliation.trim()) newErrors.supervisor_affiliation = "Supervisor's affiliation is required.";
    if (!form.honor_statement) newErrors.honor_statement = "You must agree to the honor statement.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    try {
      const imageForm = new FormData();
      imageForm.append("face_image", faceImage);
      imageForm.append("document_image", docImage);

      const uploadRes = await axiosInstance.post(
        "/api/identity-verification/upload-images",
        imageForm,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { face_image_url, document_image_url } = uploadRes.data;

      await axiosInstance.post("/api/identity-verification", {
        face_image_path: face_image_url,
        document_image_path: document_image_url,
        honor_statement: form.honor_statement,
        supervisor_name: form.supervisor_name,
        supervisor_email: form.supervisor_email,
        supervisor_affiliation: form.supervisor_affiliation,
      });

      alert(
        "Submission completed successfully!\n\nYour request has been received. Please wait while we review and approve your verification."
      );
      navigate("/");
    } catch (err) {
      console.error("Submission failed", err?.response?.data || err);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Card className="max-w-3xl w/full mx-auto mt-20 mb-10 shadow-md">
        <CardContent className="space-y-8 p-8 min-w-0">
          <h2 className="text-3xl font-bold text-center text-blue-900">Identity Verification Form</h2>

          <p className="text-sm text-gray-700 text-center break-words">
            Acceptable identification documents:
            <br />
            <span className="font-medium">Passport, Driver's License, or National ID Card</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Identity verification form">
            <div>
              <Label htmlFor="faceImage">
                Face photo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="faceImage"
                type="file"
                accept="image/*"
                onChange={onFaceChange}
                required
              />
              {errors.faceImage && <p className="text-red-500 text-sm mt-1 break-words">{errors.faceImage}</p>}
            </div>

            <div>
              <Label htmlFor="docImage">
                Photo of your identification document <span className="text-red-500">*</span>
              </Label>
              <Input
                id="docImage"
                type="file"
                accept="image/*"
                onChange={onDocChange}
                required
              />
              {errors.docImage && <p className="text-red-500 text-sm mt-1 break-words">{errors.docImage}</p>}
            </div>

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
              {errors.supervisor_name && <p className="text-red-500 text-sm mt-1">{errors.supervisor_name}</p>}
            </div>

            <div>
              <Label htmlFor="supervisor_email">
                Supervisor's Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supervisor_email"
                name="supervisor_email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                value={form.supervisor_email}
                onChange={handleChange}
                required
              />
              {errors.supervisor_email && <p className="text-red-500 text-sm mt-1">{errors.supervisor_email}</p>}
            </div>

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
              {errors.supervisor_affiliation && <p className="text-red-500 text-sm mt-1">{errors.supervisor_affiliation}</p>}
            </div>

            {/* gapではなくspace-xで安定、長文でも折り返し */}
            <div className="flex items-start space-x-2 min-w-0">
              <Checkbox
                id="honor_statement"
                checked={form.honor_statement}
                onCheckedChange={handleCheckboxChange}
                required
              />
              <Label htmlFor="honor_statement" className="text-sm leading-snug break-words">
                I certify that all the information provided above is true and I pledge not to misuse research funding.
              </Label>
            </div>
            {errors.honor_statement && <p className="text-red-500 text-sm mt-1">{errors.honor_statement}</p>}

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold hover:bg-blue-700"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Submitting..." : "Submit Verification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}



