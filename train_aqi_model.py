import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, TimeSeriesSplit
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.linear_model import LinearRegression
import warnings
warnings.filterwarnings('ignore')

class PollutionForecastingModel:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.label_encoders = {}
        self.feature_columns = []
        self.target_columns = ['PM2.5', 'PM10', 'NO2', 'SO2']
        
    def load_and_prepare_data(self, csv_path, weather_data_path=None):
        """Load and prepare air quality data with optional weather integration"""
        try:
            # Load main air quality data
            df = pd.read_csv(csv_path)
            print(f"Loaded {len(df)} records from {csv_path}")
            
            # Convert date column to datetime
            if 'Date' in df.columns:
                df['Date'] = pd.to_datetime(df['Date'])
            else:
                # Create a date column if it doesn't exist
                df['Date'] = pd.date_range(start='2019-01-01', periods=len(df), freq='D')
            
            # Sort by date
            df = df.sort_values('Date')
            
            # Handle missing values for pollutant columns
            pollutant_columns = ['SO2_min', 'SO2_max', 'SO2_avg', 'NO2', 'PM10', 'PM2.5']
            for col in pollutant_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
            
            # Fill missing values with forward fill then backward fill
            df[pollutant_columns] = df[pollutant_columns].fillna(method='ffill').fillna(method='bfill')
            
            # Handle categorical columns
            categorical_columns = ['State', 'City', 'Location']
            for col in categorical_columns:
                if col in df.columns:
                    df[col] = df[col].fillna('Unknown')
            
            # Add weather data if available
            if weather_data_path:
                weather_df = self.load_weather_data(weather_data_path)
                df = self.merge_weather_data(df, weather_df)
            else:
                # Generate synthetic weather data for demonstration
                df = self.generate_synthetic_weather(df)
            
            return df
            
        except FileNotFoundError:
            print(f"Error: {csv_path} not found.")
            return None
    
    def load_weather_data(self, weather_path):
        """Load weather data from CSV file"""
        try:
            weather_df = pd.read_csv(weather_path)
            weather_df['Date'] = pd.to_datetime(weather_df['Date'])
            return weather_df
        except FileNotFoundError:
            print(f"Weather data file {weather_path} not found. Generating synthetic data.")
            return None
    
    def generate_synthetic_weather(self, df):
        """Generate synthetic weather data for demonstration"""
        np.random.seed(42)
        
        # Add seasonal temperature pattern
        df['day_of_year'] = df['Date'].dt.dayofyear
        df['temperature'] = 20 + 10 * np.sin(2 * np.pi * df['day_of_year'] / 365) + np.random.normal(0, 3, len(df))
        
        # Add humidity with some correlation to temperature
        df['humidity'] = 60 + 20 * np.sin(2 * np.pi * df['day_of_year'] / 365 + np.pi/4) + np.random.normal(0, 10, len(df))
        df['humidity'] = np.clip(df['humidity'], 20, 90)
        
        # Add wind speed
        df['wind_speed'] = 8 + 5 * np.sin(2 * np.pi * df['day_of_year'] / 365 + np.pi/2) + np.random.exponential(3, len(df))
        df['wind_speed'] = np.clip(df['wind_speed'], 0, 25)
        
        # Add precipitation (0 for most days, random amounts for rainy days)
        df['precipitation'] = np.where(np.random.random(len(df)) < 0.15, 
                                     np.random.exponential(10), 0)
        
        # Add atmospheric pressure
        df['pressure'] = 1013 + 10 * np.sin(2 * np.pi * df['day_of_year'] / 365) + np.random.normal(0, 5, len(df))
        
        return df
    
    def merge_weather_data(self, df, weather_df):
        """Merge weather data with air quality data"""
        if weather_df is not None:
            return pd.merge(df, weather_df, on='Date', how='left')
        return df
    
    def create_time_features(self, df):
        """Create time-based features for better forecasting"""
        df = df.copy()
        
        # Extract time features
        df['year'] = df['Date'].dt.year
        df['month'] = df['Date'].dt.month
        df['day'] = df['Date'].dt.day
        df['day_of_week'] = df['Date'].dt.dayofweek
        df['day_of_year'] = df['Date'].dt.dayofyear
        df['week_of_year'] = df['Date'].dt.isocalendar().week
        
        # Create cyclical features
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
        df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
        df['hour_sin'] = np.sin(2 * np.pi * df['day_of_year'] / 365)
        df['hour_cos'] = np.cos(2 * np.pi * df['day_of_year'] / 365)
        
        # Add seasonal indicators
        df['is_winter'] = df['month'].isin([12, 1, 2]).astype(int)
        df['is_monsoon'] = df['month'].isin([6, 7, 8, 9]).astype(int)
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        
        return df
    
    def create_lagged_features(self, df, target_col, lags=[1, 2, 3, 7, 14]):
        """Create lagged features for time series forecasting"""
        df = df.copy()
        
        for lag in lags:
            df[f'{target_col}_lag_{lag}'] = df[target_col].shift(lag)
        
        # Create rolling window features
        for window in [3, 7, 14]:
            df[f'{target_col}_rolling_mean_{window}'] = df[target_col].rolling(window).mean()
            df[f'{target_col}_rolling_std_{window}'] = df[target_col].rolling(window).std()
            df[f'{target_col}_rolling_max_{window}'] = df[target_col].rolling(window).max()
            df[f'{target_col}_rolling_min_{window}'] = df[target_col].rolling(window).min()
        
        return df
    
    def prepare_features(self, df):
        """Prepare all features for training"""
        # Create time-based features
        df = self.create_time_features(df)
        
        # Create lagged features for each target variable
        for target in self.target_columns:
            if target in df.columns:
                df = self.create_lagged_features(df, target)
        
        # Encode categorical variables
        categorical_columns = ['State', 'City', 'Location']
        for col in categorical_columns:
            if col in df.columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                self.label_encoders[col] = le
        
        # Select feature columns
        feature_columns = [
            'year', 'month', 'day', 'day_of_week', 'day_of_year', 'week_of_year',
            'month_sin', 'month_cos', 'day_sin', 'day_cos', 'hour_sin', 'hour_cos',
            'is_winter', 'is_monsoon', 'is_weekend'
        ]
        
        # Add weather features if available
        weather_features = ['temperature', 'humidity', 'wind_speed', 'precipitation', 'pressure']
        for feature in weather_features:
            if feature in df.columns:
                feature_columns.append(feature)
        
        # Add categorical features
        for col in categorical_columns:
            if col in df.columns:
                feature_columns.append(col)
        
        # Add lagged features
        for target in self.target_columns:
            if target in df.columns:
                for lag in [1, 2, 3, 7, 14]:
                    if f'{target}_lag_{lag}' in df.columns:
                        feature_columns.append(f'{target}_lag_{lag}')
                
                for window in [3, 7, 14]:
                    for stat in ['mean', 'std', 'max', 'min']:
                        if f'{target}_rolling_{stat}_{window}' in df.columns:
                            feature_columns.append(f'{target}_rolling_{stat}_{window}')
        
        # Add other pollutant columns as features
        if 'SO2_avg' in df.columns:
            feature_columns.append('SO2_avg')
        
        self.feature_columns = feature_columns
        return df
    
    def train_models(self, df):
        """Train forecasting models for each pollutant"""
        print("Training forecasting models...")
        
        # Prepare features
        df = self.prepare_features(df)
        
        # Remove rows with NaN values (due to lagged features)
        df = df.dropna()
        
        print(f"Training data shape after preprocessing: {df.shape}")
        print(f"Feature columns: {len(self.feature_columns)}")
        
        # Train a model for each target variable
        results = {}
        
        for target in self.target_columns:
            if target not in df.columns:
                print(f"Warning: {target} not found in data, skipping...")
                continue
            
            print(f"\nTraining model for {target}...")
            
            # Prepare data
            X = df[self.feature_columns]
            y = df[target]
            
            # Scale features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            self.scalers[target] = scaler
            
            # Time series split for validation
            tscv = TimeSeriesSplit(n_splits=3)
            
            # Train multiple models and select the best
            models = {
                'RandomForest': RandomForestRegressor(n_estimators=100, random_state=42),
                'GradientBoosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
                'LinearRegression': LinearRegression()
            }
            
            best_model = None
            best_score = float('inf')
            model_results = {}
            
            for name, model in models.items():
                scores = []
                
                for train_idx, val_idx in tscv.split(X_scaled):
                    X_train, X_val = X_scaled[train_idx], X_scaled[val_idx]
                    y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
                    
                    model.fit(X_train, y_train)
                    y_pred = model.predict(X_val)
                    score = mean_squared_error(y_val, y_pred)
                    scores.append(score)
                
                avg_score = np.mean(scores)
                model_results[name] = avg_score
                
                if avg_score < best_score:
                    best_score = avg_score
                    best_model = model
            
            # Train the best model on all data
            best_model.fit(X_scaled, y)
            self.models[target] = best_model
            
            # Final evaluation
            y_pred = best_model.predict(X_scaled)
            mse = mean_squared_error(y, y_pred)
            mae = mean_absolute_error(y, y_pred)
            r2 = r2_score(y, y_pred)
            
            results[target] = {
                'model_type': type(best_model).__name__,
                'mse': mse,
                'mae': mae,
                'r2': r2,
                'cross_val_results': model_results
            }
            
            print(f"Best model for {target}: {type(best_model).__name__}")
            print(f"MSE: {mse:.2f}, MAE: {mae:.2f}, R²: {r2:.3f}")
        
        return results
    
    def forecast_next_days(self, df, days=3):
        """Generate forecasts for the next N days"""
        print(f"\nGenerating {days}-day forecast...")
        
        # Prepare the data
        df = self.prepare_features(df)
        df = df.dropna()
        
        # Get the last row for initialization
        last_row = df.iloc[-1:].copy()
        
        forecasts = []
        
        for day in range(1, days + 1):
            forecast_row = last_row.copy()
            
            # Update date features
            next_date = pd.to_datetime(last_row['Date'].iloc[0]) + pd.Timedelta(days=day)
            forecast_row['Date'] = next_date
            forecast_row['year'] = next_date.year
            forecast_row['month'] = next_date.month
            forecast_row['day'] = next_date.day
            forecast_row['day_of_week'] = next_date.dayofweek
            forecast_row['day_of_year'] = next_date.dayofyear
            forecast_row['week_of_year'] = next_date.isocalendar().week
            
            # Update cyclical features
            forecast_row['month_sin'] = np.sin(2 * np.pi * next_date.month / 12)
            forecast_row['month_cos'] = np.cos(2 * np.pi * next_date.month / 12)
            forecast_row['day_sin'] = np.sin(2 * np.pi * next_date.dayofweek / 7)
            forecast_row['day_cos'] = np.cos(2 * np.pi * next_date.dayofweek / 7)
            forecast_row['hour_sin'] = np.sin(2 * np.pi * next_date.dayofyear / 365)
            forecast_row['hour_cos'] = np.cos(2 * np.pi * next_date.dayofyear / 365)
            
            # Update seasonal indicators
            forecast_row['is_winter'] = int(next_date.month in [12, 1, 2])
            forecast_row['is_monsoon'] = int(next_date.month in [6, 7, 8, 9])
            forecast_row['is_weekend'] = int(next_date.dayofweek >= 5)
            
            # Generate weather forecast (you would replace this with actual weather API)
            forecast_row['temperature'] = self.predict_weather_feature(df, 'temperature', day)
            forecast_row['humidity'] = self.predict_weather_feature(df, 'humidity', day)
            forecast_row['wind_speed'] = self.predict_weather_feature(df, 'wind_speed', day)
            forecast_row['precipitation'] = self.predict_weather_feature(df, 'precipitation', day)
            forecast_row['pressure'] = self.predict_weather_feature(df, 'pressure', day)
            
            day_forecast = {'Date': next_date}
            
            # Predict each pollutant
            for target in self.target_columns:
                if target in self.models:
                    # Update lagged features (use previous predictions if available)
                    if day > 1:
                        # Use previous forecast values for lagged features
                        for lag in [1, 2, 3]:
                            if lag <= day - 1:
                                lag_col = f'{target}_lag_{lag}'
                                if lag_col in self.feature_columns:
                                    forecast_row[lag_col] = forecasts[day - 1 - lag][target]
                    
                    # Prepare features for prediction
                    X_forecast = forecast_row[self.feature_columns]
                    X_forecast_scaled = self.scalers[target].transform(X_forecast)
                    
                    # Make prediction
                    prediction = self.models[target].predict(X_forecast_scaled)[0]
                    day_forecast[target] = max(0, prediction)  # Ensure non-negative
                    
                    # Update the forecast row for next iteration
                    forecast_row[target] = prediction
            
            forecasts.append(day_forecast)
        
        return forecasts
    
    def predict_weather_feature(self, df, feature, days_ahead):
        """Simple weather prediction using moving average and seasonality"""
        if feature not in df.columns:
            return 0
        
        # Get recent values
        recent_values = df[feature].tail(7).values
        
        # Simple moving average with seasonal adjustment
        moving_avg = np.mean(recent_values)
        
        # Add some seasonal variation
        current_day = df['day_of_year'].iloc[-1]
        seasonal_factor = np.sin(2 * np.pi * (current_day + days_ahead) / 365)
        
        if feature == 'temperature':
            return moving_avg + seasonal_factor * 5
        elif feature == 'humidity':
            return np.clip(moving_avg + seasonal_factor * 10, 20, 90)
        elif feature == 'wind_speed':
            return max(0, moving_avg + seasonal_factor * 2)
        elif feature == 'precipitation':
            return max(0, moving_avg * 0.8)  # Slightly decrease precipitation
        elif feature == 'pressure':
            return moving_avg + seasonal_factor * 2
        
        return moving_avg
    
    def print_forecast_results(self, forecasts):
        """Print formatted forecast results"""
        print("\n" + "="*60)
        print("3-DAY POLLUTION FORECAST")
        print("="*60)
        
        for i, forecast in enumerate(forecasts, 1):
            print(f"\nDay {i}: {forecast['Date'].strftime('%Y-%m-%d (%A)')}")
            print("-" * 40)
            
            for pollutant in self.target_columns:
                if pollutant in forecast:
                    value = forecast[pollutant]
                    if pollutant in ['PM2.5', 'PM10']:
                        unit = 'μg/m³'
                        # Calculate AQI category
                        if pollutant == 'PM2.5':
                            if value <= 12: category = "Good"
                            elif value <= 35: category = "Moderate"
                            elif value <= 55: category = "Unhealthy for Sensitive"
                            elif value <= 150: category = "Unhealthy"
                            elif value <= 250: category = "Very Unhealthy"
                            else: category = "Hazardous"
                        else:  # PM10
                            if value <= 54: category = "Good"
                            elif value <= 154: category = "Moderate"
                            elif value <= 254: category = "Unhealthy for Sensitive"
                            elif value <= 354: category = "Unhealthy"
                            elif value <= 424: category = "Very Unhealthy"
                            else: category = "Hazardous"
                    else:
                        unit = 'μg/m³'
                        category = ""
                    
                    print(f"{pollutant:>6}: {value:6.1f} {unit} {category}")

