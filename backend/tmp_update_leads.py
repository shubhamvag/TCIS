
import os
import sys
# Add current directory to path
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import Lead
from app.routers.scoring import compute_lead_score, get_weights_from_db

def main():
    db = SessionLocal()
    try:
        weights = get_weights_from_db(db)
        leads = db.query(Lead).all()
        
        # Calculate scores for all leads
        leads_with_scores = []
        for l in leads:
            score_data = compute_lead_score(l, weights)
            score = score_data[0] # The numeric score is the first element
            leads_with_scores.append((l, score))
        
        # Sort by score descending
        leads_with_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Set the top 3 leads to 'won' status so they are highly visible
        print("Updating top leads to 'won' status:")
        for i in range(min(3, len(leads_with_scores))):
            lead, score = leads_with_scores[i]
            lead.status = 'won'
            print(f"  - Rank {i+1}: {lead.company} (ID: {lead.id}, Score: {score:.1f})")
        
        db.commit()
        print("\nSuccess! Database updated.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
