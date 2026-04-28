import os
import re

def replace_in_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return False
    
    # Target all variations of Parkéé/Parkee/Park
    # But avoid replacing things like "parking" unless it's "Park City"
    replacements = [
        (r'PARKÉÉ CITY', 'PARXÉÉ CITY'),
        (r'Parkéé City', 'Parxéé City'),
        (r'Parkee City', 'Parxee City'),
        (r'Parké City', 'Parxéé City'), # Fix common typos like Parké
        (r'Park City', 'Parxéé City'),
        (r'Parkéé', 'Parxéé'),
        (r'Parkee', 'Parxee'),
    ]
    
    new_content = content
    for pattern, replacement in replacements:
        new_content = re.sub(pattern, replacement, new_content, flags=re.IGNORECASE)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    root_dir = r"c:\Users\VISHANT PANWAR\OneDrive\Desktop\pro\website"
    for root, dirs, files in os.walk(root_dir):
        if any(bad_dir in root for bad_dir in ['node_modules', '.git', '.next', 'dist']):
            continue
        
        for file in files:
            if file.endswith(('.jsx', '.js', '.html', '.css', '.json', '.txt', '.md')):
                file_path = os.path.join(root, file)
                if replace_in_file(file_path):
                    print(f"Updated: {file_path}")

if __name__ == "__main__":
    main()
