import Application from '../models/Application.js';

/**
 * Generates an Application ID in the format: JA-<first 3 letters of company in uppercase>-<3-digit sequence>
 * Example: JA-INF-001, JA-GOO-002
 * Sequence increments per company prefix.
 */
export const generateApplicationId = async (companyName) => {
  // Clean company name: keep only alphanumeric characters
  const cleanName = companyName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Extract first 3 characters, pad with 'X' if less than 3
  let companyPrefix = cleanName.slice(0, 3);
  if (companyPrefix.length < 3) {
    companyPrefix = companyPrefix.padEnd(3, 'X');
  }

  // Find all applications matching this company prefix
  const prefixRegex = new RegExp(`^JA-${companyPrefix}-\\d{3}$`);
  const matchingApps = await Application.find({ applicationId: prefixRegex }).select('applicationId').lean();

  let maxSequence = 0;
  for (const app of matchingApps) {
    const parts = app.applicationId.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq) && seq > maxSequence) {
        maxSequence = seq;
      }
    }
  }

  const nextSequence = maxSequence + 1;
  const sequenceStr = String(nextSequence).padStart(3, '0');

  return `JA-${companyPrefix}-${sequenceStr}`;
};
