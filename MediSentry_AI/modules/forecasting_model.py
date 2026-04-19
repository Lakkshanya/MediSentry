import torch
import torch.nn as nn
import numpy as np

class RiskLSTM(nn.Module):
    def __init__(self, input_size=1, hidden_size=50, output_size=1):
        super(RiskLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        # x shape: (batch, seq_len, features)
        out, _ = self.lstm(x)
        out = self.fc(out[:, -1, :]) # Last time step
        return out

class ForecastingModel:
    def __init__(self):
        self.model = RiskLSTM()
        # Architecture: LSTM for Time Series
    
    def predict_trend(self, department_id, historical_data):
        """
        Predicts future risk trend based on Historical Data.
        """
        if historical_data is None:
             return {"trend": "UNKNOWN (No Data)", "forecast_value": 0.0}
             
        # Convert List to Tensor
        try:
             # Expecting list of 30 floats
             input_seq = torch.FloatTensor(historical_data).view(1, -1, 1) # B, Seq, Feat
             
             with torch.no_grad():
                prediction = self.model(input_seq)
                
             val = prediction.item()
             if val > 0.5:
                return {"trend": "INCREASING", "forecast_value": val}
             else:
                return {"trend": "STABLE", "forecast_value": val}
        except Exception as e:
             return {"error": str(e)}
