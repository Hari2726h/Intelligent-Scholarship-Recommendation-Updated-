/**
 * Gemini AI Service
 * Provides AI-powered features for the Scholarship Management Portal
 * Uses Google Gemini API with model/version fallback
 */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_HOST = 'https://generativelanguage.googleapis.com';
const GEMINI_VERSIONS = ['v1beta', 'v1'];
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
];

const getGeminiUrls = () => {
  const envModels = process.env.REACT_APP_GEMINI_MODELS
    ? process.env.REACT_APP_GEMINI_MODELS.split(',').map((m) => m.trim()).filter(Boolean)
    : [];
  const models = envModels.length > 0 ? envModels : GEMINI_MODELS;

  const urls = [];
  for (const version of GEMINI_VERSIONS) {
    for (const model of models) {
      urls.push(`${GEMINI_API_HOST}/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`);
    }
  }
  return urls;
};

/**
 * Core Gemini API caller
 */
const callGemini = async (prompt, maxTokens = 1024) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file.');
  }

  const urls = getGeminiUrls();
  let lastErrorMessage = '';
  let notFoundCount = 0;

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: maxTokens,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `Gemini API error: ${response.status}`;

        if (response.status === 404) {
          notFoundCount += 1;
          lastErrorMessage = message;
          continue;
        }

        throw new Error(message);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    } catch (error) {
      lastErrorMessage = error?.message || 'Unknown Gemini API error';
    }
  }

  if (notFoundCount === urls.length) {
    throw new Error(
      'Gemini model endpoint not found (404). Your API key may not have Gemini access, or configured model IDs are unavailable. Try setting REACT_APP_GEMINI_MODELS in .env and ensure Generative Language API is enabled in Google Cloud.'
    );
  }

  throw new Error(lastErrorMessage || 'Failed to get response from Gemini API.');
};

// ─────────────────────────────────────────────────────────────────
// 1. AI CHATBOT
// ─────────────────────────────────────────────────────────────────
export const askScholarshipChatbot = async (
  userMessage,
  conversationHistory = []
) => {
  const systemContext = `You are ScholarBot, a friendly AI assistant for an Indian Scholarship Management Portal.
You help students with:
- Finding and applying for scholarships
- Understanding eligibility criteria (SC/ST/OBC/General/Minority/Merit/Sports/Disability)
- Completing their profile for better scholarship matches
- Document requirements (income certificate, caste certificate, marksheet, etc.)
- Application processes and deadlines
- Government scholarship schemes in India (NSP, AICTE, State schemes, etc.)

Rules:
- Keep answers concise and helpful (2-4 sentences max unless asked for details)
- Use simple English
- Be encouraging and supportive
- When in doubt about specific scholarship details, suggest the student check the official portal
- Never make up specific scholarship amounts or deadlines`;

  const historyText =
    conversationHistory.length > 0
      ? conversationHistory
          .slice(-6)
          .map(
            (m) => `${m.role === 'user' ? 'Student' : 'ScholarBot'}: ${m.content}`
          )
          .join('\n') + '\n'
      : '';

  const prompt = `${systemContext}

${historyText ? `Recent conversation:\n${historyText}` : ''}Student: ${userMessage}
ScholarBot:`;

  return await callGemini(prompt, 512);
};

// ─────────────────────────────────────────────────────────────────
// 2. ESSAY / PERSONAL STATEMENT ASSISTANT
// ─────────────────────────────────────────────────────────────────
export const generateEssayDraft = async (topic, keyPoints, scholarshipName) => {
  const prompt = `Write a compelling personal statement for an Indian student applying for "${scholarshipName}".

Topic/Theme: ${topic}
Key points to include: ${keyPoints}

Requirements:
- 300-400 words
- Professional yet personal tone
- Strong opening hook
- Clear narrative about goals and financial need
- Specific and authentic — avoid generic clichés
- End with a confident conclusion
- Suitable for Indian scholarship applications

Write the personal statement now:`;

  return await callGemini(prompt, 1024);
};

export const improveEssay = async (existingEssay, improvements) => {
  const improvements_text = improvements || 'clarity, impact, emotional connection, and grammar';
  const prompt = `Improve this scholarship personal statement for an Indian student.

Original Essay:
${existingEssay}

Focus on improving: ${improvements_text}

Respond in exactly this format:

IMPROVED ESSAY:
[Write the full improved essay here]

KEY CHANGES:
[List 4-5 bullet points explaining specific improvements made]`;

  return await callGemini(prompt, 1200);
};

