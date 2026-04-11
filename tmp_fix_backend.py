import os

filepath = r'c:\Users\VISHANT PANWAR\OneDrive\Desktop\pro\website\backend\index.js'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Fix the function signature
    if 'function getSmartDiagnosis(userInput, signature) {' in line:
        new_lines.append('function getSmartDiagnosis(userInput, signature, peaks = []) {\n')
    # Fix the fallback call
    elif 'const diagnostic = getSmartDiagnosis(req.body.symptom || \'\', req.body.audioSignature);' in line:
        new_lines.append("        const diagnostic = getSmartDiagnosis(req.body.symptom || '', req.body.audioSignature, req.body.spectralPeaks);\n")
    else:
        new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Upgrade Step 2 Complete")
