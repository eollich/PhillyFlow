
import dash
import dash_core_components as dcc
import dash_html_components as html
import plotly.express as px
import pandas as pd

# Load data
data = pd.read_csv("combined_crime_data.csv")

# Data cleaning based on notebook instructions
columns_with_nulls = ['the_geom', 'the_geom_webmercator', 'point_x', 'point_y', 'lat', 'lng']
data = data.dropna(subset=columns_with_nulls)

# Assuming 'dispatch_time' column exists and is formatted correctly
data['hour'] = pd.to_datetime(data['dispatch_time'], format='%H:%M:%S').dt.hour

# Create a histogram of crimes by hour using Plotly Express
fig = px.histogram(data, x='hour', nbins=24, title='Distribution of Crimes by Hour of Day')

# Set up the Dash app
app = dash.Dash(__name__)

app.layout = html.Div(children=[
    html.H1(children='Crime Data Analysis'),
    
    html.Div(children='''
        Interactive visualization of crime occurrences by hour of day.
    '''),
    
    dcc.Graph(
        id='hourly-crime-graph',
        figure=fig
    )
])

if __name__ == '__main__':
    app.run_server(debug=True)