// ─────────────────────────────────────────────────────────────────
// 3. ELIGIBILITY EXPLAINER
// ─────────────────────────────────────────────────────────────────
export const explainEligibility = async (scholarship, studentProfile) => {
  const profileSection = studentProfile
    ? `STUDENT PROFILE:
- CGPA: ${studentProfile.cgpa || 'Not provided'}
- Annual Family Income: ${
        studentProfile.annualIncome
          ? '₹' + parseInt(studentProfile.annualIncome).toLocaleString('en-IN')
          : 'Not provided'
      }
- Category: ${studentProfile.category || 'Not provided'}
- Course: ${studentProfile.course || 'Not provided'}
- State: ${studentProfile.state || 'Not provided'}`
    : 'STUDENT PROFILE: Not available (student should check their profile)';

  const prompt = `Analyze if a student meets the eligibility for this scholarship.

SCHOLARSHIP:
- Name: ${scholarship.title}
- Category: ${scholarship.category || 'General'}
- Min CGPA Required: ${scholarship.minCgpa || 'No minimum'}
- Max Family Income: ${
    scholarship.maxIncome
      ? '₹' + parseInt(scholarship.maxIncome).toLocaleString('en-IN')
      : 'No limit'
  }
- Amount: ₹${parseInt(scholarship.amount || 0).toLocaleString('en-IN')}
- Provider: ${scholarship.provider || 'Not specified'}
- Description: ${scholarship.description || 'N/A'}

${profileSection}

Respond in this format:

VERDICT: [Likely Eligible ✅ / Likely Not Eligible ❌ / Needs More Info ⚠️]

ANALYSIS:
[2-3 sentences analyzing criteria match]

NEXT STEPS:
[2-3 bullet points on what student should do]

DOCUMENTS NEEDED:
[2-3 key documents likely required]`;

  return await callGemini(prompt, 600);
};

// ─────────────────────────────────────────────────────────────────
// 4. SCHOLARSHIP COMPARISON SUMMARY
// ─────────────────────────────────────────────────────────────────
export const compareScholarshipsAI = async (scholarships) => {
  const scholarshipData = scholarships
    .map(
      (s, i) =>
        `Scholarship ${i + 1}: ${s.title}
  - Amount: ₹${parseInt(s.amount || 0).toLocaleString('en-IN')}
  - Deadline: ${s.deadline ? new Date(s.deadline).toLocaleDateString('en-IN') : 'N/A'}
  - Category: ${s.category || 'General'}
  - Provider: ${s.provider || 'N/A'}
  - Min CGPA: ${s.minCgpa || 'None required'}
  - Max Family Income: ${s.maxIncome ? '₹' + parseInt(s.maxIncome).toLocaleString('en-IN') : 'No limit'}
  - Awards Available: ${s.awardCount || 'Not specified'}`
    )
    .join('\n\n');

  const prompt = `Compare these ${scholarships.length} scholarships for an Indian student and provide a clear recommendation.

${scholarshipData}

Provide a structured comparison:

SUMMARY:
[2-3 sentence overview of the scholarships being compared]

BEST FOR FINANCIAL NEED:
[Scholarship name and why — 1-2 sentences]

BEST FOR HIGH ACHIEVERS:
[Scholarship name and why — 1-2 sentences]

EASIEST TO QUALIFY:
[Scholarship name and why — 1-2 sentences]

OVERALL RECOMMENDATION:
[Clear recommendation with reasoning — 2-3 sentences]

APPLY IN THIS ORDER:
1. [Scholarship name] - [brief reason]
2. [Scholarship name] - [brief reason]
...`;

  return await callGemini(prompt, 800);
};

