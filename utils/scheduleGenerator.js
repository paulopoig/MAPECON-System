const { addMonths, addWeeks, addDays, format, parseISO } = require('date-fns');

// A quick helper to add 'ST', 'ND', 'RD', 'TH' to numbers
function getOrdinal(n) {
    const s = ["TH", "ST", "ND", "RD"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function generateSchedule(breakdate, durationInMonths, frequency, accountType) {
    let schedule = [];
    // Convert the string breakdate (e.g., "2026-01-20") into a real JavaScript Date object
    let currentDate = typeof breakdate === 'string' ? parseISO(breakdate) : breakdate;
    
    // Determine how many total months we are covering
    let monthsPassed = 0;
    let treatmentNumber = 1;

    // Loop until we hit the duration limit
    while (monthsPassed < durationInMonths) {
        
        // 1. Determine the Label (The "GENERAL TREATMENT" Rule)
        let label = "";
        if (treatmentNumber === 1 && (accountType === "SS" || accountType === "TPW")) {
            label = "GENERAL TREATMENT";
        } else {
            label = `${getOrdinal(treatmentNumber)} TREATMENT`;
        }

        // 2. Format the Date for the PDF (e.g., "January, 2026")
        let displayDate = format(currentDate, "MMMM, yyyy");
        
        // 3. Save it to our list
        schedule.push(`${label}: ${displayDate}`);

        // 4. The Time Jump (Calculate the next date based on frequency)
        switch (frequency) {
            case "Monthly":
                currentDate = addMonths(currentDate, 1);
                monthsPassed += 1;
                break;
            case "Quarterly":
                currentDate = addMonths(currentDate, 3);
                monthsPassed += 3;
                break;
            case "Semi-Annually":
                currentDate = addMonths(currentDate, 6);
                monthsPassed += 6;
                break;
            case "Annually":
                currentDate = addMonths(currentDate, 12);
                monthsPassed += 12;
                break;
            case "Weekly":
                currentDate = addWeeks(currentDate, 1);
                // Rough math: 4 weeks = 1 month for the sake of the duration loop
                monthsPassed += 0.25; 
                break;
            case "Every Other Month":
                currentDate = addMonths(currentDate, 2);
                monthsPassed += 2;
                break;
            default:
                // For "Spot" or "Per Call", we just do 1 treatment and kill the loop
                monthsPassed = durationInMonths; 
                break;
        }
        
        treatmentNumber++;
    }

    return schedule;
}

module.exports = { generateSchedule };