import dash
from dash import dcc, html, Input, Output
import plotly.express as px
import pandas as pd

# Load the dataset
file_path = "combined_crime_data.csv"
df = pd.read_csv(file_path)

# Convert dispatch_date to datetime format
df["dispatch_date"] = pd.to_datetime(df["dispatch_date"])

# List of columns where you want to remove nulls (excluding 'hour')
columns_with_nulls = ['the_geom', 'the_geom_webmercator', 'point_x', 'point_y', 'lat', 'lng']

# Drop rows where any of the specified columns have null values
df = df.dropna(subset=columns_with_nulls)

# Attempt to convert dispatch_time to datetime format and safely extract the hour
try:
    df['dispatch_time'] = pd.to_datetime(df['dispatch_time'], format='%H:%M:%S', errors='coerce')
    df['hour'] = df['dispatch_time'].dt.hour  # Extracting hour for easier filtering
except Exception as e:
    print(f"Error converting time: {e}")

# If 'hour' has NaNs due to conversion issues, handle or fill them
df['hour'] = df['hour'].fillna(-1)  # Example handling strategy, replace with appropriate method

unique_crimes = df["text_general_code"].unique()

severity_mapping = {}

for crime in unique_crimes:
    if "Homicide" in crime:
        severity_mapping[crime] = 10
    elif "Rape" in crime:
        severity_mapping[crime] = 9
    elif "Aggravated Assault" in crime:
        severity_mapping[crime] = 8 if "Firearm" in crime else 7
    elif "Robbery" in crime:
        severity_mapping[crime] = 7 if "Firearm" in crime else 6
    elif "Burglary" in crime:
        severity_mapping[crime] = 6 if "Residential" in crime else 5
    elif "Other Assaults" in crime:
        severity_mapping[crime] = 5  # Moderate severity for non-aggravated assaults
    elif "Theft" in crime:
        severity_mapping[crime] = 4
    elif "Fraud" in crime or "Vandalism" in crime:
        severity_mapping[crime] = 3
    elif "Drug" in crime or "Disorderly Conduct" in crime:
        severity_mapping[crime] = 2
    elif "Public Intoxication" in crime:
        severity_mapping[crime] = 1
    else:
        severity_mapping[crime] = 3  # Assign a neutral severity for unclassified crimes

# Apply severity mapping and print debug info
df["crime_severity"] = df["text_general_code"].map(severity_mapping)
df["crime_severity"].fillna(3, inplace=True)  # Default unknown crimes to 3

# Debugging: Print the first few rows to check if crime_severity exists
print(df[["text_general_code", "crime_severity"]].head())

# Define Dash app
app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1("Crime Severity Map"),
    
    # Date range picker
    dcc.DatePickerRange(
        id='date-picker',
        start_date=df["dispatch_date"].min(),
        end_date=df["dispatch_date"].max(),
        display_format='YYYY-MM-DD'
    ),
    
    # Time range slider
    dcc.RangeSlider(
        id='time-slider',
        min=0,
        max=24,
        step=1,
        marks={i: f"{i}:00" for i in range(0, 25, 3)},
        value=[0, 24]
    ),
    
    # Map
    dcc.Graph(id='crime-map')
])

@app.callback(
    Output('crime-map', 'figure'),
    [Input('date-picker', 'start_date'),
     Input('date-picker', 'end_date'),
     Input('time-slider', 'value')]
)
def update_map(start_date, end_date, time_range):
    start_time, end_time = time_range
    
    # Filter data based on selections
    filtered_data = df[
        (df["dispatch_date"] >= pd.to_datetime(start_date)) &
        (df["dispatch_date"] <= pd.to_datetime(end_date)) &
        (df["dispatch_time"].apply(lambda t: t.hour) >= start_time) &
        (df["dispatch_time"].apply(lambda t: t.hour) <= end_time)
    ]

    # Debugging: Print first few rows of filtered data
    print(filtered_data.head())

    # Ensure crime_severity exists before plotting
    if "crime_severity" not in filtered_data.columns:
        raise ValueError("crime_severity column is missing!")

    # Create scatter plot map
    fig = px.scatter_mapbox(
        filtered_data,
        lat="lat",
        lon="lng",
        hover_name="location_block",
        hover_data=["text_general_code", "dispatch_date", "dispatch_time", "crime_severity"],
        color="crime_severity",
        color_continuous_scale="Reds",
        zoom=10,
        height=600
    )
    
    fig.update_layout(mapbox_style="open-street-map")
    return fig

if __name__ == '__main__':
    app.run_server(debug=True)

# based on location