// ─────────────────────────────────────────────────────────────────
// 5. AI PROFILE IMPROVEMENT TIPS
// ─────────────────────────────────────────────────────────────────
export const getAIProfileTips = async (profileStrength) => {
  const prompt = `Give 5 specific, actionable tips to improve this student's scholarship profile score.

CURRENT PROFILE STATUS:
- Overall Score: ${profileStrength.overallScore}/100
- Strength Level: ${profileStrength.strengthLevel}
- Basic Info: ${profileStrength.hasBasicInfo ? '✅ Complete' : '❌ Missing'}
- Contact Info: ${profileStrength.hasContactInfo ? '✅ Complete' : '❌ Missing'}
- Academic Info: ${profileStrength.hasAcademicInfo ? '✅ Complete' : '❌ Missing'}
- Financial Info: ${profileStrength.hasFinancialInfo ? '✅ Complete' : '❌ Missing'}
- Documents Uploaded: ${profileStrength.hasDocuments ? '✅ Yes' : '❌ None uploaded'}
- System Suggestions: ${profileStrength.suggestions?.join('; ') || 'None'}

Give exactly 5 tips for improving scholarship chances in India. Use this format exactly:

🎯 TIP 1: [Short action title]
[1-2 sentence explanation of what to do and the direct scholarship benefit]

🎯 TIP 2: [Short action title]
[explanation]

🎯 TIP 3: [Short action title]
[explanation]

🎯 TIP 4: [Short action title]
[explanation]

🎯 TIP 5: [Short action title]
[explanation]`;

  return await callGemini(prompt, 700);
};

// ─────────────────────────────────────────────────────────────────
// 6. FINANCIAL AID PLANNING ADVICE
// ─────────────────────────────────────────────────────────────────
export const getFinancialAidAdvice = async (formData, eligibleScholarships, totalAid) => {
  const scholarshipList = eligibleScholarships
    .slice(0, 6)
    .map(
      (s) =>
        `  • ${s.title}: ₹${parseInt(s.amount || 0).toLocaleString('en-IN')} (Deadline: ${
          s.deadline ? new Date(s.deadline).toLocaleDateString('en-IN') : 'N/A'
        })`
    )
    .join('\n');

  const prompt = `Provide financial aid planning advice for this Indian student.

STUDENT PROFILE:
- CGPA: ${formData.cgpa}
- Annual Family Income: ₹${parseInt(formData.annualIncome || 0).toLocaleString('en-IN')}
- Category: ${formData.category || 'General/Not specified'}
- Has Disability Benefit: ${formData.disability ? 'Yes' : 'No'}
- Has Sports Quota: ${formData.sports ? 'Yes' : 'No'}
- Ex-Serviceman Family: ${formData.exService ? 'Yes' : 'No'}

ELIGIBLE SCHOLARSHIPS (${eligibleScholarships.length} total, showing top 6):
${scholarshipList || '  None found'}
${eligibleScholarships.length > 6 ? `  ...and ${eligibleScholarships.length - 6} more` : ''}

Potential Total Aid: ₹${parseInt(totalAid || 0).toLocaleString('en-IN')}

Provide actionable financial planning advice:

📌 TOP 3 SCHOLARSHIPS TO APPLY FIRST:
1. [Name] — [Why this should be the priority]
2. [Name] — [Reason]
3. [Name] — [Reason]

⚡ URGENT DEADLINES:
[Any scholarships with close deadlines; say "None immediately urgent" if not applicable]

💡 STRATEGY TIPS:
[3 bullet points on how to maximize financial aid]

🏛️ OTHER SCHEMES TO EXPLORE:
[1-2 government scholarship schemes this student may qualify for based on their profile]`;

  return await callGemini(prompt, 800);
};

// ─────────────────────────────────────────────────────────────────
// 7. SMART NOTIFICATION DIGEST
// ─────────────────────────────────────────────────────────────────
export const getNotificationDigest = async (notifications) => {
  if (!notifications || notifications.length === 0) {
    return 'You have no notifications to summarize at this time.';
  }

  const recentNotifs = notifications
    .slice(0, 15)
    .map(
      (n) =>
        `[${n.notificationType || n.type || 'INFO'}] ${n.title || 'Notification'}: ${n.message || ''}`
    )
    .join('\n');

  const prompt = `Summarize these scholarship portal notifications as a smart daily digest for a student.

NOTIFICATIONS:
${recentNotifs}

Create a brief, friendly digest:

🔴 URGENT (action needed):
[List any deadline reminders or time-sensitive items, or say "Nothing urgent"]

🟡 NEW OPPORTUNITIES:
[List new scholarship or eligibility alerts, or say "No new opportunities"]

🟢 STATUS UPDATES:
[List application status changes, or say "No status changes"]

📋 QUICK SUMMARY:
[1-2 sentence overall summary of what's happening]

Keep total response under 200 words.`;

  return await callGemini(prompt, 512);
};

