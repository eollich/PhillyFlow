import pandas as pd

# Attempt to load the datasets to confirm their availability
try:
    data_2023 = pd.read_csv('//wsl.localhost/Ubuntu/home/nguyensteven/crime_2023.csv')
    data_2024 = pd.read_csv('//wsl.localhost/Ubuntu/home/nguyensteven/crime_2024.csv')
    data_2025 = pd.read_csv('//wsl.localhost/Ubuntu/home/nguyensteven/crime_2025.csv')
    files_loaded = "Files are loaded successfully."
except FileNotFoundError as e:
    files_loaded = str(e)

files_loaded

