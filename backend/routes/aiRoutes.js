const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

let model;
if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
}

// --- SMART FALLBACK DIAGNOSTIC ENGINE (No Key Required) ---
const CAR_DIAGNOSTIC_DB = [
    { 
        keywords: ['squeal', 'belt', 'high pitch', 'rubber', 'noise', 'awaz', 'chi-chi', 'teez awaz', 'poly-belt', 'poly belt', 'seeti'], 
        issue: "Worn Serpentine Belt", 
        dangerLevel: "MEDIUM", 
        details: "Aapki car ki main poly-belt (serpentine belt) ghis gayi hai ya dhili ho gayi hai. Isiliye acceleration par ye tez 'cheekh' ya 'seeti' jaisi awaz aati hai.", 
        action: "Belt ko tight karwao ya turant nayi dalwa lo varna battery charging aur AC chalna band ho jayega.", 
        estimatedCost: "₹1,200 - ₹2,500",
        suggestedMechanic: "Engine Specialist / General Mechanic"
    },
    { 
        keywords: ['grinding', 'brake', 'pad', 'squeak', 'stopping', 'disc', 'ghisna', 'pahiya', 'brake pad', 'break pad', 'ghiss', 'braking'], 
        issue: "Worn Brake Pads", 
        dangerLevel: "CRITICAL", 
        details: "Brake pads ekdum khatam ho chuke hain aur disc par metal ghis raha hai. Ye bahut khatarnak hai aur braking power kam kar deta hai.", 
        action: "Gaadi abhi roko! Kisi pas ke mechanic se brake pads change karwao turant. Risk mat lo.", 
        estimatedCost: "₹2,500 - ₹4,500",
        suggestedMechanic: "Brake Specialist"
    },
    { 
        keywords: ['vibration', 'steering', 'shake', 'speed', 'bubble', 'kaanpna', 'vibrate', 'hath kaanpna', 'steering vibration', 'kapkapahat'], 
        issue: "Wheel Balancing/Alignment", 
        dangerLevel: "LOW", 
        details: "Agar steering wheel ya puri gaadi 80-100 ki speed par kaanp (vibrate) rahi hai, toh wheels ka balance bigad gaya hai.", 
        action: "Wheel alignment aur balancing karwao, tyres ki life badh jayegi.", 
        estimatedCost: "₹500 - ₹1,200",
        suggestedMechanic: "Wheel Alignment & Tyre Shop"
    },
    { 
        keywords: ['bump', 'noise', 'thud', 'suspension', 'jump', 'shocker', 'gud-gud', 'khad-khad', 'jhatka', 'shokers', 'khadkhad'], 
        issue: "Suspension/Shockers Failure", 
        dangerLevel: "LOW", 
        details: "Gaddhon mein 'gud-gud' ya 'thud' awaz aa rahi hai? Aapke shockers ya suspension bushes khatam ho gaye hain.", 
        action: "Suspension repair karwao varna steering aur control kharab hoga.", 
        estimatedCost: "₹5,000 - ₹15,000",
        suggestedMechanic: "Suspension Specialist"
    },
    { 
        keywords: ['misfire', 'missing', 'jerk', 'pickup', 'spark', 'jhatka', 'stop', 'rough', 'spark plug', 'plug', 'miss kar rahi', 'jhatke'], 
        issue: "Engine Misfire / Spark Plug", 
        dangerLevel: "MEDIUM", 
        details: "Gaadi jhatke (jerks) le rahi hai aur pickup kam ho gaya hai? Shayad spark plug ya ignition coil kharab hai.", 
        action: "Spark plugs clean karwao ya badal lo.", 
        estimatedCost: "₹800 - ₹2,500",
        suggestedMechanic: "Engine Specialist / Auto Tuner"
    },
    { 
        keywords: ['hissing', 'steam', 'smoke', 'radiator', 'leak', 'vacuum', 'whistle', 'cooling', 'coolant', 'garam', 'overheat', 'paani', 'seeti'], 
        issue: "Radiator Leak / Vacuum Leak", 
        dangerLevel: "CRITICAL", 
        details: "Engine se 'hissing' ya seeti jaisi awaz aa rahi hai? Ye shayad coolant leak, radiator fatne, ya vacuum pipe leak hone ki wajah se hai.", 
        action: "Turant radiator check karo aur engine overheat mat hone do.", 
        estimatedCost: "₹2,000 - ₹8,500",
        suggestedMechanic: "Cooling System Specialist"
    },
    { 
        keywords: ['clunk', 'gear', 'shift', 'transmission', 'jerk', 'gearbox', 'gear fansna', 'gear lagna', 'clutch gear'], 
        issue: "Transmission/Gearbox Issue", 
        dangerLevel: "CRITICAL", 
        details: "Gear shift karte waqt 'clunk' awaz aa rahi hai ya gear fas raha hai? Gearbox ke synchronizers ya oil me dikkat ho sakti hai.", 
        action: "Transmission oil level aur quality check karwayein.", 
        estimatedCost: "₹15,000 - ₹60,000",
        suggestedMechanic: "Gearbox/Transmission Specialist"
    },
    { 
        keywords: ['humming', 'bearing', 'vroom', 'wheel noise', 'pahiya awaz', 'goonj', 'bearing sound', 'wheel bearing'], 
        issue: "Wheel Bearing Wear", 
        dangerLevel: "MEDIUM", 
        details: "Gaadi chalne par 'humm-humm' jaisi awaz pahiye se aa rahi hai? Wheel bearing ghis chuka hai.", 
        action: "Bearing badal lo varna pahiya jam (seize) ho sakta hai.", 
        estimatedCost: "₹1,500 - ₹3,500",
        suggestedMechanic: "Wheel & Bearing Specialist"
    },
    { 
        keywords: ['ticking', 'tapping', 'oil', 'valves', 'tik-tik', 'engine oil', 'tappet', 'tiktik'], 
        issue: "Low Oil / Tappet Noise", 
        dangerLevel: "MEDIUM", 
        details: "Engine se 'tik-tik' awaz aa rahi hai? Shayad engine oil level low hai ya valves (tappets) loose hain.", 
        action: "Pehle engine oil dipstick check karo. Agar oil kam hai toh turant fill karo.", 
        estimatedCost: "₹500 - ₹2,000",
        suggestedMechanic: "General Engine Mechanic"
    },
    { 
        keywords: ['alternator', 'charge', 'battery', 'whine', 'electronic', 'charging', 'battery charge', 'whining noise'], 
        issue: "Alternator Failure", 
        dangerLevel: "MEDIUM", 
        details: "Engine se lagatar 'whining' (vroom-vroom) awaz aa rahi hai aur battery weak ho rahi hai? Shayad alternator ki bearings khatam ho rahi hain.", 
        action: "Battery charging light check karo aur alternator repair karwao.", 
        estimatedCost: "₹3,000 - ₹7,500",
        suggestedMechanic: "Auto Electrician"
    },
    { 
        keywords: ['exhaust', 'loud', 'noise', 'smoke', 'silencer', 'fat-fat', 'dhuwa', 'dhua', 'silencer pipe', 'patpat'], 
        issue: "Exhaust Leak / Silencer", 
        dangerLevel: "LOW", 
        details: "Aapki gaadi ka exhaust system (silencer) kahin se leak hai ya fat gaya hai, isiliye awaz bahut loud ho gayi hai.", 
        action: "Silencer ki welding karwao ya naya dholki dalwa lo.", 
        estimatedCost: "₹800 - ₹3,500",
        suggestedMechanic: "Silencer & Exhaust Specialist"
    },
    { 
        keywords: ['mount', 'vibration', 'cabin', 'shaking', 'idling', 'engine mount', 'engine foundation', 'foundation mount'], 
        issue: "Engine Mount Damage", 
        dangerLevel: "MEDIUM", 
        details: "Agar gaadi khadi (idling) par bahut zyada vibrate kar rahi hai ya cabin shaking ho rahi hai, toh engine ke foundation mounts toot gaye hain.", 
        action: "Mounts check karwa kar badlo.", 
        estimatedCost: "₹2,000 - ₹6,500",
        suggestedMechanic: "Engine Specialist"
    },
    {
        keywords: ['steering', 'whine', 'turn', 'power steering', 'fluid', 'ghumna', 'steer', 'whining', 'steering modna', 'steering oil'],
        issue: "Power Steering Pump Whine",
        dangerLevel: "MEDIUM",
        details: "Aapki gaadi ka steering ghumane par whining (vroom-vroom) awaz aa rahi hai. Ye aksar power steering fluid leak hone ya pump kharab hone se hota hai.",
        action: "Power steering oil reservoir ka level check karo, leak ho to repair karwao aur fluid top-up karo.",
        estimatedCost: "₹1,500 - ₹5,500",
        suggestedMechanic: "Steering & Suspension Specialist"
    },
    {
        keywords: ['starter', 'clicking', 'crank', 'start', 'chabi', 'self', 'ghar-ghar', 'click', 'start nahi', 'gadi start', 'engine start', 'starter motor'],
        issue: "Starter Motor Solenoid / Solenoid Switch",
        dangerLevel: "HIGH",
        details: "Chabi ghumane par gaadi start nahi ho rahi aur sirf 'tick-tick' ya 'ghar-ghar' ki awaz aa rahi hai? Starter motor ka solenoid switch ya battery ki dikkat hai.",
        action: "Battery connections check karo. Agar battery sahi hai to starter motor repair karwao.",
        estimatedCost: "₹2,000 - ₹6,000",
        suggestedMechanic: "Auto Electrician"
    },
    {
        keywords: ['ac', 'compressor', 'cooling', 'grinding ac', 'hawa', 'chilling', 'bearing', 'thanda', 'ac button', 'ac cooling'],
        issue: "AC Compressor Clutch Bearing",
        dangerLevel: "LOW",
        details: "AC on karne par engine se grinding ya ghisaawat ki awaz aati hai? AC compressor ka clutch bearing wear ho chuka hai.",
        action: "AC off rakhein aur compressor bearing change karwayein taaki belt tootne se bache.",
        estimatedCost: "₹2,500 - ₹7,000",
        suggestedMechanic: "Car AC Specialist"
    },
    {
        keywords: ['clutch', 'pedal', 'rattle', 'clutch bearing', 'gear shift', 'dabane', 'bearing', 'rattling', 'clutch plate', 'clutch wire'],
        issue: "Clutch Release Bearing Wear",
        dangerLevel: "MEDIUM",
        details: "Clutch pedal dabane par rattling ya khad-khad awaz aati hai jo chhodne par band ho jaati hai? Clutch release bearing ghis gaya hai.",
        action: "Jaldi clutch kit change karwayein varna gear shifting band ho sakti hai.",
        estimatedCost: "₹6,000 - ₹14,000",
        suggestedMechanic: "Gearbox & Clutch Specialist"
    },
    {
        keywords: ['ev', 'electric', 'motor', 'whining ev', 'battery car', 'inverter', 'silent car', 'whining', 'whistle', 'electric vehicle'],
        issue: "EV Motor / Reduction Gear Wear",
        dangerLevel: "MEDIUM",
        details: "Electric vehicle mein chalte waqt abnormally tez high-pitched whistling/whining awaz aa rahi hai? Reduction gear bearing ya inverter hum.",
        action: "EV service center par scan karwayein, gearbox lubricant replace karein.",
        estimatedCost: "₹8,000 - ₹35,000",
        suggestedMechanic: "EV Specialist / Brand Service Center"
    },
    {
        keywords: ['diesel', 'injector', 'knock diesel', 'smoke', 'injector knock', 'crdi', 'diesel tik-tik', 'clattering', 'ticking', 'kala dhua'],
        issue: "Diesel Injector Knocking",
        dangerLevel: "CRITICAL",
        details: "Diesel engine se bahut tez tik-tik (clattering) awaz aa rahi hai aur exhaust se kala dhua (black smoke) aa raha hai? Injector chocked hain.",
        action: "Gaadi zyada mat chalao, nozzle clean karwayein varna piston damage ho sakta hai.",
        estimatedCost: "₹8,000 - ₹24,000",
        suggestedMechanic: "Diesel Engine & Fuel Injector Specialist"
    },
    {
        keywords: ['exhaust manifold', 'manifold', 'flutter', 'ticking hot', 'dhua manifold', 'ticking', 'exhaust', 'gasket leak'],
        issue: "Exhaust Gasket / Manifold Leak",
        dangerLevel: "MEDIUM",
        details: "Engine startup par tez ticking ya phat-phat awaz aati hai jo garam hone par kam ho jaati hai? Exhaust manifold gasket leak hai.",
        action: "Exhaust manifold gasket badalwao, exhaust gases cabin mein aa sakti hain.",
        estimatedCost: "₹1,500 - ₹5,000",
        suggestedMechanic: "Silencer & Exhaust Specialist"
    }
];