// ─────────────────────────────────────────────────────────────────
// 8. ADMIN ANALYTICS INSIGHTS
// ─────────────────────────────────────────────────────────────────
export const getAnalyticsInsights = async (analytics) => {
  const approvalRate =
    analytics.totalApplications > 0
      ? ((analytics.approvedApplications / analytics.totalApplications) * 100).toFixed(1)
      : 0;

  const prompt = `Analyze this scholarship portal data and provide executive insights for the admin.

PORTAL ANALYTICS:
- Total Users: ${analytics.totalUsers}
- Students: ${analytics.totalStudents}, Admins: ${analytics.totalAdmins}
- Active Scholarships: ${analytics.totalScholarships}
- Total Applications: ${analytics.totalApplications}
- Pending: ${analytics.pendingApplications}
- Approved: ${analytics.approvedApplications}
- Rejected: ${analytics.rejectedApplications}
- Approval Rate: ${approvalRate}%

Generate an admin insights report:

📊 EXECUTIVE SUMMARY:
[1-2 sentence overview of portal health]

✅ KEY HIGHLIGHTS:
[2-3 positive metrics or achievements]

⚠️ AREAS OF CONCERN:
[2-3 issues or trends that need attention]

🎯 RECOMMENDED ACTIONS:
1. [Action item]
2. [Action item]  
3. [Action item]

💡 ENGAGEMENT TIP:
[One specific suggestion to increase student engagement or application rates]`;

  return await callGemini(prompt, 700);
};

// ─────────────────────────────────────────────────────────────────
// 9. NATURAL LANGUAGE SEARCH PARSER
// ─────────────────────────────────────────────────────────────────
export const parseNaturalLanguageSearch = async (searchQuery) => {
  const prompt = `Parse this Indian student's scholarship search query and extract filter parameters.

Search Query: "${searchQuery}"

Return ONLY a valid JSON object with these fields (use null for fields not mentioned):
{
  "category": null or one of ["SC", "ST", "OBC", "GENERAL", "MINORITY", "SPORTS", "DISABILITY", "MERIT"],
  "minAmount": null or number (minimum amount in rupees),
  "maxIncome": null or number (maximum family income in rupees),
  "minCgpa": null or number (0-10 scale),
  "keyword": null or string
}

Return ONLY the JSON object, absolutely no other text or explanation.`;

  const result = await callGemini(prompt, 200);
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────
// 10. APPLICATION PRE-SUBMISSION REVIEW
// ─────────────────────────────────────────────────────────────────
export const reviewApplicationBeforeSubmit = async (scholarship, studentProfile) => {
  const prompt = `Give a quick pre-submission review for this scholarship application.

SCHOLARSHIP: ${scholarship.title}
- Amount: ₹${parseInt(scholarship.amount || 0).toLocaleString('en-IN')}
- Min CGPA Required: ${scholarship.minCgpa || 'None'}
- Max Family Income: ${scholarship.maxIncome ? '₹' + parseInt(scholarship.maxIncome).toLocaleString('en-IN') : 'None'}
- Category: ${scholarship.category || 'General'}
- Deadline: ${scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-IN') : 'N/A'}

${studentProfile ? `STUDENT PROFILE:
- CGPA: ${studentProfile.cgpa || 'Not provided'}
- Annual Income: ${studentProfile.annualIncome ? '₹' + parseInt(studentProfile.annualIncome).toLocaleString('en-IN') : 'Not provided'}
- Category: ${studentProfile.category || 'Not provided'}` : 'PROFILE: Not available'}

Provide a quick checklist (max 150 words):

READINESS: [Ready to Submit ✅ / Review Needed ⚠️ / Not Recommended ❌]

CHECKLIST BEFORE SUBMITTING:
□ [Check item 1]
□ [Check item 2]
□ [Check item 3]

KEY DOCUMENTS NEEDED:
• [Document 1]
• [Document 2]

PRO TIP: [One specific tip for this scholarship]`;

  return await callGemini(prompt, 400);
};
