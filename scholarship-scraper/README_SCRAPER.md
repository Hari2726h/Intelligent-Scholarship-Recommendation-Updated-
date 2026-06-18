# Scholarship Scraper - Setup and Usage Guide

## Overview
The scholarship scraper automatically collects scholarship data from various sources and inserts them into the database. It runs as a scheduled task and adds new scholarships daily.

## Features
- ✅ Scrapes from multiple scholarship portals (Demo mode)
- ✅ Automatic duplicate detection
- ✅ Database integration with scholarship portal backend
- ✅ Scheduled daily execution
- ✅ Comprehensive logging

## Prerequisites
1. Python 3.8 or higher
2. MySQL database (should be running)
3. Required Python packages

## Installation

### 1. Install Python Dependencies
```bash
cd scholarship-scraper
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Edit the `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Hari@2006
DB_NAME=scholarship_db
```

### 3. Verify Database Connection
Ensure your MySQL server is running and the `scholarship_db` database exists.

## Usage

### Run Scraper Once (Manual)
```bash
python scraper.py
```

### Run with Scheduler (Automated)
```bash
python scheduler.py
```

The scheduler will:
- Run immediately on startup
- Then run daily at 2:00 AM automatically
- Keep running in the background

## How It Works

### Database Schema
The scraper inserts scholarships with the following structure:
- `title` - Scholarship name
- `name` - Same as title
- `description` - Detailed description
- `min_cgpa` - Minimum CGPA requirement
- `max_income` - Maximum family income limit
- `category` - Scholarship category (GENERAL, SC, ST, OBC, MINORITY, EWS, etc.)
- `amount` - Scholarship amount
- `deadline` - Application deadline
- `application_deadline` - Same as deadline
- `application_start_date` - When applications open
- `award_count` - Number of scholarships available
- `provider` - Source of scholarship (BUDDY4STUDY, NSP, VIDYALAKSHMI, etc.)
- `is_active` - Always TRUE for new scholarships
- `is_deleted` - Always FALSE
- `created_at` - Timestamp

### Duplicate Detection
The scraper checks for duplicates based on:
- Title
- Amount
- Deadline

If a matching scholarship exists, it will be skipped.

## Demo Mode
By default, the scraper runs in **DEMO MODE** with static scholarship data. This is safe and doesn't require internet connections or web scraping.

Sample scholarships added:
1. National Merit Scholarship 2026 (₹1,00,000)
2. SC/ST Welfare Scholarship 2026 (₹75,000)
3. Girls Education Scholarship 2026 (₹80,000)
4. Merit-cum-Means Scholarship 2026 (₹90,000)
5. OBC Post Matric Scholarship 2026 (₹60,000)
6. Minority Scholarship Scheme 2026 (₹50,000)
7. Pre-Matric Scholarship for SC Students 2026 (₹45,000)
8. Central Sector Scholarship 2026 (₹1,20,000)
9. EWS Scholarship for Higher Studies 2026 (₹70,000)

## Logging
All scraper activity is logged to:
- Console output
- `scraper.log` file

## Troubleshooting

### Database Connection Error
```
Error: Database connection failed
```
**Solution:** 
- Verify MySQL is running
- Check credentials in `.env` file
- Ensure `scholarship_db` database exists

### No Scholarships Added
```
Scraping completed: 0/9 new scholarships added
```
**Possible causes:**
- Scholarships already exist in database (duplicates)
- Database insert permissions issue

**Solution:**
- Check logs for details
- Verify database table structure
- Clear old test data if needed

### Python Package Errors
```
ModuleNotFoundError: No module named 'mysql'
```
**Solution:**
```bash
pip install -r requirements.txt
```

## Integration with Backend

The scraped scholarships will automatically appear in:
- Admin Dashboard - Total scholarships count
- Student Dashboard - Available scholarships
- Eligible Scholarships page - Based on student profile
- All Scholarships listing

## Production Deployment

For production use:
1. Set up web scraping code (currently commented out)
2. Configure proper rate limiting
3. Add error handling and retry logic
4. Set up monitoring and alerts
5. Run as a system service

### Windows Service Setup
Use `nssm` (Non-Sucking Service Manager):
```bash
nssm install ScholarshipScraper "C:\Python\python.exe" "E:\path\to\scheduler.py"
nssm start ScholarshipScraper
```

### Linux Service Setup
Create systemd service file:
```bash
sudo nano /etc/systemd/system/scholarship-scraper.service
```

Content:
```ini
[Unit]
Description=Scholarship Scraper Service
After=network.target mysql.service

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/scholarship-scraper
ExecStart=/usr/bin/python3 scheduler.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable scholarship-scraper
sudo systemctl start scholarship-scraper
```

## Support
For issues or questions, check:
- `scraper.log` for detailed error messages
- Database connection and credentials
- Python version compatibility
