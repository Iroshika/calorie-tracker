# Health Calorie Tracker

A simple web application to calculate your daily calorie requirements based on your health metrics and fitness goals.

## How to View the Website

### Option 1: Open Directly in Browser (Easiest)

1. Navigate to the project folder in Finder (Mac) or File Explorer (Windows)
2. Double-click on `index.html`
3. The website will open in your default web browser

### Option 2: Using a Local Server (Recommended)

#### Using Python (if installed):

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to the project folder:
   ```bash
   cd "/Users/nadee/Documents/Jan 1"
   ```
3. Start a simple HTTP server:
   - **Python 3:**
     ```bash
     python3 -m http.server 8000
     ```
   - **Python 2:**
     ```bash
     python -m SimpleHTTPServer 8000
     ```
4. Open your browser and go to:
   ```
   http://localhost:8000
   ```

#### Using Node.js (if installed):

1. Install a simple server globally:
   ```bash
   npm install -g http-server
   ```
2. Navigate to the project folder:
   ```bash
   cd "/Users/nadee/Documents/Jan 1"
   ```
3. Start the server:
   ```bash
   http-server
   ```
4. Open the URL shown in the terminal (usually `http://localhost:8080`)

## Features

- Calculate daily calorie requirements using the Mifflin-St Jeor equation
- Account for exercise frequency, duration, and type
- Calculate time to reach target weight
- Save your data automatically in browser storage
- Simple, intuitive interface

## Usage

1. Fill in all the required fields:
   - Personal information (age, gender, height, current/target weight)
   - Exercise details (frequency, time, type)
2. Click "Calculate Calories"
3. View your personalized daily calorie requirement and progress timeline

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and layout
- `app.js` - Calculation logic and form handling
- `README.md` - This file

