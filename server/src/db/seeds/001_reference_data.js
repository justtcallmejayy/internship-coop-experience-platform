// This seed file populates the industries and technologies tables with reference data.

exports.seed = async function (knex) {
  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Retail",
    "Government",
    "Education",
    "Non-Profit",
    "Other",
  ];

  const technologies = [
    "React",
    "Java",
    "SQL",
    "PowerShell",
    "SCCM",
    "Intune",
    "ServiceNow",
    "Jira",
    "Git",
    "Azure",
    "Other",
  ];

  for (const industry_name of industries) {
    await knex("industries")
      .insert({ industry_name })
      .onConflict("industry_name")
      .ignore();
  }

  for (const tech_name of technologies) {
    await knex("technologies")
      .insert({ tech_name })
      .onConflict("tech_name")
      .ignore();
  }
};
