import mysql.connector
from mysql.connector import Error
import os

class DatabaseSetup:
    def __init__(self):
        self.connection = None
        self.db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': 'your-mysql-password'  # Change this to your MySQL password
        }
    
    def connect_to_mysql(self):
        """Connect to MySQL server (without specific database)"""
        try:
            self.connection = mysql.connector.connect(**self.db_config)
            print("Successfully connected to MySQL server")
            return True
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            return False
    
    def create_database(self):
        """Create the wellmind_db database"""
        try:
            cursor = self.connection.cursor()
            cursor.execute("CREATE DATABASE IF NOT EXISTS wellmind_db")
            cursor.execute("USE wellmind_db")
            print("Database 'wellmind_db' created/selected successfully")
            cursor.close()
            return True
        except Error as e:
            print(f"Error creating database: {e}")
            return False
    
    def create_tables(self):
        """Create all necessary tables for the Well Mind application"""
        try:
            cursor = self.connection.cursor()
            
            # Users table
            users_table = """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_username (username)
            )
            """
            
            # Mood entries table
            mood_entries_table = """
            CREATE TABLE IF NOT EXISTS mood_entries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                mood_score INT NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
                notes TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_timestamp (user_id, timestamp),
                INDEX idx_timestamp (timestamp)
            )
            """
            
            # Chat sessions table
            chat_sessions_table = """
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                message_type ENUM('user', 'bot') NOT NULL,
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sentiment VARCHAR(20) DEFAULT 'neutral',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_timestamp (user_id, timestamp),
                INDEX idx_timestamp (timestamp)
            )
            """
            
            # User preferences table
            user_preferences_table = """
            CREATE TABLE IF NOT EXISTS user_preferences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                notification_enabled BOOLEAN DEFAULT TRUE,
                reminder_time TIME DEFAULT '09:00:00',
                theme VARCHAR(20) DEFAULT 'light',
                language VARCHAR(10) DEFAULT 'en',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_prefs (user_id)
            )
            """
            
            # Wellness resources table
            wellness_resources_table = """
            CREATE TABLE IF NOT EXISTS wellness_resources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                category ENUM('meditation', 'exercise', 'articles', 'crisis') NOT NULL,
                content_url VARCHAR(500),
                content_text TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_category (category),
                INDEX idx_active (is_active)
            )
            """
            
            # User activity log table
            user_activity_table = """
            CREATE TABLE IF NOT EXISTS user_activity (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                activity_type VARCHAR(50) NOT NULL,
                activity_data JSON,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_activity (user_id, activity_type),
                INDEX idx_timestamp (timestamp)
            )
            """
            
            # Execute table creation queries
            tables = [
                ("users", users_table),
                ("mood_entries", mood_entries_table),
                ("chat_sessions", chat_sessions_table),
                ("user_preferences", user_preferences_table),
                ("wellness_resources", wellness_resources_table),
                ("user_activity", user_activity_table)
            ]
            
            for table_name, query in tables:
                cursor.execute(query)
                print(f"Table '{table_name}' created successfully")
            
            cursor.close()
            return True
            
        except Error as e:
            print(f"Error creating tables: {e}")
            return False
    
    def insert_sample_data(self):
        """Insert sample wellness resources and demo data"""
        try:
            cursor = self.connection.cursor()
            
            # Sample wellness resources
            wellness_resources = [
                ("5-Minute Breathing Exercise", "Quick breathing technique for immediate stress relief", "meditation", 
                 "https://example.com/breathing", "Focus on your breath. Inhale for 4 counts, hold for 4, exhale for 6."),
                
                ("Daily Mood Journaling", "Learn how to track and understand your emotions", "articles",
                 "https://example.com/journaling", "Writing about your feelings can help you process emotions and identify patterns."),
                
                ("10-Minute Morning Yoga", "Gentle yoga routine to start your day positively", "exercise",
                 "https://example.com/yoga", "Simple stretches and poses to energize your body and calm your mind."),
                
                ("Crisis Support Resources", "24/7 helplines and emergency contacts", "crisis",
                 "https://example.com/crisis", "National Suicide Prevention Lifeline: 988, Crisis Text Line: Text HOME to 741741"),
                
                ("Progressive Muscle Relaxation", "Technique to release physical tension and stress", "meditation",
                 "https://example.com/pmr", "Systematically tense and relax different muscle groups to achieve deep relaxation."),
                
                ("Mindful Walking Guide", "How to turn a simple walk into a mindfulness practice", "exercise",
                 "https://example.com/walking", "Pay attention to each step, your breathing, and your surroundings.")
            ]
            
            insert_resources_query = """
            INSERT INTO wellness_resources (title, description, category, content_url, content_text)
            VALUES (%s, %s, %s, %s, %s)
            """
            
            cursor.executemany(insert_resources_query, wellness_resources)
            
            # Create a demo user (optional)
            demo_user_query = """
            INSERT INTO users (username, email, password_hash) 
            VALUES ('demo_user', 'demo@wellmind.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3vV.')
            ON DUPLICATE KEY UPDATE username=username
            """
            cursor.execute(demo_user_query)
            
            self.connection.commit()
            print("Sample data inserted successfully")
            cursor.close()
            return True
            
        except Error as e:
            print(f"Error inserting sample data: {e}")
            return False
    
    def setup_database(self):
        """Complete database setup process"""
        print("Starting Well Mind database setup...")
        
        if not self.connect_to_mysql():
            return False
        
        if not self.create_database():
            return False
        
        if not self.create_tables():
            return False
        
        if not self.insert_sample_data():
            return False
        
        print("Database setup completed successfully!")
        return True
    
    def close_connection(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("MySQL connection closed")

def main():
    """Run database setup"""
    db_setup = DatabaseSetup()
    
    try:
        success = db_setup.setup_database()
        if success:
            print("\n✅ Well Mind database is ready!")
            print("You can now run the Flask application with: python app.py")
        else:
            print("\n❌ Database setup failed. Please check the error messages above.")
    
    except KeyboardInterrupt:
        print("\nSetup interrupted by user")
    
    finally:
        db_setup.close_connection()

if __name__ == "__main__":
    main()