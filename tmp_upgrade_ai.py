import os

filepath = r'c:\Users\VISHANT PANWAR\OneDrive\Desktop\pro\website\backend\index.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CAR_DIAGNOSTIC_DB
new_db = """const CAR_DIAGNOSTIC_DB = [
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
    { keywords: ['knock', 'piston', 'rod', 'deep knock', 'heavy'], issue: "Piston Slap / Rod Knock", dangerLevel: "CRITICAL", details: "Engine ke andar se bhari 'dhak-dhak' awaz aa rahi hai? Ye engine ke internal damage (piston/rod) ka sign ho sakta hai.", action: "Gaadi abhi band karo! Engine seize ho sakta hai. Mechanic ko dikhao.", estimatedCost: "₹40,000 - ₹1,20,000" },
    { keywords: ['clutch', 'slipping', 'hard gear', 'burning', 'smell'], issue: "Clutch Plate Wear", dangerLevel: "MEDIUM", details: "Gaadi zor laga rahi hai par speed nahi pakad rahi? Clutch plate ghis chuki hai.", action: "Clutch set change karwana padega.", estimatedCost: "₹6,000 - ₹18,000" },
    { keywords: ['ac', 'cooling', 'compressor', 'noise'], issue: "AC Compressor Failure", dangerLevel: "LOW", details: "AC on karte hi engine se awaz aati hai aur cooling kam hai? Compressor me dikkat hai.", action: "AC gas aur compressor check karwayein.", estimatedCost: "₹8,000 - ₹20,000" },
];"""

# Replace CAR_DIAGNOSTIC_DB
import re
pattern_db = r'const CAR_DIAGNOSTIC_DB = \[.*? \];'
content = re.sub(pattern_db, new_db, content, flags=re.DOTALL)

# 2. Update getSmartDiagnosis signature and implementation
new_function = """function getSmartDiagnosis(userInput, signature, peaks = []) {
    const input = (userInput || '').toLowerCase();
    
    const unknownResponses = [
        { issue: "Complex Technical Issue", dangerLevel: "LOW", details: "Hume car mein kuch ajeeb detect hua hai par exact problem clear nahi hai. Ye sensors ya electrical system ki dikkat ho sakti hai.", action: "Ek baar laptop scanning karwa lo kisi ache mechanic se.", estimatedCost: "₹500 - ₹1,500" },
        { issue: "Acoustic Signature Mismatch", dangerLevel: "MEDIUM", details: "Sound analyzer ko thodi confusion ho rahi hai. Ye engine ke kisi internal part ka noise lag raha hai.", action: "Gaadi ki speed kam rakho aur engine oil level check karo.", estimatedCost: "₹1,000 - ₹3,000" },
        { issue: "Undetermined Mechanical Wear", dangerLevel: "LOW", details: "Aapki description ke hisaab se ye normal wear and tear lag raha hai. Shayad purani gaadi hone ki wajah se ye awaz hai.", action: "Normal service karwane par ye theek ho sakta hai.", estimatedCost: "₹2,000 - ₹4,000" }
    ];

    let candidates = [];
    let maxScore = 0;

    // Advanced Peak Analysis logic
    const peakSum = peaks.reduce((acc, p) => acc + p.val, 0);
    const avgPeakVal = peakSum / (peaks.length || 1);
    const maxPeakBin = peaks.length > 0 ? peaks[0].bin : 0;

    CAR_DIAGNOSTIC_DB.forEach(item => {
        let score = 0;
        item.keywords.forEach(kw => {
            if (input.includes(kw)) score += 10;
        });
        
        // --- SPECTRAL PEAK BOOSTING ---
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
    bestResult.confidence = bestResult.confidence || Math.min(96, 75 + (maxScore * 1.5));
    bestResult.version = "5.0-ULTRA";

    return bestResult;
}"""

pattern_func = r'function getSmartDiagnosis\(userInput, signature\).*?return bestResult;\n}'
content = re.sub(pattern_func, new_function, content, flags=re.DOTALL)

# 3. Update route params
content = content.replace('const { symptom, audioBase64, audioSignature } = req.body;', 'const { symptom, audioBase64, audioSignature, spectralPeaks } = req.body;')
content = content.replace("req.body.audioSignature);", "req.body.audioSignature, req.body.spectralPeaks);")

# Update prompt in route
old_prompt = r'let prompt = `You are a professional car mechanic.*?Just the raw JSON or the error string.`;'
new_prompt = r'let prompt = `You are an expert car mechanic AI. \nSymptom: "${symptom || \'Acoustic Scan\'}"\nSpectral Signature: "${audioSignature}"\nFrequency Peaks: ${JSON.stringify(spectralPeaks || [])}\n\nInstructions:\n1. Analyze if this is a vehicle issue.\n2. Provide response in RAW JSON:\n{\n  "issue": "Specific Problem Name",\n  "dangerLevel": "LOW/MEDIUM/CRITICAL",\n  "details": "WhatsApp style Hinglish explanation",\n  "action": "Immediate Hinglish advice",\n  "estimatedCost": "₹X - ₹Y",\n  "confidence": 0-100\n}`;'
content = re.sub(old_prompt, new_prompt, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Upgrade Complete")
