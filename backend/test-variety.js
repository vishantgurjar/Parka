const CAR_DIAGNOSTIC_DB = [
    { keywords: ['belt', 'squeal', 'whistle', 'teekhi', 'rubber'], issue: "Worn Serpentine Belt", dangerLevel: "MEDIUM", details: "Aapki car ki main poly-belt (serpentine belt) ghis gayi hai ya dhili ho gayi hai.", action: "Bonnet khol kar belt ki tension check karo.", estimatedCost: "₹1,200 - ₹3,500" },
    { keywords: ['engine', 'knock', 'thud', 'bhari', ' আওয়াজ'], issue: "Engine Rod Knock", dangerLevel: "CRITICAL", details: "Engine ke andar se rod knocking ya bearing issue lag raha hai.", action: "Risk mat lo, gaadi turant side mein karke engine oil check karo.", estimatedCost: "₹15,000 - ₹60,000" },
    { keywords: ['brake', 'grind', 'ghisna', 'pahiya'], issue: "Worn Brake Pads", dangerLevel: "HIGH", details: "Brake pads poore ghis gaye hain aur metal-on-metal friction ho raha hai.", action: "Brake pads turant badalwao.", estimatedCost: "₹2,500 - ₹5,500" },
    { keywords: ['turbo', 'whistle', 'pick-up', 'power'], issue: "Turbocharger Issue", dangerLevel: "MEDIUM", details: "Turbo se whistling awaz aa rahi hai aur pickup kam hai.", action: "Turbo pipes aur internal blades check karwao.", estimatedCost: "₹8,000 - ₹25,000" },
];

function getSmartDiagnosis(userInput, signature) {
    const input = (userInput || '').toLowerCase().trim();
    let bestResult = null;
    let maxScore = 0;
    let candidates = [];

    CAR_DIAGNOSTIC_DB.forEach(item => {
        let score = 0;
        item.keywords.forEach(kw => {
            if (input.includes(kw)) score += 5;
        });
        
        if (signature === 'high' && item.keywords.some(k => ['belt', 'squeal', 'turbo', 'whistle'].includes(k))) score += 15;
        if (signature === 'low' && item.keywords.some(k => ['knock', 'thud', 'engine'].includes(k))) score += 15;
        if (signature === 'mid' && item.keywords.some(k => ['brake', 'grind'].includes(k))) score += 15;

        if (score > maxScore) {
            maxScore = score;
            candidates = [{ ...item }];
        } else if (score === maxScore && score > 0) {
            candidates.push({ ...item });
        }
    });

    if (candidates.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        bestResult = candidates[randomIndex];
    }
    return bestResult;
}

console.log("--- TESTING AI VARIETY ---");
for(let i=0; i<5; i++) {
    const res = getSmartDiagnosis("", "high");
    console.log(`Test ${i+1} (High Pitch): ${res ? res.issue : 'None'}`);
}
for(let i=0; i<5; i++) {
    const res = getSmartDiagnosis("", "mid");
    console.log(`Test ${i+1} (Mid Pitch): ${res ? res.issue : 'None'}`);
}
