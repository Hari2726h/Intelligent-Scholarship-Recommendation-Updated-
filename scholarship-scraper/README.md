# 🕷️ Scholarship Scraper Module

Automated scholarship data collection system that scrapes popular scholarship websites daily and populates the database with new opportunities.

## Features

✅ **Multi-Source Scraping**: Scrapes from Buddy4Study, NSP, Vidya Lakshmi  
✅ **Duplicate Detection**: Uses MD5 hash to prevent duplicate entries  
✅ **Scheduled Execution**: Runs daily at 2:00 AM automatically  
✅ **Database Integration**: Direct MySQL insertion  
✅ **Notification Trigger**: Alerts students when new scholarships are added  
✅ **Logging**: Comprehensive logs for monitoring  
✅ **Error Handling**: Robust exception handling

## Installation

### 1. Install Python Dependencies

```bash
cd scholarship-scraper
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Update Database Schema

Add `source_hash` column to the scholarship table:

```sql
ALTER TABLE scholarship 
ADD COLUMN source VARCHAR(50) DEFAULT 'MANUAL',
ADD COLUMN source_hash VARCHAR(32) UNIQUE,
ADD INDEX idx_source_hash (source_hash);
```

## Usage

### Run Once (Manual)

```bash
python scraper.py
```

### Run Scheduler (Daily at 2 AM)

```bash
python scheduler.py
```

### Run as Background Service (Linux)

```bash
nohup python scheduler.py &
```

### Run as Windows Service

Use Task Scheduler:
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 2:00 AM
4. Action: Start a program
5. Program: `python.exe`
6. Arguments: `scheduler.py`
7. Start in: `C:\path\to\scholarship-scraper`

## Database Schema

The scraper expects the following columns in the `scholarship` table:

```sql
CREATE TABLE scholarship (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    amount DECIMAL(15,2),
    deadline DATE,
    description TEXT,
    eligibility_criteria TEXT,
    required_cgpa DECIMAL(3,2),
    max_income DECIMAL(15,2),
    award_count INT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    source VARCHAR(50) DEFAULT 'MANUAL',
    source_hash VARCHAR(32) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_source_hash (source_hash)
);
```

## Architecture

```
┌─────────────────┐
│  Scheduler      │  Runs daily at 2 AM
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Scraper        │  Orchestrates data collection
└────────┬────────┘
         │
         ├─► Buddy4Study Scraper
         ├─► NSP Scraper
         └─► Vidya Lakshmi Scraper
                   │
                   ▼
         ┌─────────────────┐
         │ Duplicate Check │  MD5 hash comparison
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  MySQL Insert   │  Direct database insertion
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Notifications  │  Trigger API to notify students
         └─────────────────┘
```

## Customization

### Add New Scraping Source

```python
def scrape_your_source(self) -> List[Dict]:
    """Scrape from your new source"""
    scholarships = []
    
    try:
        response = requests.get('https://yourwebsite.com/scholarships')
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Parse scholarship data
        # ...
        
        scholarships.append({
            'title': title,
            'category': 'GENERAL',
            'amount': amount,
            'deadline': deadline,
            'description': description,
            'eligibility_criteria': criteria,
            'required_cgpa': 6.0,
            'max_income': 500000,
            'award_count': 10,
            'source': 'YOUR_SOURCE'
        })
    except Exception as e:
        logger.error(f"Scraping failed: {e}")
    
    return scholarships
```

Then add to `run_scraper()`:

```python
all_scholarships.extend(self.scrape_your_source())
```

### Change Schedule Time

In `scheduler.py`:

```python
# Run daily at 5:00 AM instead
schedule.every().day.at("05:00").do(job)

# Or run every 12 hours
schedule.every(12).hours.do(job)
```

## Security & Best Practices

⚠️ **Rate Limiting**: Add delays between requests to avoid being blocked  
⚠️ **User-Agent**: Use realistic User-Agent headers  
⚠️ **Robots.txt**: Respect robots.txt directives  
⚠️ **API Usage**: Prefer official APIs over web scraping when available  
⚠️ **Error Handling**: Don't crash the scraper on single failures

## Monitoring

### Check Logs

```bash
tail -f scraper.log
```

### Expected Log Output

```
2026-03-02 02:00:00 - INFO - ============================================================
2026-03-02 02:00:01 - INFO - 🕷️  Starting Scholarship Scraper
2026-03-02 02:00:01 - INFO - ============================================================
2026-03-02 02:00:02 - INFO - Scraping Buddy4Study...
2026-03-02 02:00:05 - INFO - ✅ Inserted: National Merit Scholarship 2026
2026-03-02 02:00:06 - INFO - Duplicate found: SC/ST Welfare Scholarship 2026
2026-03-02 02:00:10 - INFO - ============================================================
2026-03-02 02:00:10 - INFO - ✅ Scraping completed: 5/8 new scholarships added
2026-03-02 02:00:10 - INFO - ============================================================
2026-03-02 02:00:11 - INFO - ✉️ Notification triggered for 5 new scholarships
```

## Troubleshooting

### Database Connection Failed

- Verify MySQL is running
- Check `.env` credentials
- Ensure database exists

### No Scholarships Inserted

- Check if websites have changed structure
- Verify selectors in scraping code
- Check for duplicate entries

### Scheduler Not Running

- Ensure Python process is running
- Check system time
- Verify schedule syntax

## Production Deployment

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "scheduler.py"]
```

### Docker Compose

```yaml
scraper:
  build: ./scholarship-scraper
  environment:
    - DB_HOST=mysql
    - DB_USER=root
    - DB_PASSWORD=${DB_PASSWORD}
    - DB_NAME=scholarship_db
  depends_on:
    - mysql
  restart: unless-stopped
```

## Future Enhancements

- [ ] Machine learning to extract scholarship details
- [ ] API-based scraping for better reliability
- [ ] Webhook notifications
- [ ] OCR for PDF scholarships
- [ ] Categorization using NLP
- [ ] Sentiment analysis for eligibility matching
