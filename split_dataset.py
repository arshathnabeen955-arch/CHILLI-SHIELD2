import os
import random
import shutil

SOURCE = r"Chilli Leaf Disease Image Dataset for Classificati\Chilli Leaf Disease Image Dataset for Classificati"
DESTINATION = "dataset"

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

classes = [
    "Bacterial_Spot",
    "Cercospora_Leaf_Spot",
    "Curl_Virus",
    "Healthy_Leaf",
    "Nutrition_Deficiency",
    "Powdery_Mildew"
]

# Create destination folders
for split in ["train", "val", "test"]:
    for class_name in classes:
        os.makedirs(
            os.path.join(DESTINATION, split, class_name),
            exist_ok=True
        )

# Process each class
for class_name in classes:

    source_folder = os.path.join(SOURCE, class_name)

    # Find images inside this class, including subfolders
    images = []

    for root, dirs, files in os.walk(source_folder):
        for file in files:
            if file.lower().endswith((".jpg", ".jpeg", ".png")):
                images.append(os.path.join(root, file))

    random.shuffle(images)

    total = len(images)

    train_end = int(total * TRAIN_RATIO)
    val_end = train_end + int(total * VAL_RATIO)

    train_images = images[:train_end]
    val_images = images[train_end:val_end]
    test_images = images[val_end:]

    # Copy training images
    for image in train_images:
        shutil.copy2(
            image,
            os.path.join(
                DESTINATION,
                "train",
                class_name,
                os.path.basename(image)
            )
        )

    # Copy validation images
    for image in val_images:
        shutil.copy2(
            image,
            os.path.join(
                DESTINATION,
                "val",
                class_name,
                os.path.basename(image)
            )
        )

    # Copy testing images
    for image in test_images:
        shutil.copy2(
            image,
            os.path.join(
                DESTINATION,
                "test",
                class_name,
                os.path.basename(image)
            )
        )

    print(
        f"{class_name}: "
        f"Total={total}, "
        f"Train={len(train_images)}, "
        f"Val={len(val_images)}, "
        f"Test={len(test_images)}"
    )

print("\nDataset splitting completed!")