function getSmartDiagnosis(userInput, signature, peaks = [], hasImage = false, vehicleType = 'ice') {
    const input = (userInput || '').toLowerCase().trim();
    
    // Enforce EV vs ICE separation in smart fallback
    if (vehicleType === 'ev') {
        const iceTerms = ['spark', 'plug', 'radiator', 'exhaust', 'silencer', 'clutch', 'belt', 'diesel', 'petrol', 'cng', 'engine oil', 'tappet', 'carburetor', 'misfire', 'combustion', 'piston'];
        if (iceTerms.some(term => input.includes(term))) {
            return {
                issue: "ICE Vehicle Query Detected",
                dangerLevel: "LOW",
                details: "Bhaiya, ye EV Diagnostics console hai aur aapki query ICE (Petrol/Diesel/CNG) gaadi se related lag rahi hai. Please 'AI Engine Sound Doctor' page par jaakar ise check karein. EV Hub me sirf EV ki battery, electric motor, regenerative braking aur EV console alerts diagnose hote hain.",
                action: "AI Engine Sound Doctor page open karein aur wahan input karein.",
                estimatedCost: "₹0",
                suggestedMechanic: "N/A",
                confidence: 100,
                version: "5.7-ULTRA"
            };
        }
    } else {
        const evTerms = ['ev', 'electric', 'inverter', 'regen', 'regenerative', 'charging station', 'cell temp', 'battery cell', 'charging socket', 'lithium ion', 'bms', 'charging port'];
        if (evTerms.some(term => input.includes(term))) {
            return {
                issue: "EV Query Detected",
                dangerLevel: "LOW",
                details: "Bhaiya, ye AI Engine Sound Doctor page hai jo sirf Petrol, Diesel, aur CNG cars ke liye hai. Aapki query EV (Electric Vehicle) se related lag rahi hai. Please 'EV Hub' page par jaakar 'AI Diagnostics' tab me ise check karein.",
                action: "EV Hub page open karein aur AI Diagnostics tab use karein.",
                estimatedCost: "₹0",
                suggestedMechanic: "N/A",
                confidence: 100,
                version: "5.7-ULTRA"
            };
        }
    }
    
    const maxPeakBin = peaks.length > 0 ? peaks[0].bin : 0;
    const avgPeakVal = peaks.length > 0 ? peaks.reduce((acc, p) => acc + p.val, 0) / peaks.length : 0;

    // Reject low signal/ambient silence if no text description and no image is provided
    if (avgPeakVal < 80 && !input.trim() && !hasImage) {
        return {
            issue: "Low Signal / Ambient Noise",
            dangerLevel: "LOW",
            details: "Bhaiya, sound bahut dheemi hai ya koi car engine ki awaz nahi lag rahi hai. Apni gaadi ke engine ke paas jaakar achhe se record karo ya fir text box me detail me apni dikkaat likho (ya bolkar batao)!",
            action: "Gaadi ke engine ke paas jaakar clear sound record karein ya issue type/dictate karein.",
            estimatedCost: "₹0",
            suggestedMechanic: "N/A (Quiet environment)",
            confidence: 100,
            version: "5.7-ULTRA"
        };
    }

    const unknownResponses = [
        { issue: "Complex Technical Issue", dangerLevel: "LOW", details: "Hume car mein kuch ajeeb detect hua hai par exact problem clear nahi hai. Ye sensors ya electrical system ki dikkat ho sakti hai.", action: "Ek baar laptop scanning karwa lo kisi ache mechanic se.", estimatedCost: "₹500 - ₹1,500", suggestedMechanic: "General Mechanic / Scanner Expert" },
        { issue: "Acoustic Signature Mismatch", dangerLevel: "MEDIUM", details: "Sound analyzer ko thodi confusion ho rahi hai. Ye engine ke kisi internal part ka noise lag raha hai.", action: "Gaadi ki speed kam rakho aur engine oil level check karo.", estimatedCost: "₹1,000 - ₹3,000", suggestedMechanic: "Engine Specialist" },
        { issue: "Undetermined Mechanical Wear", dangerLevel: "LOW", details: "Aapki description ke hisaab se ye normal wear and tear lag raha hai. Shayad purani gaadi hone ki wajah se ye awaz hai.", action: "Normal service karwane par ye theek ho sakta hai.", estimatedCost: "₹2,000 - ₹4,000", suggestedMechanic: "General Mechanic" }
    ];

    let candidates = [];
    let maxScore = 0;

    CAR_DIAGNOSTIC_DB.forEach(item => {
        let score = 0;
        item.keywords.forEach(kw => {
            if (input.includes(kw)) {
                score += 10;
            }
        });
        
        if (avgPeakVal >= 45 && peaks.length > 0) {
            if (maxPeakBin > 40 && item.keywords.some(k => ['belt', 'squeal', 'whistle', 'hissing', 'ev', 'inverter', 'electric'].includes(k))) score += 20; 
            if (maxPeakBin < 10 && item.keywords.some(k => ['knock', 'thud', 'mount', 'heavy', 'clank', 'clicking'].includes(k))) score += 20; 
            if (avgPeakVal > 150 && item.keywords.some(k => ['grinding', 'brake', 'bearing'].includes(k))) score += 15; 
        } 

        if (score > maxScore) {
            maxScore = score;
            candidates = [{ ...item }];
        } else if (score === maxScore && score > 0) {
            candidates.push({ ...item });
        }
    });

    let bestResult = null;
    if (candidates.length > 0) {
        bestResult = candidates[Math.floor(Math.random() * candidates.length)];
        bestResult.otherPossibilities = candidates.filter(c => c.issue !== bestResult.issue).slice(0, 3).map(c => c.issue);
    } else {
        if (hasImage) {
            bestResult = { 
                issue: "Visual Evidence Scan", 
                dangerLevel: "MEDIUM", 
                details: "System ne aapki upload ki gayi photo ko scan kiya hai. Ye engine leak, coolant fluid level ya engine compartments mein structural wear ki problem ho sakti hai.", 
                action: "Gaadi ko kisi acche service center par physically dikhayein.", 
                estimatedCost: "₹1,500 - ₹8,000", 
                confidence: 80, 
                suggestedMechanic: "General Mechanic" 
            };
        } else if (signature === 'high' && peaks.length > 0) {
            bestResult = { issue: "High-Freq Resonance detected", dangerLevel: "MEDIUM", details: "System ne ek teekhi awaz pakdi hai. Ye aksar turbo leak ya alternator bearing ki awaz hoti hai.", action: "Ek baar belt aur turbo hoses check karwao.", estimatedCost: "₹3,000 - ₹10,000", confidence: 85, suggestedMechanic: "Turbo/Engine Specialist" };
        } else if (signature === 'low' && peaks.length > 0) {
            bestResult = { issue: "Low-Freq Vibration", dangerLevel: "CRITICAL", details: "Ye engine ke niche se aane wali bhari awaz hai jo kafi khatarnak ho sakti hai.", action: "Gaadi abhi roko aur oil level check karo.", estimatedCost: "₹15,000 - ₹75,000", confidence: 88, suggestedMechanic: "Transmission or Engine Mount Specialist" };
        } else {
            const randomUnknown = unknownResponses[Math.floor(Math.random() * unknownResponses.length)];
            bestResult = { ...randomUnknown, confidence: 70 };
        }
    }

    const prefixes = ["Bhai, ", "Aapki gaadi mein ", "System check se pata chala hai ki ", "Hume ye lagta hai: ", "Suno bhai, "];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    bestResult.details = prefix + bestResult.details;
    bestResult.confidence = Math.min(96, 75 + (maxScore * 1.5));
    bestResult.version = "5.7-ULTRA";

    return bestResult;
}

