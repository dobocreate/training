import json
import random

path = "data/duty.json"

with open(path, "r") as f:
    data = json.load(f)

members = data.get("members", [])
profiles = data.get("profiles", {})

all_icons = [
    "bear", "cat", "dog", "rabbit", "owl",
    "fox", "panda", "koala", "lion", "tiger",
    "pig", "frog", "monkey", "mouse", "elephant",
    "penguin", "giraffe", "hippo", "zebra"
]

# Shuffle icons
shuffled_icons = all_icons.copy()
random.shuffle(shuffled_icons)

# Assign uniquely
for i, member in enumerate(members):
    if i < len(shuffled_icons):
        if member not in profiles:
            profiles[member] = {}
        profiles[member]["icon"] = shuffled_icons[i]
        print(f"Assigned {shuffled_icons[i]} to {member}")

data["profiles"] = profiles

with open(path, "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Redistribution complete.")
