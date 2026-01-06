# Health Calorie Tracker

A comprehensive web application to calculate your daily calorie requirements based on your health metrics and fitness goals. Features include personalized nutrition recommendations, weight progress tracking with interactive charts, and downloadable PDF reports.

## Features

- **Personalized Calorie Calculation**: Uses Mifflin-St Jeor equation for accurate BMR calculation
- **Unit Flexibility**: Support for both metric (cm/kg) and imperial (ft/in, lb) units
- **Exercise Tracking**: Multiple exercise types and frequency options
- **Nutrition Breakdown**: Detailed protein, carbs, fats, fiber, water, and sodium requirements
- **Progress Visualization**: Interactive line chart showing weight progression over time
- **PDF Reports**: Downloadable comprehensive health reports
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Live Demo

🌐 [View Live Website](https://iroshika.github.io/calorie-tracker)

## Technologies Used

- HTML5
- CSS3 (with modern gradients and animations)
- Vanilla JavaScript
- Chart.js (for data visualization)
- jsPDF (for PDF generation)

## How to Use

1. Enter your personal information (age, gender, height, weight)
2. Select your exercise frequency, duration, and type(s)
3. Set your current and target weight
4. Click "Calculate Calories" to see your personalized plan
5. View the progress chart and download a PDF report

## Installation

Simply clone this repository and open `index.html` in your browser, or use a local server:

```bash
git clone https://github.com/YOUR_USERNAME/health-calorie-tracker.git
cd health-calorie-tracker
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## License

This project is open source and available under the MIT License.

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

