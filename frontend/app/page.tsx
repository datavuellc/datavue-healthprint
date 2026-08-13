"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    member_name: "",
    plan_name: "",
    member_id: "",
    start_date: "2026-01-01",
    template_name: "sample_anoc.html",
    year: "2026",
    contact_number: "1-800-555-0000",
    website: "www.datavuehealth.com",
    changes_json: `[
  {
    "page": "Page 5, Section 3",
    "incorrect": "Specialist copay is $20",
    "correct": "Specialist copay is $40",
    "impact": "You will pay $40 when visiting an in-network specialist."
  }
]`,
  });

  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      JSON.parse(form.changes_json);

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(
        "http://localhost:8000/generate_pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "PDF generation failed"
        );
      }

      const data = await response.json();

      setPdfUrl(
        `http://localhost:8000${data.pdf_url}?t=${Date.now()}`
      );
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Changes JSON is not valid JSON.");
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Datavue HealthPrint
            </h1>
            <p className="text-sm text-slate-500">
              Healthcare document composition and delivery
            </p>
          </div>

          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Development
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-8 py-8 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-7 shadow-sm">
          <div className="mb-7">
            <h2 className="text-xl font-semibold text-slate-900">
              Generate Document
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter member and plan information to compose an ANOC.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Member Name"
              name="member_name"
              value={form.member_name}
              onChange={handleChange}
            />

            <Field
              label="Member ID"
              name="member_id"
              value={form.member_id}
              onChange={handleChange}
            />

            <Field
              label="Plan Name"
              name="plan_name"
              value={form.plan_name}
              onChange={handleChange}
            />

            <Field
              label="Coverage Year"
              name="year"
              value={form.year}
              onChange={handleChange}
            />

            <Field
              label="Effective Date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
            />

            <Field
              label="Contact Number"
              name="contact_number"
              value={form.contact_number}
              onChange={handleChange}
            />

            <Field
              label="Website"
              name="website"
              value={form.website}
              onChange={handleChange}
            />

            <Field
              label="Template"
              name="template_name"
              value={form.template_name}
              onChange={handleChange}
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Changes JSON
            </label>

            <textarea
              name="changes_json"
              value={form.changes_json}
              onChange={handleChange}
              rows={13}
              className="w-full rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-blue-700 px-5 py-3 font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate PDF"}
          </button>
        </section>

        <section className="rounded-2xl border bg-white p-7 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Document Preview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Generated documents appear here.
            </p>
          </div>

          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="h-[850px] w-full rounded-xl border border-slate-200"
            />
          ) : (
            <div className="flex h-[600px] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
              <div className="text-center">
                <div className="text-4xl">📄</div>
                <p className="mt-3 font-medium text-slate-700">
                  No document generated
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Complete the form and generate a PDF.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
