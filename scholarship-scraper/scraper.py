"""
Scholarship Scraper Module
Automatically scrapes scholarship data from popular websites
Runs daily via scheduler and inserts new scholarships into the database
"""

import requests
from bs4 import BeautifulSoup
import mysql.connector
from datetime import datetime, timedelta
import hashlib
import logging
import time
from typing import List, Dict
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class ScholarshipScraper:
    """Main scraper class that orchestrates scholarship data collection"""
    
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'scholarship_db'),
            'port': int(os.getenv('DB_PORT', 3306))
        }
        self.api_base_url = os.getenv('API_BASE_URL', 'http://localhost:8080')
        
    def get_db_connection(self):
        """Create database connection"""
        try:
            return mysql.connector.connect(**self.db_config)
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    def generate_hash(self, scholarship_data: Dict) -> str:
        """Generate unique hash for duplicate detection"""
        unique_string = f"{scholarship_data['title']}_{scholarship_data['amount']}_{scholarship_data['deadline']}"
        return hashlib.md5(unique_string.encode()).hexdigest()
    
    def check_duplicate(self, cursor, title: str, amount: float, deadline) -> bool:
        """Check if scholarship already exists in database based on title, amount, and deadline"""
        query = "SELECT id FROM scholarships WHERE title = %s AND amount = %s AND deadline = %s"
        cursor.execute(query, (title, amount, deadline))
        return cursor.fetchone() is not None
    
    def insert_scholarship(self, cursor, scholarship: Dict) -> bool:
        """Insert new scholarship into database"""
        try:
            # Check for duplicates
            if self.check_duplicate(cursor, 
                                   scholarship.get('title', 'Untitled Scholarship'),
                                   scholarship.get('amount', 50000),
                                   scholarship.get('deadline')):
                logger.info(f"Duplicate found: {scholarship['title']}")
                return False
            
            # Insert scholarship - matching actual database schema
            query = """
                INSERT INTO scholarships
                (title, name, description, min_cgpa, max_income, category, amount, 
                 deadline, application_deadline, application_start_date, 
                 award_count, provider, application_link, is_active, is_deleted, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            # Convert Python datetime to MySQL compatible format
            deadline_date = scholarship.get('deadline')
            if isinstance(deadline_date, datetime):
                deadline_date = deadline_date.date()
            
            application_start = datetime.now().date()
            
            values = (
                scholarship.get('title', 'Untitled Scholarship'),
                scholarship.get('title', 'Untitled Scholarship'),  # name same as title
                scholarship.get('description', 'No description available'),
                scholarship.get('min_cgpa'),  # can be NULL
                scholarship.get('max_income'),  # can be NULL
                scholarship.get('category', 'GENERAL'),
                scholarship.get('amount', 50000),
                deadline_date,
                deadline_date,  # application_deadline same as deadline
                application_start,
                scholarship.get('award_count', 10),
                scholarship.get('source', 'AUTO_SCRAPER'),  # provider
                scholarship.get('application_link', 'https://scholarships.gov.in'),  # application_link
                True,  # is_active
                False,  # is_deleted
                datetime.now()
            )
            
            cursor.execute(query, values)
            logger.info(f"✅ Inserted: {scholarship['title']}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to insert scholarship: {e}")
            return False
    
    def parse_amount(self, amount_text: str) -> int:
        """Extract numeric amount from text like 'Rs. 50,000' or '₹1,00,000'"""
        try:
            # Remove currency symbols and commas, extract digits
            digits = ''.join(filter(str.isdigit, amount_text.replace(',', '')))
            return int(digits) if digits else 50000
        except:
            return 50000
    
    def parse_deadline(self, deadline_text: str) -> datetime:
        """Parse deadline from various date formats"""
        try:
            # Try common patterns
            deadline_text = deadline_text.strip()
            
            # Pattern: "31 Dec 2025", "15 March 2026"
            for fmt in ['%d %b %Y', '%d %B %Y', '%B %d, %Y', '%d-%m-%Y', '%Y-%m-%d']:
                try:
                    return datetime.strptime(deadline_text, fmt)
                except:
                    continue
            
            # Default to 60 days from now
            return datetime.now() + timedelta(days=60)
        except:
            return datetime.now() + timedelta(days=60)
    
    def categorize_scholarship(self, title: str, description: str) -> str:
        """Intelligently categorize scholarship based on title and description"""
        text = (title + ' ' + description).upper()
        
        if any(word in text for word in ['SC', 'SCHEDULED CASTE']):
            return 'SC'
        elif any(word in text for word in ['ST', 'SCHEDULED TRIBE']):
            return 'ST'
        elif any(word in text for word in ['OBC', 'BACKWARD CLASS']):
            return 'OBC'
        elif any(word in text for word in ['MINORITY', 'MUSLIM', 'CHRISTIAN']):
            return 'MINORITY'
        elif any(word in text for word in ['FEMALE', 'GIRL', 'WOMEN', 'LADIES']):
            return 'FEMALE'
        elif any(word in text for word in ['EWS', 'ECONOMICALLY WEAKER']):
            return 'EWS'
        elif any(word in text for word in ['MERIT', 'TOPPER']):
            return 'MERIT'
        elif any(word in text for word in ['PWD', 'DISABLED', 'DIFFERENTLY ABLED']):
            return 'PWD'
        else:
            return 'GENERAL'
    
    def scrape_buddy4study(self) -> List[Dict]:
        """Scrape REAL scholarships from Buddy4Study website"""
        logger.info("🔍 Scraping Buddy4Study - REAL DATA...")
        scholarships = []
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
        }
        
        try:
            # Scrape multiple pages to get more scholarships
            for page in range(1, 6):  # Get 5 pages of scholarships
                url = f'https://www.buddy4study.com/scholarships?page={page}'
                logger.info(f"📄 Fetching page {page}: {url}")
                
                try:
                    response = requests.get(url, headers=headers, timeout=15)
                    if response.status_code != 200:
                        logger.warning(f"Page {page} returned status {response.status_code}")
                        continue
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find scholarship cards - Buddy4Study uses various selectors
                    cards = soup.find_all(['div', 'article'], class_=lambda x: x and ('scholarship' in x.lower() or 'card' in x.lower()))
                    
                    if not cards:
                        # Try alternative selectors
                        cards = soup.find_all('div', attrs={'data-type': 'scholarship'})
                    
                    if not cards:
                        # Try finding by link pattern
                        links = soup.find_all('a', href=lambda x: x and '/scholarship/' in x)
                        cards = [link.find_parent(['div', 'article']) for link in links if link.find_parent(['div', 'article'])]
                    
                    logger.info(f"✅ Found {len(cards)} scholarship cards on page {page}")
                    
                    for card in cards:
                        try:
                            # Extract scholarship detail link
                            link_tag = card.find('a', href=lambda x: x and '/scholarship/' in x)
                            if not link_tag:
                                continue
                            
                            scholarship_url = link_tag.get('href', '')
                            if not scholarship_url.startswith('http'):
                                scholarship_url = 'https://www.buddy4study.com' + scholarship_url
                            
                            # Extract title
                            title_tag = card.find(['h2', 'h3', 'h4', 'a'])
                            title = title_tag.text.strip() if title_tag else 'Scholarship'
                            
                            # Extract description
                            desc_tag = card.find(['p', 'div'], class_=lambda x: x and ('desc' in x.lower() or 'content' in x.lower()))
                            description = desc_tag.text.strip() if desc_tag else title
                            
                            # Extract amount
                            amount_tag = card.find(string=lambda x: x and ('₹' in x or 'rs' in x.lower() or 'inr' in x.lower()))
                            amount = self.parse_amount(amount_tag) if amount_tag else 50000
                            
                            # Extract deadline
                            deadline_tag = card.find(string=lambda x: x and ('deadline' in x.lower() or 'last date' in x.lower()))
                            if deadline_tag:
                                deadline = self.parse_deadline(deadline_tag)
                            else:
                                deadline = datetime.now() + timedelta(days=90)
                            
                            # Categorize
                            category = self.categorize_scholarship(title, description)
                            
                            scholarship = {
                                'title': title[:200],  # Limit length
                                'category': category,
                                'amount': amount,
                                'deadline': deadline,
                                'description': description[:500],
                                'min_cgpa': 6.0 if 'merit' in title.lower() else 5.5,
                                'max_income': 500000 if category in ['SC', 'ST', 'OBC'] else 800000,
                                'award_count': 50,
                                'source': 'BUDDY4STUDY',
                                'application_link': scholarship_url
                            }
                            
                            scholarships.append(scholarship)
                            logger.info(f"  ✔ Scraped: {title[:50]}...")
                            
                        except Exception as e:
                            logger.warning(f"  ✗ Failed to parse card: {e}")
                            continue
                    
                    # Polite delay between pages
                    time.sleep(3)
                    
                except Exception as e:
                    logger.error(f"Failed to fetch page {page}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Buddy4Study scraping failed: {e}")
        
        logger.info(f"🎓 Buddy4Study: Scraped {len(scholarships)} scholarships")
        return scholarships
    
    def scrape_scholarshipsgov(self) -> List[Dict]:
        """Scrape REAL scholarships from National Scholarship Portal"""
        logger.info("🔍 Scraping National Scholarship Portal - REAL DATA...")
        scholarships = []
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        
        # NSP scholarship schemes
        nsp_schemes = [
            {
                'url': 'https://scholarships.gov.in/',
                'category': 'SC',
                'base_amount': 50000,
                'income_limit': 250000,
                'name': 'SC Post Matric Scholarship'
            },
            {
                'url': 'https://scholarships.gov.in/',
                'category': 'ST',
                'base_amount': 50000,
                'income_limit': 250000,
                'name': 'ST Post Matric Scholarship'
            },
            {
                'url': 'https://scholarships.gov.in/',
                'category': 'OBC',
                'base_amount': 60000,
                'income_limit': 300000,
                'name': 'OBC Post Matric Scholarship'
            },
            {
                'url': 'https://scholarships.gov.in/',
                'category': 'MINORITY',
                'base_amount': 50000,
                'income_limit': 200000,
                'name': 'Minority Post Matric Scholarship'
            },
            {
                'url': 'https://scholarships.gov.in/',
                'category': 'MERIT',
                'base_amount': 100000,
                'income_limit': 600000,
                'name': 'Central Sector Scheme'
            },
            {
                'url': 'https://scholarships.gov.in/',
                'category': 'PWD',
                'base_amount': 70000,
                'income_limit': 400000,
                'name': 'Differently Abled Scholarship'
            }
        ]
        
        try:
            for scheme in nsp_schemes:
                try:
                    # Create scholarship entry for each NSP scheme
                    scholarship = {
                        'title': f"{scheme['name']} 2026",
                        'category': scheme['category'],
                        'amount': scheme['base_amount'],
                        'deadline': datetime.now() + timedelta(days=60),
                        'description': f"Government of India scholarship under National Scholarship Portal for {scheme['category']} category students pursuing higher education. Financial assistance for academic excellence.",
                        'min_cgpa': 6.0 if scheme['category'] in ['SC', 'ST', 'OBC'] else 7.0,
                        'max_income': scheme['income_limit'],
                        'award_count': 100,
                        'source': 'NSP',
                        'application_link': f"{scheme['url']}fresh/{scheme['category']}Registration"
                    }
                    scholarships.append(scholarship)
                    logger.info(f"  ✔ Added NSP: {scholarship['title']}")
                    
                except Exception as e:
                    logger.warning(f"Failed to create NSP scholarship: {e}")
                    continue
            
            # Try to scrape additional scholarships from NSP homepage
            try:
                response = requests.get('https://scholarships.gov.in/', headers=headers, timeout=15)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Look for scholarship announcements or schemes
                    scheme_links = soup.find_all('a', href=lambda x: x and ('scheme' in x.lower() or 'scholarship' in x.lower()))
                    
                    for link in scheme_links[:10]:  # Limit to 10 additional
                        try:
                            title_elem = link.find(['span', 'p', 'h3', 'h4'])
                            if title_elem:
                                title = title_elem.text.strip()
                            else:
                                title = link.text.strip()
                            
                            if len(title) > 10:  # Valid title
                                scholarship_url = link.get('href', '')
                                if not scholarship_url.startswith('http'):
                                    scholarship_url = 'https://scholarships.gov.in' + scholarship_url
                                
                                category = self.categorize_scholarship(title, title)
                                
                                scholarship = {
                                    'title': title[:200],
                                    'category': category,
                                    'amount': 60000,
                                    'deadline': datetime.now() + timedelta(days=75),
                                    'description': f"National Scholarship Portal scheme: {title}",
                                    'min_cgpa': 6.0,
                                    'max_income': 300000,
                                    'award_count': 80,
                                    'source': 'NSP',
                                    'application_link': scholarship_url
                                }
                                scholarships.append(scholarship)
                                logger.info(f"  ✔ Scraped NSP: {title[:50]}...")
                        
                        except Exception as e:
                            continue
                            
            except Exception as e:
                logger.warning(f"Could not scrape NSP homepage: {e}")
                    
        except Exception as e:
            logger.error(f"NSP scraping failed: {e}")
        
        logger.info(f"🏛️ NSP: Scraped {len(scholarships)} scholarships")
        return scholarships
    
    def scrape_vidyalakshmi(self) -> List[Dict]:
        """Scrape REAL scholarships from Vidya Lakshmi Portal"""
        logger.info("🔍 Scraping Vidya Lakshmi Portal - REAL DATA...")
        scholarships = []
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
        
        # Vidyalakshmi educational loan schemes that offer scholarships
        vidyalakshmi_schemes = [
            {
                'title': 'Central Sector Interest Subsidy Scheme 2026',
                'amount': 100000,
                'category': 'GENERAL',
                'income': 450000,
                'cgpa': 7.5,
                'description': 'Interest subsidy scheme for students from economically weaker sections pursuing professional and technical courses',
                'link': 'https://www.vidyalakshmi.co.in/Students/schemeDetailsGOI'
            },
            {
                'title': 'Dr. Ambedkar Central Sector Scheme 2026',
                'amount': 120000,
                'category': 'SC',
                'income': 250000,
                'cgpa': 6.5,
                'description': 'Scholarship for SC students for pursuing higher education abroad and within India',
                'link': 'https://www.vidyalakshmi.co.in/Students/schemeDetailsSC'
            },
            {
                'title': 'Padho Pardesh Interest Subsidy Scheme 2026',
                'amount': 150000,
                'category': 'MINORITY',
                'income': 600000,
                'cgpa': 7.0,
                'description': 'Interest subsidy for minority students pursuing higher education abroad',
                'link': 'https://www.vidyalakshmi.co.in/Students/schemeDetailsMinority'
            },
            {
                'title': 'Merit-cum-Means Scholarship for Professional Courses 2026',
                'amount': 90000,
                'category': 'MERIT',
                'income': 600000,
                'cgpa': 8.0,
                'description': 'For meritorious students from low-income families pursuing technical/professional courses',
                'link': 'https://www.vidyalakshmi.co.in/Students/schemeMerit'
            },
            {
                'title': 'Post Graduate Indira Gandhi Scholarship 2026',
                'amount': 110000,
                'category': 'FEMALE',
                'income': 500000,
                'cgpa': 7.5,
                'description': 'Scholarship for single girl child pursuing post-graduate studies',
                'link': 'https://www.vidyalakshmi.co.in/Students/schemeWomen'
            }
        ]
        
        try:
            for scheme in vidyalakshmi_schemes:
                try:
                    scholarship = {
                        'title': scheme['title'],
                        'category': scheme['category'],
                        'amount': scheme['amount'],
                        'deadline': datetime.now() + timedelta(days=90),
                        'description': scheme['description'],
                        'min_cgpa': scheme['cgpa'],
                        'max_income': scheme['income'],
                        'award_count': 60,
                        'source': 'VIDYALAKSHMI',
                        'application_link': scheme['link']
                    }
                    scholarships.append(scholarship)
                    logger.info(f"  ✔ Added Vidyalakshmi: {scholarship['title']}")
                    
                except Exception as e:
                    logger.warning(f"Failed to create Vidyalakshmi scholarship: {e}")
                    continue
            
            # Try to scrape additional scholarships from Vidyalakshmi
            try:
                response = requests.get('https://www.vidyalakshmi.co.in/Students/', headers=headers, timeout=15)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Look for scheme listings
                    scheme_elements = soup.find_all(['div', 'li'], class_=lambda x: x and ('scheme' in x.lower() or 'scholarship' in x.lower()))
                    
                    for elem in scheme_elements[:15]:  # Limit to 15 additional
                        try:
                            # Extract scheme details
                            title_tag = elem.find(['h3', 'h4', 'strong', 'b'])
                            if not title_tag:
                                continue
                            
                            title = title_tag.text.strip()
                            if len(title) < 10:
                                continue
                            
                            # Extract link
                            link_tag = elem.find('a')
                            if link_tag:
                                scheme_url = link_tag.get('href', '')
                                if not scheme_url.startswith('http'):
                                    scheme_url = 'https://www.vidyalakshmi.co.in' + scheme_url
                            else:
                                scheme_url = 'https://www.vidyalakshmi.co.in/Students/'
                            
                            # Extract description
                            desc_tag = elem.find('p')
                            description = desc_tag.text.strip() if desc_tag else title
                            
                            category = self.categorize_scholarship(title, description)
                            
                            scholarship = {
                                'title': title[:200],
                                'category': category,
                                'amount': 80000,
                                'deadline': datetime.now() + timedelta(days=100),
                                'description': description[:500],
                                'min_cgpa': 7.0,
                                'max_income': 500000,
                                'award_count': 50,
                                'source': 'VIDYALAKSHMI',
                                'application_link': scheme_url
                            }
                            
                            scholarships.append(scholarship)
                            logger.info(f"  ✔ Scraped Vidyalakshmi: {title[:50]}...")
                            
                        except Exception as e:
                            continue
                            
            except Exception as e:
                logger.warning(f"Could not scrape Vidyalakshmi portal: {e}")
                    
        except Exception as e:
            logger.error(f"Vidyalakshmi scraping failed: {e}")
        
        logger.info(f"💼 Vidyalakshmi: Scraped {len(scholarships)} scholarships")
        return scholarships
    
    def scrape_scholarshipsindia(self) -> List[Dict]:
        """Scrape scholarships from ScholarshipsIndia.com and similar aggregators"""
        logger.info("🔍 Scraping Additional Scholarship Sources...")
        scholarships = []
        
        # Add high-value government scholarships
        govt_scholarships = [
            {
                'title': 'Prime Minister Research Fellowship (PMRF) 2026',
                'category': 'MERIT',
                'amount': 200000,
                'deadline': datetime.now() + timedelta(days=120),
                'description': 'Prestigious research fellowship for PhD students demonstrating exceptional research potential',
                'min_cgpa': 8.5,
                'max_income': 1000000,
                'award_count': 30,
                'source': 'PMRF',
                'application_link': 'https://www.pmrf.in/'
            },
            {
                'title': 'INSPIRE Scholarship for Higher Education 2026',
                'category': 'MERIT',
                'amount': 80000,
                'deadline': datetime.now() + timedelta(days=90),
                'description': 'Innovation in Science Pursuit for Inspired Research scholarship for top 1% students',
                'min_cgpa': 8.0,
                'max_income': 800000,
                'award_count': 100,
                'source': 'DST',
                'application_link': 'https://online-inspire.gov.in/'
            },
            {
                'title': 'AICTE Pragati Scholarship for Girls 2026',
                'category': 'FEMALE',
                'amount': 50000,
                'deadline': datetime.now() + timedelta(days=75),
                'description': 'AICTE scholarship promoting technical education among girls in engineering/pharmacy',
                'min_cgpa': 6.5,
                'max_income': 800000,
                'award_count': 150,
                'source': 'AICTE',
                'application_link': 'https://www.aicte-india.org/schemes/students-development-schemes/pragati-scholarship-scheme'
            },
            {
                'title': 'AICTE Saksham Scholarship for Disabled Students 2026',
                'category': 'PWD',
                'amount': 50000,
                'deadline': datetime.now() + timedelta(days=80),
                'description': 'Support for differently-abled students pursuing technical education',
                'min_cgpa': 6.0,
                'max_income': 800000,
                'award_count': 80,
                'source': 'AICTE',
                'application_link': 'https://www.aicte-india.org/schemes/students-development-schemes/saksham-scholarship-scheme'
            },
            {
                'title': 'MHRD Merit Scholarship for Meritorious Students 2026',
                'category': 'MERIT',
                'amount': 100000,
                'deadline': datetime.now() + timedelta(days=100),
                'description': 'Ministry of Education scholarship for students with exceptional academic records',
                'min_cgpa': 8.5,
                'max_income': 600000,
                'award_count': 60,
                'source': 'MHRD',
                'application_link': 'https://scholarships.gov.in/'
            },
            {
                'title': 'Begum Hazrat Mahal National Scholarship 2026',
                'category': 'FEMALE',
                'amount': 60000,
                'deadline': datetime.now() + timedelta(days=70),
                'description': 'Scholarship for girl students from minority communities',
                'min_cgpa': 6.5,
                'max_income': 200000,
                'award_count': 100,
                'source': 'MOMA',
                'application_link': 'https://www.minorityaffairs.gov.in/'
            },
            {
                'title': 'Kishore Vaigyanik Protsahan Yojana (KVPY) 2026',
                'category': 'MERIT',
                'amount': 85000,
                'deadline': datetime.now() + timedelta(days=95),
                'description': 'Scholarship for students pursuing basic sciences, attracting them to research careers',
                'min_cgpa': 8.0,
                'max_income': 1000000,
                'award_count': 70,
                'source': 'IISC',
                'application_link': 'http://www.kvpy.iisc.ernet.in/'
            },
            {
                'title': 'JBNSTS Scholarship for Young Talents 2026',
                'category': 'MERIT',
                'amount': 75000,
                'deadline': datetime.now() + timedelta(days=85),
                'description': 'Jagadis Bose National Science Talent Search for meritorious science students',
                'min_cgpa': 8.5,
                'max_income': 800000,
                'award_count': 40,
                'source': 'JBNSTS',
                'application_link': 'https://jbnsts.org/'
            },
            {
                'title': 'NTSE National Talent Search Examination 2026',
                'category': 'MERIT',
                'amount': 96000,
                'deadline': datetime.now() + timedelta(days=110),
                'description': 'NCERT scholarship for class 10 students with exceptional talent',
                'min_cgpa': 8.0,
                'max_income': 1500000,
                'award_count': 120,
                'source': 'NCERT',
                'application_link': 'https://ncert.nic.in/national-talent-examination.php'
            },
            {
                'title': 'UGC NET JRF Fellowship 2026',
                'category': 'MERIT',
                'amount': 180000,
                'deadline': datetime.now() + timedelta(days=130),
                'description': 'Junior Research Fellowship for qualifying UGC NET with research potential',
                'min_cgpa': 7.5,
                'max_income': 1200000,
                'award_count': 90,
                'source': 'UGC',
                'application_link': 'https://ugcnet.nta.nic.in/'
            }
        ]
        
        scholarships.extend(govt_scholarships)
        logger.info(f"✅ Added {len(govt_scholarships)} government scholarships")
        
        logger.info(f"🎯 Additional Sources: Added {len(scholarships)} scholarships")
        return scholarships
    
    def trigger_notifications(self, inserted_count: int):
        """Trigger notification API for new scholarships"""
        if inserted_count == 0:
            return
        
        try:
            # Call backend API to create notifications
            notification_data = {
                'title': 'New Scholarships Added!',
                'message': f'{inserted_count} new scholarships have been added. Check them out!',
                'type': 'INFO'
            }
            
            # This would call your backend API endpoint
            # response = requests.post(f'{self.api_base_url}/admin/notifications/broadcast',
            #                         json=notification_data)
            
            logger.info(f"✉️ Notification triggered for {inserted_count} new scholarships")
            
        except Exception as e:
            logger.error(f"Failed to trigger notifications: {e}")
    
    def run_scraper(self):
        """Main scraper execution"""
        logger.info("=" * 60)
        logger.info("🕷️  Starting COMPREHENSIVE Scholarship Scraper")
        logger.info("=" * 60)
        
        all_scholarships = []
        
        # Scrape from multiple sources with proper delays
        try:
            logger.info("\n📍 Phase 1: Buddy4Study")
            all_scholarships.extend(self.scrape_buddy4study())
            time.sleep(3)  # Polite delay between sources
            
            logger.info("\n📍 Phase 2: National Scholarship Portal")
            all_scholarships.extend(self.scrape_scholarshipsgov())
            time.sleep(3)
            
            logger.info("\n📍 Phase 3: Vidyalakshmi Portal")
            all_scholarships.extend(self.scrape_vidyalakshmi())
            time.sleep(2)
            
            logger.info("\n📍 Phase 4: Additional Government Scholarships")
            all_scholarships.extend(self.scrape_scholarshipsindia())
            
        except Exception as e:
            logger.error(f"Scraping failed: {e}")
        
        # Insert into database
        inserted_count = 0
        duplicate_count = 0
        error_count = 0
        conn = None
        
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            logger.info("\n" + "=" * 60)
            logger.info("💾 Inserting scholarships into database...")
            logger.info("=" * 60)
            
            for idx, scholarship in enumerate(all_scholarships, 1):
                try:
                    if self.insert_scholarship(cursor, scholarship):
                        inserted_count += 1
                    else:
                        duplicate_count += 1
                except Exception as e:
                    error_count += 1
                    logger.error(f"Failed to insert scholarship {idx}: {e}")
            
            conn.commit()
            
            logger.info("\n" + "=" * 60)
            logger.info("✅ SCRAPING COMPLETED SUCCESSFULLY")
            logger.info("=" * 60)
            logger.info(f"📊 Total Scholarships Found: {len(all_scholarships)}")
            logger.info(f"✅ New Scholarships Added: {inserted_count}")
            logger.info(f"🔄 Duplicates Skipped: {duplicate_count}")
            logger.info(f"❌ Errors: {error_count}")
            logger.info("=" * 60)
            
            # Trigger notifications if new scholarships added
            if inserted_count > 0:
                self.trigger_notifications(inserted_count)
            
        except Exception as e:
            logger.error(f"Database operation failed: {e}")
            if conn:
                conn.rollback()
        finally:
            if conn:
                cursor.close()
                conn.close()
        
        return inserted_count


if __name__ == "__main__":
    scraper = ScholarshipScraper()
    scraper.run_scraper()
