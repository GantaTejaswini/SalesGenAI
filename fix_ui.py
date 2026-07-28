import os

dirs = ['frontend/src/pages', 'frontend/src/components', 'frontend/src']

for d in dirs:
    if not os.path.exists(d): continue
    for f in os.listdir(d):
        if not f.endswith('.ts'): continue
        path = os.path.join(d, f)
        
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
            
        new_content = content.replace('\\`', '`').replace('\\$', '$').replace('\\\\n', '\\n')
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Fixed {path}")
