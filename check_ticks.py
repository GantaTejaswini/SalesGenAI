lines = open('frontend/src/components/layout.ts', encoding='utf-8').readlines()
count = 0
for i, line in enumerate(lines):
    ticks = line.count('`')
    count += ticks
    if ticks > 0:
        print(f"Line {i+1}: {ticks} backticks. Total: {count}")
