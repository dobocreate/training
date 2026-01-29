import os

output_dir = "public/icons"
os.makedirs(output_dir, exist_ok=True)

animals = {
    "bear": {"color": "#a87132", "ears": "round", "face": "#e0ac69"},
    "cat": {"color": "#7c8ca1", "ears": "pointed", "face": "#ffffff"},
    "dog": {"color": "#bf8040", "ears": "floppy", "face": "#f2dcb3"},
    "rabbit": {"color": "#e6e6e6", "ears": "long", "face": "#ffffff"},
    "owl": {"color": "#8b6c5c", "ears": "tufted", "face": "#e8dcca"},
    "fox": {"color": "#d96c2c", "ears": "pointed", "face": "#ffffff"},
    "panda": {"color": "#333333", "ears": "round", "face": "#ffffff"},
    "koala": {"color": "#9baeb5", "ears": "big_round", "face": "#dbe4e6"},
    "lion": {"color": "#f2c035", "ears": "round", "face": "#f7e4b5", "mane": True},
    "tiger": {"color": "#ff9100", "ears": "round", "face": "#ffffff", "stripes": True},
    "pig": {"color": "#ffb6c1", "ears": "pointed", "face": "#ffe4e1"},
    "frog": {"color": "#7cbd42", "ears": "none", "face": "#ccedb6"},
    "monkey": {"color": "#8c6b5d", "ears": "round", "face": "#e6c2b0"},
    "mouse": {"color": "#a9a9a9", "ears": "big_round", "face": "#dcdcdc"},
    "elephant": {"color": "#9ca3af", "ears": "huge", "face": "#d1d5db"},
    "penguin": {"color": "#1f2937", "ears": "none", "face": "#ffffff"},
    "giraffe": {"color": "#fcd34d", "ears": "horns", "face": "#fef3c7"},
    "hippo": {"color": "#7c7c9c", "ears": "small_round", "face": "#a8a8c2"},
    "zebra": {"color": "#333333", "ears": "round", "face": "#ffffff", "stripes": True}
}

def create_svg(name, props):
    color = props["color"]
    face_color = props["face"]
    ears = props.get("ears", "round")
    
    # Base SVG
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="{color}" />'''

    # Ears/Features behind face
    if ears == "round":
        svg += f'''
  <circle cx="20" cy="25" r="12" fill="{color}" />
  <circle cx="80" cy="25" r="12" fill="{color}" />
  <circle cx="20" cy="25" r="6" fill="{face_color}" opacity="0.6" />
  <circle cx="80" cy="25" r="6" fill="{face_color}" opacity="0.6" />'''
    elif ears == "pointed":
        svg += f'''
  <path d="M15 40 L25 10 L45 30 Z" fill="{color}" />
  <path d="M85 40 L75 10 L55 30 Z" fill="{color}" />'''
    elif ears == "long":
        svg += f'''
  <ellipse cx="30" cy="20" rx="8" ry="25" fill="{color}" />
  <ellipse cx="70" cy="20" rx="8" ry="25" fill="{color}" />
  <ellipse cx="30" cy="20" rx="4" ry="18" fill="{face_color}" opacity="0.6" />
  <ellipse cx="70" cy="20" rx="4" ry="18" fill="{face_color}" opacity="0.6" />'''
    elif ears == "floppy":
        svg += f'''
  <ellipse cx="15" cy="45" rx="12" ry="20" fill="{color}" transform="rotate(-20 15 45)" />
  <ellipse cx="85" cy="45" rx="12" ry="20" fill="{color}" transform="rotate(20 85 45)" />'''
    elif ears == "big_round":
        svg += f'''
  <circle cx="15" cy="30" r="18" fill="{color}" />
  <circle cx="85" cy="30" r="18" fill="{color}" />
  <circle cx="15" cy="30" r="10" fill="white" opacity="0.8" />
  <circle cx="85" cy="30" r="10" fill="white" opacity="0.8" />'''
    elif ears == "huge":
        svg += f'''
  <circle cx="15" cy="40" r="25" fill="{color}" />
  <circle cx="85" cy="40" r="25" fill="{color}" />'''
    elif ears == "horns":
         svg += f'''
  <line x1="35" y1="30" x2="25" y2="10" stroke="{color}" stroke-width="5" stroke-linecap="round" />
  <circle cx="25" cy="10" r="5" fill="{props.get('color2', '#8b5e3c')}" />
  <line x1="65" y1="30" x2="75" y2="10" stroke="{color}" stroke-width="5" stroke-linecap="round" />
  <circle cx="75" cy="10" r="5" fill="{props.get('color2', '#8b5e3c')}" />'''
    
    # Mane for lion
    if props.get("mane"):
        svg += f'''<circle cx="50" cy="50" r="45" fill="#d97706" />
        <circle cx="50" cy="50" r="35" fill="{color}" />'''

    # Face Circle
    if name != "lion": # Lion already has face base
        svg += f'''<circle cx="50" cy="50" r="35" fill="{face_color}" />'''

    # Facial Features
    # Eyes
    svg += f'''
  <circle cx="35" cy="45" r="4" fill="#333" />
  <circle cx="65" cy="45" r="4" fill="#333" />'''
    
    # Nose/Mouth area
    if name == "pig":
        svg += f'''<ellipse cx="50" cy="60" rx="12" ry="8" fill="#ff69b4" />
        <circle cx="46" cy="60" r="2" fill="#333" />
        <circle cx="54" cy="60" r="2" fill="#333" />'''
    elif name == "elephant":
        svg += f'''<path d="M45 55 Q 50 90 40 95" stroke="{color}" stroke-width="8" fill="none" stroke-linecap="round" />'''
    else:
        svg += f'''<ellipse cx="50" cy="58" rx="6" ry="4" fill="#333" />
        <path d="M50 58 L50 65" stroke="#333" stroke-width="2" />
        <path d="M50 65 Q 40 70 35 65 M50 65 Q 60 70 65 65" stroke="#333" stroke-width="2" fill="none" />'''
        
    # Stripes for tiger/zebra
    if props.get("stripes"):
        svg += f'''<path d="M50 15 L45 25 L55 25 Z" fill="#333" />
        <path d="M20 50 L30 45 L30 55 Z" fill="#333" />
        <path d="M80 50 L70 45 L70 55 Z" fill="#333" />'''

    svg += "</svg>"
    
    with open(f"{output_dir}/{name}.svg", "w") as f:
        f.write(svg)
    print(f"Generated {name}.svg")

for name, props in animals.items():
    create_svg(name, props)
