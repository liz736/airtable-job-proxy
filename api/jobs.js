export default async function handler(req, res) {
  try {
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Job Openings";

    const formula = encodeURIComponent("{Search Lifecycle Status}='Active'");
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?filterByFormula=${formula}&sort[0][field]=Posted%20Date&sort[0][direction]=desc`;

    const airtableRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    if (!airtableRes.ok) {
      const text = await airtableRes.text();
      return res.status(airtableRes.status).json({ error: text });
    }

    const data = await airtableRes.json();

    const jobs = (data.records || []).map((record) => ({
      title: record.fields["Job Title"] || "",
      client: record.fields["Client"] || "",
      location: record.fields["Location"] || "",
      employmentType: record.fields["Employment Type"] || "",
      payRange: record.fields["Pay Range"] || "",
      description: record.fields["Short Description"] || record.fields["Description"] || "",
      fullDescription: record.fields["Description"] || "",
      applyUrl: record.fields["Apply URL"] || "",
      postedDate: record.fields["Posted Date"] || ""
    }));

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ jobs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
