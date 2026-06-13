import { google } from 'googleapis'
import dotenv from 'dotenv'

dotenv.config()

const SHEET_ID = process.env.GOOGLE_SHEET_ID
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Reviews'
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

// Column headers (must match the sheet)
const HEADERS = [
  'employeeId',
  'employeeName',
  'employeeEmail',
  'month',
  'outputQuality',
  'attendance',
  'teamwork',
  'averageScore',
  'comment',
  'managerName',
  'timestamp',
]

function getAuth() {
  return new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

async function getSheetsClient() {
  const auth = getAuth()
  return google.sheets({ version: 'v4', auth })
}

/**
 * Deletes the default blank 'Sheet1' if it exists and we have our custom sheet.
 */
async function deleteDefaultSheet(sheets) {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    })
    const sheetsList = spreadsheet.data.sheets || []
    
    // Google Sheets requires at least one sheet to remain. Only delete Sheet1 if we have other sheets.
    if (sheetsList.length > 1) {
      const defaultSheet = sheetsList.find(s => s.properties.title === 'Sheet1')
      if (defaultSheet) {
        console.log("Removing default empty 'Sheet1' tab to keep the spreadsheet clean...")
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            requests: [
              {
                deleteSheet: {
                  sheetId: defaultSheet.properties.sheetId,
                },
              },
            ],
          },
        })
        console.log("Default 'Sheet1' tab removed successfully.")
      }
    }
  } catch (err) {
    console.error("Failed to delete default 'Sheet1' sheet:", err.message)
  }
}

/**
 * Ensures the header row exists in the sheet, dynamically creating the sheet if it doesn't exist.
 */
async function ensureHeaders(sheets) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:K1`,
    })
    if (!res.data.values || res.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [HEADERS] },
      })
    }
    // Clean up Sheet1 if we are using Reviews
    if (SHEET_NAME !== 'Sheet1') {
      await deleteDefaultSheet(sheets)
    }
  } catch (error) {
    // If sheet doesn't exist, create it and write headers
    const errorMsg = error.message || ''
    if (errorMsg.includes('Unable to parse range') || error.status === 400) {
      try {
        console.log(`Sheet "${SHEET_NAME}" not found. Creating it...`)
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: SHEET_NAME,
                  },
                },
              },
            ],
          },
        })
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${SHEET_NAME}!A1`,
          valueInputOption: 'RAW',
          requestBody: { values: [HEADERS] },
        })
        console.log(`Sheet "${SHEET_NAME}" created with headers.`)
        
        // Clean up Sheet1 if we are using Reviews
        if (SHEET_NAME !== 'Sheet1') {
          await deleteDefaultSheet(sheets)
        }
        return
      } catch (createError) {
        console.error('Failed to dynamically create sheet:', createError)
      }
    }
    throw error
  }
}

/**
 * Maps a raw sheet row to a review object.
 */
function rowToReview(row) {
  return {
    employeeId: row[0] || '',
    employeeName: row[1] || '',
    employeeEmail: row[2] || '',
    month: row[3] || '',
    outputQuality: parseFloat(row[4]) || 0,
    attendance: parseFloat(row[5]) || 0,
    teamwork: parseFloat(row[6]) || 0,
    averageScore: parseFloat(row[7]) || 0,
    comment: row[8] || '',
    managerName: row[9] || '',
    timestamp: row[10] || '',
  }
}

/**
 * Create a new review row in Google Sheets.
 */
export async function createReview(reviewData) {
  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error('Google Sheets credentials not configured')
  }
  const sheets = await getSheetsClient()
  await ensureHeaders(sheets)

  const row = [
    reviewData.employeeId,
    reviewData.employeeName,
    reviewData.employeeEmail,
    reviewData.month,
    reviewData.outputQuality,
    reviewData.attendance,
    reviewData.teamwork,
    reviewData.averageScore,
    reviewData.comment,
    reviewData.managerName || 'Manager',
    reviewData.timestamp || new Date().toISOString(),
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:K`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })

  return rowToReview(row)
}

/**
 * Fetch all reviews from Google Sheets.
 */
export async function getReviews() {
  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error('Google Sheets credentials not configured')
  }
  const sheets = await getSheetsClient()
  await ensureHeaders(sheets)

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:K`,
  })

  const rows = res.data.values || []
  return rows.filter((r) => r[0]).map(rowToReview)
}

/**
 * Fetch reviews for a specific employee by their ID.
 */
export async function getEmployeeReviews(employeeId) {
  const all = await getReviews()
  return all.filter((r) => r.employeeId === employeeId)
}
