/**
 * Utility functions for calculating speech timing based on text content
 */

/**
 * Calculates speech timing metrics based on the provided text
 * @param text The text to analyze
 * @returns Object containing wordCount, minDurationInSeconds, and optDurationInSeconds
 */
export function calculateSpeechTiming(text: string) {
    // Clean and normalize text
    const cleanText = text
        .replace(/&nbsp;/gi, ' ')
        .replace(/<br>|\n/gi, ' ')
        .replace(/<\/?font[^>]*>/gi, '')
        .replace(/[()]/g, '');
    
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    let duration = 0;
    
    // Calculate duration based on word characteristics
    for (const word of words) {
        if (word === '<br>') continue;
        
        // Special characters add 0.5 seconds
        if (/[$&%№]/.test(word)) {
            duration += 0.5;
        }
        
        // Ellipsis handling
        if (word.includes('...')) {
            duration += word.length > 3 ? 1 : 0.5;
        }
        
        // Number handling
        if (isNumeric(word)) {
            duration += calculateNumberDuration(word);
        } else {
            // Word length-based timing
            if (word.length > 14) {
                duration += 1;
            } else if (word.length > 2) {
                duration += 0.5;
            }
        }
        
        // Phone number detection and hyphen handling
        if (word.includes('-') && !isNumeric(word)) {
            duration += 0.5;
        }
    }
    
    return {
        wordCount: words.length,
        minDurationInSeconds: Math.round(duration * 0.99),
        optDurationInSeconds: Math.round(duration * 1.09 + 1)
    };
}

/**
 * Checks if a string is a numeric value
 * @param str The string to check
 * @returns True if the string is numeric, false otherwise
 */
function isNumeric(str: string): boolean {
    return /^-?\d*\.?\d+$/.test(str);
}

/**
 * Calculates the duration for speaking a number
 * @param numberStr The number string to analyze
 * @returns The calculated duration in seconds
 */
function calculateNumberDuration(numberStr: string): number {
    // Simplified number duration calculation
    const digits = numberStr.replace(/[^\d]/g, '');
    let duration = digits.length * 0.5;
    
    // Adjust for zeros (they're quicker to say)
    const zeroCount = (digits.match(/0/g) || []).length;
    duration -= zeroCount * 0.25;
    
    return Math.max(0.5, duration);
}
