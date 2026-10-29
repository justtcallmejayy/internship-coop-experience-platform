import { useEffect, useState } from "react";
import { referenceApi } from "../api/apiClient";

const initialForm = {
  company_name: "",
  role_title: "",
  industry_id: "",
  work_term_type: "Internship",
  work_mode: "In-person",
  location_city: "",
  location_province: "",
  start_month: "",
  start_year: "",
  end_month: "",
  end_year: "",
  interview_format: "Online",
  learning_outcomes: "",
  technology_ids: [],
  custom_tech_name: "",
};

function formFromEntry(entry) {
  return {
    ...initialForm,
    ...entry,
    industry_id: String(entry.industry_id || ""),
    start_month: String(entry.start_month || ""),
    start_year: String(entry.start_year || ""),
    end_month: String(entry.end_month || ""),
    end_year: String(entry.end_year || ""),
    technology_ids: entry.technologies?.map((technology) => technology.tech_id) || [],
    custom_tech_name: entry.technologies?.[0]?.custom_tech_name || "",
  };
}

export default function ExperienceForm({ entry, onSubmit, submitting, error }) {
  const [form, setForm] = useState(entry ? formFromEntry(entry) : initialForm);
  const [industries, setIndustries] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [referenceError, setReferenceError] = useState("");

  useEffect(() => {
    if (entry) setForm(formFromEntry(entry));
  }, [entry]);

  useEffect(() => {
    async function loadReferences() {
      try {
        const [industryData, technologyData] = await Promise.all([
          referenceApi.getIndustries(),
          referenceApi.getTechnologies(),
        ]);
        setIndustries(industryData.industries || []);
        setTechnologies(technologyData.technologies || []);
      } catch (loadError) {
        setReferenceError(loadError.message || "Unable to load form options.");
      }
    }
    loadReferences();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleTechnology(technologyId) {
    setForm((current) => ({
      ...current,
      technology_ids: current.technology_ids.includes(technologyId)
        ? current.technology_ids.filter((id) => id !== technologyId)
        : [...current.technology_ids, technologyId],
    }));
  }

  function validateForm() {
    const errors = [];

    if (!form.company_name.trim()) errors.push("Company name is required.");
    if (!form.role_title.trim()) errors.push("Role title is required.");
    if (!form.industry_id) errors.push("Industry is required.");
    if (!form.location_city.trim()) errors.push("City is required.");
    if (!form.location_province.trim()) errors.push("Province is required.");
    if (!form.start_month) errors.push("Start month is required.");
    if (!form.start_year) errors.push("Start year is required.");
    if (!form.end_month) errors.push("End month is required.");
    if (!form.end_year) errors.push("End year is required.");
    if (!form.learning_outcomes.trim()) {
      errors.push("Learning outcomes are required.");
    }

    const startMonth = Number(form.start_month);
    const endMonth = Number(form.end_month);
    const startYear = Number(form.start_year);
    const endYear = Number(form.end_year);

    if (form.start_month && (startMonth < 1 || startMonth > 12)) {
      errors.push("Start month must be between 1 and 12.");
    }
    if (form.end_month && (endMonth < 1 || endMonth > 12)) {
      errors.push("End month must be between 1 and 12.");
    }
    if (form.start_year && (startYear < 2000 || startYear > 2100)) {
      errors.push("Start year must be between 2000 and 2100.");
    }
    if (form.end_year && (endYear < 2000 || endYear > 2100)) {
      errors.push("End year must be between 2000 and 2100.");
    }
    if (
      startYear >= 2000 &&
      startYear <= 2100 &&
      endYear >= 2000 &&
      endYear <= 2100 &&
      startMonth >= 1 &&
      startMonth <= 12 &&
      endMonth >= 1 &&
      endMonth <= 12 &&
      endYear * 100 + endMonth < startYear * 100 + startMonth
    ) {
      errors.push("End date cannot be before start date.");
    }
    if (form.technology_ids.length === 0) {
      errors.push("At least one technology must be selected.");
    }

    return errors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      onSubmit(null, validationErrors.join(" "));
      return;
    }

    onSubmit({
      ...form,
      industry_id: Number(form.industry_id),
      start_month: Number(form.start_month),
      start_year: Number(form.start_year),
      end_month: Number(form.end_month),
      end_year: Number(form.end_year),
      technology_ids: form.technology_ids.map(Number),
      custom_tech_name: form.custom_tech_name || null,
    });
  }

  return (
    <form className="form experience-form" onSubmit={handleSubmit} noValidate>
      {referenceError && <p className="error-message" role="alert">{referenceError}</p>}
      {error && <p className="error-message" role="alert">{error}</p>}

      <div className="form-grid">
        <label>Company name<input name="company_name" value={form.company_name} onChange={updateField} required /></label>
        <label>Role title<input name="role_title" value={form.role_title} onChange={updateField} required /></label>
        <label>Industry<select name="industry_id" value={form.industry_id} onChange={updateField} required><option value="">Select an industry</option>{industries.map((industry) => <option key={industry.industry_id} value={industry.industry_id}>{industry.industry_name}</option>)}</select></label>
        <label>Work term type<select name="work_term_type" value={form.work_term_type} onChange={updateField}><option>Internship</option><option>Co-op</option></select></label>
        <label>Work mode<select name="work_mode" value={form.work_mode} onChange={updateField}><option>In-person</option><option>Hybrid</option><option>Remote</option></select></label>
        <label>Interview format<select name="interview_format" value={form.interview_format} onChange={updateField}><option>Online</option><option>In-person</option></select></label>
        <label>City<input name="location_city" value={form.location_city} onChange={updateField} required /></label>
        <label>Province<input name="location_province" value={form.location_province} onChange={updateField} required /></label>
        <label>Start month<input name="start_month" type="number" min="1" max="12" value={form.start_month} onChange={updateField} required /></label>
        <label>Start year<input name="start_year" type="number" min="2000" max="2100" value={form.start_year} onChange={updateField} required /></label>
        <label>End month<input name="end_month" type="number" min="1" max="12" value={form.end_month} onChange={updateField} required /></label>
        <label>End year<input name="end_year" type="number" min="2000" max="2100" value={form.end_year} onChange={updateField} required /></label>
      </div>

      <fieldset>
        <legend>Technologies used</legend>
        <div className="checkbox-grid">
          {technologies.map((technology) => (
            <label className="checkbox-label" key={technology.tech_id}>
              <input type="checkbox" checked={form.technology_ids.includes(technology.tech_id)} onChange={() => toggleTechnology(technology.tech_id)} />
              {technology.tech_name}
            </label>
          ))}
        </div>
        <label>Custom technology name (optional)<input name="custom_tech_name" value={form.custom_tech_name} onChange={updateField} /></label>
      </fieldset>

      <label>Learning outcomes<textarea name="learning_outcomes" rows="5" value={form.learning_outcomes} onChange={updateField} required /></label>
      <button type="submit" disabled={submitting}>{submitting ? "Saving..." : entry ? "Save Changes" : "Save Draft"}</button>
    </form>
  );
}
