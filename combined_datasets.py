import pandas as pd

# Load the datasets
data_2023 = pd.read_csv('crime_2023.csv')
data_2024 = pd.read_csv('crime_2024.csv')
data_2025 = pd.read_csv('crime_2025.csv')

# Combine the datasets
combined_data = pd.concat([data_2023, data_2024, data_2025], ignore_index=True)

# Save the combined dataset to a new CSV file
combined_data.to_csv('combined_crime_data_draft.csv', index=False)

# Download link for the combined dataset
download_link = 'combined_crime_data_draft.csv'

print(f'Download your combined dataset here: {download_link}')
