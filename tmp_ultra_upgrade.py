import os

filepath = r'c:\Users\VISHANT PANWAR\OneDrive\Desktop\pro\website\backend\index.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. New DB + Function + Route Logic
replacement_block = """// --- SMART FALLBACK DIAGNOSTIC ENGINE (No Key Required) ---
const CAR_DIAGNOSTIC_DB = [
    { keywords: ['squeal', 'belt', 'high pitch', 'rubber', 'noise', 'awaz', 'chi-chi'], issue: "Worn Serpentine Belt", dangerLevel: "MEDIUM", details: "Aapki car ki main poly-belt (serpentine belt) ghis gayi hai ya dhili ho gayi hai. Isiliye acceleration par ye tez 'cheekh' jaisi awaz aati hai.", action: "Belt ko tight karwao ya turant nayi dalwa lo varna battery charging aur AC chalna band ho jayega.", estimatedCost: "₹1,200 - ₹2,500" },
    { keywords: ['grinding', 'brake', 'pad', 'squeak', 'stopping', 'disc', 'ghisna', 'pahiya'], issue: "Worn Brake Pads", dangerLevel: "CRITICAL", details: "Brake pads ekdum khatam ho chuke hain aur disc par metal ghis raha hai. Ye bahut khatarnak hai aur braking power kam kar deta hai.", action: "Gaadi abhi roko! Kisi pas ke mechanic se brake pads change karwao turant. Risk mat lo.", estimatedCost: "₹2,500 - ₹4,500" },
    { keywords: ['vibration', 'steering', 'shake', 'speed', 'bubble', 'kaanpna', 'vibrate'], issue: "Wheel Balancing/Alignment", dangerLevel: "LOW", details: "Agar steering wheel ya puri gaadi 80-100 ki speed par kaanp (vibrate) rahi hai, toh wheels ka balance bigad gaya hai.", action: "Wheel alignment aur balancing karwao, tyres ki life badh jayegi.", estimatedCost: "₹500 - ₹1,200" },
    { keywords: ['bump', 'noise', 'thud', 'suspension', 'jump', 'shocker', 'gud-gud', 'khad-khad'], issue: "Suspension/Shockers Failure", dangerLevel: "LOW", details: "Gaddhon mein 'gud-gud' ya 'thud' awaz aa rahi hai? Aapke shockers ya suspension bushes khatam ho gaye hain.", action: "Suspension repair karwao varna steering aur control kharab hoga.", estimatedCost: "₹5,000 - ₹15,000" },
    { keywords: ['misfire', 'missing', 'jerk', 'pickup', 'spark', 'jhatka', 'stop', 'missing', 'rough'], issue: "Engine Misfire / Spark Plug", dangerLevel: "MEDIUM", details: "Gaadi jhatke (jerks) le rahi hai aur pickup kam ho gaya hai? Shayad spark plug ya ignition coil kharab hai.", action: "Spark plugs clean karwao ya badal lo.", estimatedCost: "₹800 - ₹2,500" },
    { keywords: ['hissing', 'steam', 'smoke', 'radiator', 'leak', 'vacuum', 'whistle'], issue: "Radiator Leak / Vacuum Leak", dangerLevel: "CRITICAL", details: "Engine se 'hissing' ya seeti jaisi awaz aa rahi hai? Ye shayad coolant leak ya vacuum pipe fatne ki wajah se hai.", action: "Turant radiator check karo aur engine overheat mat hone do.", estimatedCost: "₹2,000 - ₹8,500" },
    { keywords: ['clunk', 'gear', 'shift', 'transmission', 'jerk'], issue: "Transmission/Gearbox Issue", dangerLevel: "CRITICAL", details: "Gear shift karte waqt 'clunk' awaz aa rahi hai? Gearbox ke synchronizers ya oil me dikkat ho sakti hai.", action: "Transmission oil level aur quality check karwayein.", estimatedCost: "₹15,000 - ₹60,000" },
    { keywords: ['humming', 'bearing', 'vroom', 'wheel noise', 'pahiya awaz', 'goonj', 'grinding'], issue: "Wheel Bearing Wear", dangerLevel: "MEDIUM", details: "Gaadi chalne par 'humm-humm' jaisi awaz pahiye se aa rahi hai? Wheel bearing ghis chuka hai.", action: "Bearing badal lo varna pahiya jam (seize) ho sakta hai.", estimatedCost: "₹1,500 - ₹3,500" },
    { keywords: ['ticking', 'tapping', 'oil', 'valves', 'tik-tik'], issue: "Low Oil / Tappet Noise", dangerLevel: "MEDIUM", details: "Engine se 'tik-tik' awaz aa rahi hai? Shayad engine oil level low hai ya valves (tappets) loose hain.", action: "Pehle engine oil dipstick check karo. Agar oil kam hai toh turant fill karo.", estimatedCost: "₹500 - ₹2,000" },
    { keywords: ['alternator', 'charge', 'battery', 'whine', 'electronic'], issue: "Alternator Failure", dangerLevel: "MEDIUM", details: "Engine se lagatar 'whining' (vroom-vroom) awaz aa rahi hai? Shayad alternator ki bearings khatam ho rahi hain.", action: "Battery charging light check karo aur alternator repair karwao.", estimatedCost: "₹3,000 - ₹7,500" },
    { keywords: ['exhaust', 'loud', 'noise', 'smoke', 'silencer', 'fat-fat'], issue: "Exhaust Leak / Silencer", dangerLevel: "LOW", details: "Aapki gaadi ka exhaust system (silencer) kahin se leak hai ya fat gaya hai, isiliye awaz bahut loud ho gayi hai.", action: "Silencer ki welding karwao ya naya dholki dalwa lo.", estimatedCost: "₹800 - ₹3,500" },
    { keywords: ['mount', 'vibration', 'cabin', 'shaking', 'idling'], issue: "Engine Mount Damage", dangerLevel: "MEDIUM", details: "Agar gaadi khadi (idling) par bahut zyada vibrate kar rahi hai, toh engine ke foundation mounts toot gaye hain.", action: "Mounts check karwa kar badlo.", estimatedCost: "₹2,000 - ₹6,500" },
];

function getSmartDiagnosis(userInput, signature, peaks = []) {
    const input = (userInput || '').toLowerCase();
    
    const unknownResponses = [
        { issue: "Complex Technical Issue", dangerLevel: "LOW", details: "Hume car mein kuch ajeeb detect hua hai par exact problem clear nahi hai. Ye sensors ya electrical system ki dikkat ho sakti hai.", action: "Ek baar laptop scanning karwa lo kisi ache mechanic se.", estimatedCost: "₹500 - ₹1,500" },
        { issue: "Acoustic Signature Mismatch", dangerLevel: "MEDIUM", details: "Sound analyzer ko thodi confusion ho rahi hai. Ye engine ke kisi internal part ka noise lag raha hai.", action: "Gaadi ki speed kam rakho aur engine oil level check karo.", estimatedCost: "₹1,000 - ₹3,000" },
        { issue: "Undetermined Mechanical Wear", dangerLevel: "LOW", details: "Aapki description ke hisaab se ye normal wear and tear lag raha hai. Shayad purani gaadi hone ki wajah se ye awaz hai.", action: "Normal service karwane par ye theek ho sakta hai.", estimatedCost: "₹2,000 - ₹4,000" }
    ];

    let candidates = [];
    let maxScore = 0;

    const maxPeakBin = peaks.length > 0 ? peaks[0].bin : 0;
    const avgPeakVal = peaks.length > 0 ? peaks.reduce((acc, p) => acc + p.val, 0) / peaks.length : 0;

    CAR_DIAGNOSTIC_DB.forEach(item => {
        let score = 0;
        item.keywords.forEach(kw => {
            if (input.includes(kw)) score += 10;
        });
        
        if (maxPeakBin > 40 && item.keywords.some(k => ['belt', 'squeal', 'whistle', 'hissing'].includes(k))) score += 20; 
        if (maxPeakBin < 10 && item.keywords.some(k => ['knock', 'thud', 'mount', 'heavy'].includes(k))) score += 20; 
        if (avgPeakVal > 150 && item.keywords.some(k => ['grinding', 'brake', 'bearing'].includes(k))) score += 15; 

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
        if (signature === 'high') {
            bestResult = { issue: "High-Freq Resonance detected", dangerLevel: "MEDIUM", details: "System ne ek teekhi awaz pakdi hai. Ye aksar turbo leak ya alternator bearing ki awaz hoti hai.", action: "Ek baar belt aur turbo hoses check karwao.", estimatedCost: "₹3,000 - ₹10,000", confidence: 85 };
        } else if (signature === 'low') {
            bestResult = { issue: "Low-Freq Vibration", dangerLevel: "CRITICAL", details: "Ye engine ke niche se aane wali bhari awaz hai jo kafi khatarnak ho sakti hai.", action: "Gaadi abhi roko aur oil level check karo.", estimatedCost: "₹15,000 - ₹75,000", confidence: 88 };
        } else {
            const randomUnknown = unknownResponses[Math.floor(Math.random() * unknownResponses.length)];
            bestResult = { ...randomUnknown, confidence: 70 };
        }
    }

    const prefixes = ["Bhai, ", "Aapki gaadi mein ", "System check se pata chala hai ki ", "Hume ye lagta hai: ", "Suno bhai, "];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    bestResult.details = prefix + bestResult.details;
    bestResult.confidence = Math.min(96, 75 + (maxScore * 1.5));
    bestResult.version = "5.5-ULTRA";

    return bestResult;
}

// --- AI DIAGNOSTIC ROUTE ---
app.post('/api/ai/diagnose', checkDbConnection, async (req, res) => {
    try {
        const { symptom, audioSignature, spectralPeaks } = req.body;

        if (!symptom && !audioSignature && !spectralPeaks) {
            return res.status(400).json({ message: "No input provided for analysis." });
        }

        let prompt = `You are an expert car mechanic AI. 
        Symptom: "${symptom || 'Acoustic Scan'}"
        Spectral Signature: "${audioSignature}"
        Frequency Peaks: ${JSON.stringify(spectralPeaks || [])}

        Instructions:
        1. Analyze if this is a vehicle issue.
        2. Provide response in RAW JSON:
        {
          "issue": "Specific Problem Name",
          "dangerLevel": "LOW/MEDIUM/CRITICAL",
          "details": "WhatsApp style Hinglish explanation",
          "action": "Immediate Hinglish advice",
          "estimatedCost": "₹X - ₹Y",
          "confidence": 0-100
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        try {
          const diagnostic = JSON.parse(text);
          res.json(diagnostic);
        } catch (parseErr) {
          throw new Error("Invalid AI response");
        }
    } catch (error) {
        const diagnostic = getSmartDiagnosis(req.body.symptom || '', req.body.audioSignature, req.body.spectralPeaks);
        res.json(diagnostic);
    }
});"""

# Find the start of the section and the end of the route
start_index = content.find("// --- SMART FALLBACK DIAGNOSTIC ENGINE")
# The end of the section is the line starting with // --- SMART QR SCAN ALERT
end_index = content.find("// --- SMART QR SCAN ALERT")

if start_index != -1 and end_index != -1:
    content = content[:start_index] + replacement_block + "\n\n" + content[end_index:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Ultra Upgrade Successful")
else:
    print(f"Error: Indices not found. Start: {start_index}, End: {end_index}")
