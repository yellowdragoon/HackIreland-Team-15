import numpy as np 


def calculate_risk_score(user_id: str,breach_events:list, num_devices: int) -> float: 

    
    try: 
        if breach_events is not None: 
        
            # weights = {'term_violations':0.8,'suspicious_activity':2,'fraud':4.0,'default':5.0,'illegal_activity':8.0,'num_platforms':0.35,'num_devices':0.2}
            weights = {
                'term_violations': 0.1,      # Reduced from 0.2
                'suspicious_activity': 0.3,  # Reduced from 0.5
                'fraud': 0.6,               # Reduced from 1.0
                'default': 0.8,             # Reduced from 1.2
                'illegal_activity': 1.2,    # Reduced from 2.0
                'num_platforms': 0.05,      # Reduced from 0.1
                'num_devices': 0.02         # Reduced from 0.05
            }
                        
            platforms = len(list(set([event['company_id'] for event in breach_events])))
            num_term_violations = len([event['event_type'] for event in breach_events if event['event_type'] == 'violating terms'])
            num_fraud = len([event['event_type'] for event in breach_events if event['event_type'] == 'fraud'])
            num_default = len([event['event_type'] for event in breach_events if event['event_type'] == 'default'])
            num_suspicious_activity = len([event['event_type'] for event in breach_events if event['event_type'] == 'suspicious_activity'])
            num_illegal_activity = len([event['event_type'] for event in breach_events if event['event_type'] == 'illegal_activity'])

            total_score = 0 
            total_score += weights['num_platforms'] * np.log(1 + platforms)
            total_score += weights['num_devices'] * np.log(1+ num_devices)
            if num_term_violations is not None and num_term_violations != 0: 
                total_score += weights['term_violations'] * np.log(1 + num_term_violations)
            if num_fraud is not None and num_fraud != 0: 
                total_score += weights['fraud'] * np.log(1 + num_fraud)
            if num_default is not None and num_default != 0: 
                total_score += weights['default'] * np.log(1 + num_default)
            if num_suspicious_activity is not None and num_suspicious_activity != 0: 
                total_score += weights['suspicious_activity'] * np.log(1+num_suspicious_activity)
            if num_illegal_activity is not None and num_illegal_activity != 0: 
                total_score += weights['illegal_activity'] * np.log(1 + num_illegal_activity)

            transgression_percent = 1 / (1 + np.exp(-total_score))
            return transgression_percent 
            

    except: 
        pass 