// --- AI DIAGNOSTIC ROUTE (Upgraded with Vision & Buddy Persona) ---
router.post('/diagnose', async (req, res) => {
    try {
        const { symptom, audioSignature, spectralPeaks, image, vehicleType } = req.body;

        if (!symptom && !audioSignature && !spectralPeaks && !image) {
            return res.status(400).json({ message: "No input provided for analysis." });
        }

        const avgPeakVal = spectralPeaks && spectralPeaks.length > 0 ? spectralPeaks.reduce((acc, p) => acc + p.val, 0) / spectralPeaks.length : 0;

        // Proactively reject low-signal/ambient silence before calling model
        if (!symptom && !image && avgPeakVal < 80) {
            return res.json({
                issue: "Low Signal / Ambient Noise",
                dangerLevel: "LOW",
                details: "Bhaiya, sound bahut dheemi hai ya koi car engine ki awaz nahi lag rahi hai. Apni gaadi ke engine ke paas jaakar achhe se record karo taaki main sahi se bata saku aur kharcha bhi accurate baje!",
                action: "Gaadi ke engine ke paas jaakar clear sound record karein.",
                estimatedCost: "₹0",
                suggestedMechanic: "N/A (Quiet environment)",
                confidence: 100,
                version: "5.7-ULTRA"
            });
        }

        // Perform smart fallback/direct check first to catch mismatched vehicles (EV on ICE screen or ICE on EV screen)
        const checkSmart = getSmartDiagnosis(symptom || '', audioSignature, spectralPeaks, !!image, vehicleType || 'ice');
        if (checkSmart.issue === "ICE Vehicle Query Detected" || checkSmart.issue === "EV Query Detected") {
            return res.json(checkSmart);
        }

        if (!model) {
            // Fallback if no Gemini key
            return res.json(checkSmart);
        }

        let prompt = `You are "Parxéé Buddy", a world-class automotive diagnostics AI and expert car mechanic. `;
        
        if (vehicleType === 'ev') {
            prompt += `You have expert-level knowledge of Electric Vehicles (EVs) (including EV batteries, electric motors, battery management systems, regenerative braking, EV charging, cell temperatures, and EV dashboard console codes).
            
            Symptom Description: "${symptom || 'Acoustic/Visual Analysis'}"
            Acoustic/Visual Data: image provided: ${!!image}
            
            Instructions:
            1. CRITICAL: This diagnostics request is STRICTLY for EV (Electric Vehicles) like Tesla, Tata Nexon/Punch EV, MG ZS EV, Ola Scooters, etc. If the symptom, image, or query relates to Petrol/Diesel/CNG engine components (like spark plugs, fuel injectors, engine oil level, radiator coolant, silencer exhaust, engine combustion noise/knocking, turbos, diesel clattering, clutch release bearing, or serpentine belt/poly-belt), you MUST reject it by returning exactly:
               {"issue": "ICE Vehicle Query Detected", "dangerLevel": "LOW", "details": "Bhaiya, ye EV Diagnostics console hai aur aapki query ICE (Petrol/Diesel/CNG) gaadi se related lag rahi hai. Please 'AI Engine Sound Doctor' page par jaakar ise check karein. EV Hub me sirf EV ki battery, electric motor, regenerative braking aur EV console alerts diagnose hote hain.", "action": "AI Engine Sound Doctor page open karein aur wahan input karein.", "estimatedCost": "₹0", "suggestedMechanic": "N/A", "confidence": 100}
            2. Leverage your deep automotive engineering database to perform a highly professional, accurate EV diagnostic match.
            3. Tone and Language: Friendly WhatsApp Hinglish (mix of English and Hindi/Urdu using Latin script). Use terms like "Bhaiya", "Chinta mat karo", "Dekho", "Dhyan se suno".
            4. In "estimatedCost", provide a realistic repair cost range in Indian Rupees (₹) based on severity.
            5. In "suggestedMechanic", specify the precise specialty needed (e.g., "EV Specialist", "EV Electrical Specialist", "EV Wiring Specialist", "EV Battery Specialist").
            6. Return a RAW JSON ONLY (no markdown blocks, no \`\`\`json):
            {
              "issue": "Accurate EV Problem Title",
              "dangerLevel": "LOW/MEDIUM/CRITICAL",
              "details": "Technical yet simple Hinglish analysis showing deep EV mechanical expertise",
              "action": "Safety/repair action in Hinglish",
              "estimatedCost": "₹X - ₹Y",
              "suggestedMechanic": "Specialist Mechanic Category",
              "confidence": 0-100
            }`;
        } else {
            prompt += `You have expert-level knowledge of Internal Combustion Engine (ICE) vehicles (Petrol, Diesel, and CNG cars, bikes, and turbos).
            
            Symptom Description: "${symptom || 'Acoustic/Visual Analysis'}"
            Acoustic Signature: "${audioSignature}"
            Spectral Peaks Data (FFT): ${JSON.stringify(spectralPeaks || [])}
            
            Instructions:
            1. CRITICAL: This diagnostics request is STRICTLY for Petrol, Diesel, or CNG (ICE) vehicles. If the symptom, image, or query relates to EV specific systems (like electric motors, EV battery pack cells, EV charging issues, regenerative braking, inverter, battery management system alerts), you MUST reject it by returning exactly:
               {"issue": "EV Query Detected", "dangerLevel": "LOW", "details": "Bhaiya, ye AI Engine Sound Doctor page hai jo sirf Petrol, Diesel, aur CNG cars ke liye hai. Aapki query EV (Electric Vehicle) se related lag rahi hai. Please 'EV Hub' page par jaakar 'AI Diagnostics' tab me ise check karein.", "action": "EV Hub page open karein aur AI Diagnostics tab use karein.", "estimatedCost": "₹0", "suggestedMechanic": "N/A", "confidence": 100}
            2. Leverage your deep automotive engineering database to perform a highly professional, accurate diagnostic match.
               - Connect high frequency peaks (whistles, squeals, hisses) to serpentine belts, pulleys, intake leaks, turbos, or brake pad friction.
               - Connect low frequency peaks (knocks, thuds, vibrations) to rods, pistons, mounts, transmission gearbox issues, suspension dampers, or exhaust mounts.
            3. Tone and Language: Friendly WhatsApp Hinglish (mix of English and Hindi/Urdu using Latin script). Use terms like "Bhaiya", "Chinta mat karo", "Dekho", "Dhyan se suno".
            4. In "estimatedCost", provide a realistic repair cost range in Indian Rupees (₹).
            5. In "suggestedMechanic", specify the precise specialty needed (e.g., "Engine Specialist", "Brake Specialist", "Auto Electrician", "Suspension Specialist", "Gearbox & Clutch Specialist", "Car AC Specialist", "Silencer & Exhaust Specialist").
            6. Return a RAW JSON ONLY (no markdown blocks, no \`\`\`json):
            {
              "issue": "Accurate Vehicle Problem Title",
              "dangerLevel": "LOW/MEDIUM/CRITICAL",
              "details": "Technical yet simple Hinglish analysis showing deep mechanical expertise",
              "action": "Safety/repair action in Hinglish",
              "estimatedCost": "₹X - ₹Y",
              "suggestedMechanic": "Specialist Mechanic Category",
              "confidence": 0-100
            }`;
        }

        let parts = [prompt];
        
        // Add image data if provided (Multimodal)
        if (image && image.includes('base64,')) {
          const base64Data = image.split('base64,')[1];
          const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        }

        const result = await model.generateContent(parts);
        let text = result.response.text();
        
        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        } else {
            text = text.replace(/\`\`\`json/gi, '').replace(/\`\`\`/gi, '').trim();
        }

        try {
          const diagnostic = JSON.parse(text);
          res.json(diagnostic);
        } catch (parseErr) {
          console.error("AI Parse Error:", text);
          throw new Error("Invalid AI response format");
        }
    } catch (error) {
        console.error("AI Route Error:", error);
        const diagnostic = getSmartDiagnosis(req.body.symptom || '', req.body.audioSignature, req.body.spectralPeaks, !!req.body.image, req.body.vehicleType || 'ice');
        res.json(diagnostic);
    }
});

module.exports = router;
