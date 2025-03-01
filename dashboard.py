import dash
from dash import dcc, html, Input, Output
import plotly.express as px
import pandas as pd

# Load the dataset
file_path = "//wsl.localhost/Ubuntu/home/nguyensteven/PhillyFlow/crime_2025.csv"
df = pd.read_csv(file_path)

# Convert dispatch_date and dispatch_time to datetime format
df["dispatch_date"] = pd.to_datetime(df["dispatch_date"])
df["dispatch_time"] = pd.to_datetime(df["dispatch_time"], format="%H:%M:%S").dt.time

# Ensure crime_severity column exists
severity_mapping = {
    "Homicide": 10, "Rape": 9, "Aggravated Assault Firearm": 8,
    "Aggravated Assault No Firearm": 7, "Robbery Firearm": 7,
    "Robbery No Firearm": 6, "Burglary Residential": 6,
    "Burglary Non-Residential": 5, "Other Assaults": 5,
    "Theft": 4, "Fraud": 3, "Vandalism": 3,
    "Drug Violation": 2, "Disorderly Conduct": 2,
    "Public Intoxication": 1
}

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
