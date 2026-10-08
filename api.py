import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile
import io


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = "chilli_shield_resnet18_best.pth"

CLASSES = [
    "Bacterial_Spot",
    "Cercospora_Leaf_Spot",
    "Curl_Virus",
    "Healthy_Leaf",
    "Nutrition_Deficiency",
    "Powdery_Mildew"
]

IMAGE_SIZE = 224


# ============================================================
# DEVICE
# ============================================================

device = torch.device("cpu")


# ============================================================
# LOAD MODEL
# ============================================================

model = models.resnet18(weights=None)

model.fc = nn.Linear(
    model.fc.in_features,
    len(CLASSES)
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model.to(device)
model.eval()


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="CHILLI-SHIELD AI API",
    description="AI-assisted chilli leaf disease classification API",
    version="1.0"
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def home():
    return {
        "project": "CHILLI-SHIELD",
        "status": "AI model connected",
        "model": "ResNet18",
        "classes": CLASSES
    }


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    image_bytes = await file.read()

    image = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    image_tensor = transform(image)
    image_tensor = image_tensor.unsqueeze(0)
    image_tensor = image_tensor.to(device)

    with torch.no_grad():

        outputs = model(image_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )[0]

    confidence, predicted_index = torch.max(
        probabilities,
        dim=0
    )

    predicted_class = CLASSES[
        predicted_index.item()
    ]

    confidence_percentage = confidence.item() * 100

    probability_list = []

    for i, class_name in enumerate(CLASSES):

        probability_list.append({
            "classId": class_name.lower().replace("_", "-"),
            "label": class_name.replace("_", " "),
            "probability": round(
                probabilities[i].item(),
                4
            )
        })

        # ========================================================
    # RISK ASSESSMENT
    # ========================================================

    if predicted_class == "Healthy_Leaf":

        risk_level = "LOW"
        risk_score = 0

    elif confidence_percentage >= 90:

        risk_level = "HIGH"
        risk_score = round(confidence_percentage)

    elif confidence_percentage >= 70:

        risk_level = "MODERATE"
        risk_score = round(confidence_percentage)

    else:

        risk_level = "LOW"
        risk_score = round(confidence_percentage)
    return {
        "model": {
            "name": "ResNet18",
            "version": "2026-09-18",
            "provider": "CHILLI-SHIELD"
        },

        "probabilities": probability_list,

        "confidence": round(
            confidence_percentage / 100,
            4
        ),

        "risk": {
            "level": risk_level,
            "score": risk_score,
            "rationale": (
                f"The model classified the image as "
                f"{predicted_class} with "
                f"{confidence_percentage:.2f}% confidence."
            )
        },

        "explanation": (
            f"ResNet18 identified the most likely class as "
            f"{predicted_class}."
        ),

        "recommendedNextSteps": [
            "Inspect surrounding plants and leaf undersides",
            "Seek local agronomic confirmation before treating"
        ]
    }