def main():
    # Initialize the model
    model = PollutionForecastingModel()
    
    # Load and prepare data
    # Replace 'combined_air_quality_2019_2023.csv' with your actual file path
    df = model.load_and_prepare_data('combined_air_quality_2019_2023.csv')
    
    if df is None:
        print("Failed to load data. Please check the file path.")
        return
    
    print(f"Data loaded successfully: {df.shape}")
    print(f"Date range: {df['Date'].min()} to {df['Date'].max()}")
    
    # Train the models
    results = model.train_models(df)
    
    # Print training results
    print("\n" + "="*60)
    print("MODEL TRAINING RESULTS")
    print("="*60)
    
    for target, result in results.items():
        print(f"\n{target}:")
        print(f"  Model Type: {result['model_type']}")
        print(f"  MSE: {result['mse']:.2f}")
        print(f"  MAE: {result['mae']:.2f}")
        print(f"  R²: {result['r2']:.3f}")
        print(f"  Cross-validation results: {result['cross_val_results']}")
    
    # Generate forecasts
    forecasts = model.forecast_next_days(df, days=3)
    
    # Print forecast results
    model.print_forecast_results(forecasts)
    
    # Save forecasts to CSV
    forecast_df = pd.DataFrame(forecasts)
    forecast_df.to_csv('pollution_forecast_3_days.csv', index=False)
    print(f"\nForecast saved to 'pollution_forecast_3_days.csv'")
    
    print("\n" + "="*60)
    print("TRAINING COMPLETE")
    print("="*60)

if __name__ == "__main__":
    main()