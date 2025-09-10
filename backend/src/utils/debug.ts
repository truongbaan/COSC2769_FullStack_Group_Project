/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

export const debugLog = (...args: any[]) => {
  if (process.env.PRODUCTION_SITE !== 'true') {
    console.log(...args);
  }
};

export const debugError = (...args: any[]) => {
  if (process.env.PRODUCTION_SITE !== 'true') {
    console.error(...args);
  }
};