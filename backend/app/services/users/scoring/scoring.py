
import numpy as np
from app.utils.logger.logger import Logger


class ScoreLoggingService:

    @staticmethod
    def log_user_score(user_id:str,score:float):
        Logger.info(f'User {user_id} has a score of {score}')


def calculate_risk_score(user_id: str, breach_events: list, num_devices: int) -> float:
    """
    Calculate a risk score for a user based on their breach events and number of devices.
    Uses a weighted scoring system based on breach severity and frequency.
    
    Args:
        user_id: The ID of the user
        breach_events: List of breach events associated with the user
        num_devices: Number of devices associated with the user
    
    Returns:
        float: Risk score between 0 and 1
    """
    try:
        if not breach_events:
            return 0.5  # Default neutral score

        weights = {
            'LOW': 0.1,
            'MEDIUM': 0.3,
            'HIGH': 0.6,
            'CRITICAL': 1.2,
            'num_platforms': 0.05,
            'num_devices': 0.02
        }

        # Count unique platforms
        platforms = len(set(event.get('company_id', '') for event in breach_events))
        
        # Calculate severity scores
        severity_counts = {
            'LOW': 0,
            'MEDIUM': 0,
            'HIGH': 0,
            'CRITICAL': 0
        }
        
        for event in breach_events:
            severity = event.get('severity', 'LOW')
            if severity in severity_counts:
                severity_counts[severity] += 1

        # Calculate total score
        total_score = 0
        total_score += weights['num_platforms'] * np.log1p(platforms)
        total_score += weights['num_devices'] * np.log1p(num_devices)
        
        for severity, count in severity_counts.items():
            if count > 0:
                total_score += weights[severity] * np.log1p(count)

        # Convert to probability between 0 and 1
        risk_score = 1 / (1 + np.exp(-total_score))
        return float(risk_score)

    except Exception as e:
        Logger.error(f"Error calculating risk score for user {user_id}: {str(e)}")
        return 0.5  # Return neutral score on error















