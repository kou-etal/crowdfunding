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

    setLoading(true);
    try {
      const imageForm = new FormData();
      if (faceImage) imageForm.append("face_image", faceImage);
      if (docImage) imageForm.append("document_image", docImage);

      const uploadRes = await axiosInstance.post(
        "/api/identity-verification/upload-images",
        imageForm,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
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
          <h2 className="text-3xl font-bold text-center text-blue-900">Identity Verification Form</h2>

          <p className="text-sm text-gray-700 text-center">
            Acceptable identification documents (only one required):<br />
            <span className="font-medium">Passport, Driver's License, or National ID Card</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="faceImage">Face photo (holding your ID)</Label>
              <Input
                id="faceImage"
                type="file"
                accept="image/*"
                onChange={(e) => setFaceImage(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="docImage">Photo of your identification document</Label>
              <Input
                id="docImage"
                type="file"
                accept="image/*"
                onChange={(e) => setDocImage(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="supervisor_name">Supervisor's Full Name</Label>
              <Input
                id="supervisor_name"
                name="supervisor_name"
                value={form.supervisor_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="supervisor_email">Supervisor's Email Address</Label>
              <Input
                id="supervisor_email"
                name="supervisor_email"
                type="email"
                value={form.supervisor_email}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="supervisor_affiliation">Supervisor's Affiliation</Label>
              <Input
                id="supervisor_affiliation"
                name="supervisor_affiliation"
                value={form.supervisor_affiliation}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="honor_statement"
                checked={form.honor_statement}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="honor_statement" className="text-sm leading-snug">
                I certify that all the information provided above is true and I pledge not to misuse research funding.
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Verification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

