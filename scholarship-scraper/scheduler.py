"""
Scholarship Scraper Scheduler
Runs the scraper daily at specified time
"""

import schedule
import time
import logging
from scraper import ScholarshipScraper
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def job():
    """Scheduled job to run scraper"""
    logger.info("⏰ Scheduled scraper job started")
    scraper = ScholarshipScraper()
    scraper.run_scraper()


# Schedule the scraper to run daily at 2:00 AM
schedule.every().day.at("02:00").do(job)

# For testing: Run every 5 minutes (uncomment for testing)
# schedule.every(5).minutes.do(job)

logger.info("🚀 Scholarship Scraper Scheduler started")
logger.info("⏱️  Schedule: Daily at 2:00 AM")
logger.info("Press Ctrl+C to stop")

# Run once immediately
job()

# Keep the scheduler running
while True:
    schedule.run_pending()
    time.sleep(60)  # Check every minute
