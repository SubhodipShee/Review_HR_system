import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'

dotenv.config()

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

const MODEL = process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307'

/**
 * Generate a structured performance summary from the last 3 months of reviews.
 * Returns: { trend, strengths, weaknesses, recommendation }
 */
export async function generatePerformanceSummary(reviews, employeeName) {
  if (!process.env.CLAUDE_API_KEY) {
    throw new Error('Claude API key not configured')
  }

  if (!reviews || reviews.length === 0) {
    throw new Error('No review data available to generate summary')
  }

  // Take last 3 months, most recent first
  const sorted = [...reviews].sort((a, b) => (b.month > a.month ? 1 : -1)).slice(0, 3)

  const reviewsText = sorted
    .map((r, i) => {
      return `Month ${i + 1}: ${r.month}
  - Output Quality: ${r.outputQuality}/5
  - Attendance: ${r.attendance}/5
  - Teamwork: ${r.teamwork}/5
  - Average Score: ${r.averageScore}/5
  - Manager Comment: "${r.comment || 'No comment'}"`
    })
    .join('\n\n')

  const prompt = `You are an experienced HR analytics assistant. Analyze the following performance review data for ${employeeName} and provide a concise, structured summary.

Review Data (last ${sorted.length} month(s)):
${reviewsText}

Respond with a JSON object containing exactly these four fields:
{
  "trend": "A 1-2 sentence description of the overall performance trend",
  "strengths": "1-2 sentences highlighting what this employee is doing well",
  "weaknesses": "1-2 sentences describing areas that need improvement",
  "recommendation": "1-2 actionable sentences recommending next steps for this employee"
}

Keep all responses concise, professional, and constructive. Focus on the data provided. Return only valid JSON.`

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0]?.text || ''

  // Parse JSON from Claude response
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response. Please try again.')
  }

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    throw new Error('Invalid AI response format. Please try again.')
  }
}

/**
 * Analyze manager feedback vs scores for consistency and suggest constructive improvements.
 * Returns: { isInconsistent, explanation, suggestion }
 */
export async function analyzeFeedbackConsistency(outputQuality, attendance, teamwork, comment, employeeName) {
  if (!process.env.CLAUDE_API_KEY) {
    throw new Error('Claude API key not configured')
  }

  const avg = ((Number(outputQuality) + Number(attendance) + Number(teamwork)) / 3).toFixed(2)

  const prompt = `You are an HR analytics assistant. Analyze this manager's performance review feedback and verify if it is consistent with the numerical scores.

Scores (Scale 1-5):
- Output Quality: ${outputQuality}/5
- Attendance: ${attendance}/5
- Teamwork: ${teamwork}/5
- Average Score: ${avg}/5

Manager's Written Feedback:
"${comment}"

Evaluate:
1. **Consistency**: Does the written comment match the scores? (e.g. 5/5 score but negative comment is highly inconsistent; 1/5 score but praise is inconsistent). Set "isInconsistent" to true if there is a mismatch.
2. **Improvement Suggestion**: Write an improved, more constructive, professional, and action-oriented version of the feedback. If the comment is very short (e.g. "Good", "Fine", "Nice work"), expand it into a detailed performance feedback paragraph that references the score context.
${
  employeeName
    ? `The employee being reviewed is named "${employeeName}". You MUST address them by their name in the suggested feedback (e.g., using their name like "Hi ${employeeName}, ..."). Do NOT use placeholder tags like "[Employee Name]" or "{Employee Name}".`
    : `No employee name is provided. Write the feedback suggestion directly without any name salutation, and do NOT use placeholders like "[Employee Name]" or "{Employee Name}".`
}

Respond with a JSON object containing exactly these fields:
{
  "isInconsistent": true/false (boolean),
  "explanation": "1-2 sentence description of the consistency and constructiveness rating",
  "suggestion": "The improved, constructive feedback comment that the manager can use directly."
}

Return ONLY valid JSON. No extra text or markdown formatting outside the JSON.`

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0]?.text || ''

  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response. Please try again.')
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    
    // Post-process suggestion to guarantee no placeholder tags leak through
    if (parsed && typeof parsed.suggestion === 'string') {
      let sug = parsed.suggestion
      if (employeeName) {
        sug = sug.replace(/\[Employee Name\]/gi, employeeName)
        sug = sug.replace(/\{Employee Name\}/gi, employeeName)
        sug = sug.replace(/\[Employee\]/gi, employeeName)
        sug = sug.replace(/\{Employee\}/gi, employeeName)
      } else {
        sug = sug.replace(/\[Employee Name\],?\s*/gi, '')
        sug = sug.replace(/\{Employee Name\},?\s*/gi, '')
        sug = sug.replace(/\[Employee\],?\s*/gi, '')
        sug = sug.replace(/\{Employee\},?\s*/gi, '')
      }
      parsed.suggestion = sug
    }
    
    return parsed
  } catch {
    throw new Error('Invalid AI response format. Please try again.')
  }
}

/**
 * Answer plain-English HR questions about the team and review metrics.
 */
export async function queryHRData(query, reviews, employees) {
  if (!process.env.CLAUDE_API_KEY) {
    throw new Error('Claude API key not configured')
  }

  const currentMonth = new Date().toISOString().substring(0, 7) // e.g. "2026-06"

  const employeesFormatted = employees
    .map((e) => `- ID: ${e.id}, Name: ${e.name}, Department: ${e.department}, Email: ${e.email}`)
    .join('\n')

  const reviewsFormatted = reviews
    .map(
      (r) =>
        `- Month: ${r.month}, Employee Name: ${r.employeeName} (${r.employeeId}), Scores: [Quality: ${r.outputQuality}, Attendance: ${r.attendance}, Teamwork: ${r.teamwork}, Avg: ${r.averageScore}], Comment: "${r.comment || 'No comment'}"`
    )
    .join('\n')

  const prompt = `You are a helpful HR Analytics Assistant for "Crystal People Lite".
You have access to the live performance review database.

Current Month Reference: ${currentMonth}

Active Employees (20 total):
${employeesFormatted}

Review History (from Google Sheets):
${reviews.length > 0 ? reviewsFormatted : '(No performance reviews have been submitted yet)'}

Answer the manager's query accurately based on the data above.
- If asked "Who hasn't been reviewed this month?", identify which of the 20 employees do NOT have a review record matching Month: "${currentMonth}". List them by name and department.
- For metric calculations (e.g. average, lowest score, top performer), perform the calculations accurately using the database rows.
- Keep the response concise, constructive, and direct.

Manager Query: "${query}"

Answer:`

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0]?.text || 'No response from AI.'
}
