# Project Summary
The Well Mind Web Application is a mental wellness platform designed to support users in tracking their mood, accessing AI-powered chat support, and exploring wellness resources. The application integrates a user-friendly interface with backend functionalities powered by Python Flask and MySQL, offering features such as mood tracking, user authentication, and crisis detection.

# Project Module Description
- **Frontend**: Built with HTML, CSS, and JavaScript, providing a responsive and modern user interface for mood tracking and AI chat.
- **Backend**: Developed using Python Flask, handling user authentication, mood entry management, and AI interactions.
- **Database**: MySQL is used for storing user data, mood entries, and chat sessions.
- **AI Mechanism**: Utilizes OpenAI's GPT model and TextBlob for sentiment analysis and providing mental health support.

# Directory Tree
```
html_template/
├── ai_chat.py                # AI mechanism for mental health support
├── app.py                    # Main Flask application
├── database.py               # MySQL database connection and models
├── index.html                # Main landing page
├── package.json              # Project dependencies and scripts
├── requirements.txt          # Python dependencies
├── script.js                 # Frontend JavaScript for interactions
├── style.css                 # Styles for the application
├── template_config.json      # Configuration for templates
└── todo.md                   # Project outline and structure
```

# File Description Inventory
- **ai_chat.py**: Contains the AI logic for mental health support, including sentiment analysis and crisis detection.
- **app.py**: The main application file that sets up routes, handles API requests, and manages user sessions.
- **database.py**: Manages database connections and setups, including creating necessary tables.
- **index.html**: The entry point of the application, providing the user interface.
- **package.json**: Defines project dependencies and scripts for building and running the application.
- **requirements.txt**: Lists Python packages required for the backend.
- **script.js**: Handles frontend logic, including mood tracking and chat functionalities.
- **style.css**: Contains styles for the application, ensuring a modern and responsive design.
- **template_config.json**: Configuration settings for templates used in the application.
- **todo.md**: Documentation outlining the project structure and key features.

# Technology Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python Flask
- **Database**: MySQL
- **AI**: OpenAI API, TextBlob for sentiment analysis

# Usage
1. **Install Dependencies**:
   - Run `pip install -r requirements.txt` to install Python dependencies.
   - Use `pnpm install` to install frontend dependencies from `package.json`.

2. **Set Up Database**:
   - Execute `python database.py` to create the MySQL database and tables.

3. **Run the Application**:
   - Start the Flask application with `python app.py`.

4. **Configure AI**:
   - Set your OpenAI API key in the environment variable `OPENAI_API_KEY` to enable AI features.
