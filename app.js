const form = document.getElementById('healthForm');
const resultsDiv = document.getElementById('results');
const clearBtn = document.getElementById('clearBtn');
let progressChart = null;
let currentFormData = null;
let currentResults = null;
let currentNutrition = null;

const heightCmGroup = document.getElementById('heightCmGroup');
const heightFtGroup = document.getElementById('heightFtGroup');
const heightInput = document.getElementById('height');
const heightFeetInput = document.getElementById('heightFeet');
const heightInchesInput = document.getElementById('heightInches');
const currentWeightUnit = document.getElementById('currentWeightUnit');
const targetWeightUnit = document.getElementById('targetWeightUnit');
const currentWeightInput = document.getElementById('currentWeight');
const targetWeightInput = document.getElementById('targetWeight');

const ACTIVITY_MULTIPLIERS = {
    none: 1.2,
    twice: 1.375,
    '3-5': 1.55,
    '7': 1.725
};

const EXERCISE_TIME_MULTIPLIERS = {
    '15': 0.05,
    '30': 0.1,
    '60': 0.15,
    '90': 0.2
};

const EXERCISE_TYPE_MULTIPLIERS = {
    home: 0.03,
    gym: 0.05,
    yoga: 0.02,
    walking: 0.04
};

function calculateBMR(age, gender, height, weight) {
    const baseBMR = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
}

function calculateActivityMultiplier(frequency, time, types) {
    let baseMultiplier = ACTIVITY_MULTIPLIERS[frequency] || 1.2;
    
    if (frequency !== 'none') {
        const timeMultiplier = EXERCISE_TIME_MULTIPLIERS[time] || 0;
        let typeMultiplier = 0;
        
        if (Array.isArray(types) && types.length > 0) {
            types.forEach(type => {
                typeMultiplier += EXERCISE_TYPE_MULTIPLIERS[type] || 0;
            });
            typeMultiplier = typeMultiplier / types.length;
        } else if (types) {
            typeMultiplier = EXERCISE_TYPE_MULTIPLIERS[types] || 0;
        }
        
        baseMultiplier += timeMultiplier + typeMultiplier;
    }
    
    return Math.min(baseMultiplier, 2.0);
}

function calculateCalories(bmr, activityMultiplier, currentWeight, targetWeight) {
    const tdee = bmr * activityMultiplier;
    
    const weightDifference = targetWeight - currentWeight;
    const weeksToGoal = Math.abs(weightDifference) / 0.75;
    
    let calorieAdjustment = 0;
    if (Math.abs(weightDifference) > 0.5) {
        const weeklyCalorieChange = (weightDifference * 7700) / weeksToGoal;
        calorieAdjustment = weeklyCalorieChange / 7;
    }
    
    const dailyCalories = tdee + calorieAdjustment;
    
    return {
        dailyCalories: Math.round(dailyCalories),
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        weeklyChange: weightDifference > 0 ? 
            `+${(calorieAdjustment * 7 / 7700 * 1000).toFixed(1)}g/week` : 
            `${(calorieAdjustment * 7 / 7700 * 1000).toFixed(1)}g/week`,
        timeToGoal: weeksToGoal > 0 ? 
            `${Math.ceil(weeksToGoal)} weeks` : 
            'Goal reached'
    };
}

function calculateNutrition(dailyCalories, currentWeightKg, exerciseFrequency) {
    const isActive = exerciseFrequency !== 'none';
    
    const proteinPerKg = isActive ? 1.6 : 0.8;
    const proteinGrams = Math.round(currentWeightKg * proteinPerKg);
    const proteinCalories = proteinGrams * 4;
    
    const carbPercentage = isActive ? 0.50 : 0.45;
    const carbCalories = dailyCalories * carbPercentage;
    const carbGrams = Math.round(carbCalories / 4);
    
    const fatCalories = dailyCalories - proteinCalories - carbCalories;
    const fatGrams = Math.round(fatCalories / 9);
    
    const fiberGrams = Math.round(dailyCalories / 100);
    
    const waterLiters = Math.round((currentWeightKg * 0.035) * 10) / 10;
    
    const sodiumMg = 2300;
    
    return {
        protein: `${proteinGrams}g (${Math.round(proteinCalories)} cal)`,
        carbs: `${carbGrams}g (${Math.round(carbCalories)} cal)`,
        fats: `${fatGrams}g (${Math.round(fatCalories)} cal)`,
        fiber: `${fiberGrams}g`,
        water: `${waterLiters}L`,
        sodium: `${sodiumMg}mg`
    };
}

function saveToLocalStorage(formData) {
    localStorage.setItem('healthData', JSON.stringify(formData));
}

function convertHeightToCm(heightUnit, heightValue, feet, inches) {
    if (heightUnit === 'ft') {
        const totalInches = (feet * 12) + inches;
        return totalInches * 2.54;
    }
    return heightValue;
}

function convertWeightToKg(weightUnit, weightValue) {
    if (weightUnit === 'lb') {
        return weightValue * 0.453592;
    }
    return weightValue;
}

function updateHeightInputs() {
    const heightCmGroupEl = document.getElementById('heightCmGroup');
    const heightFtGroupEl = document.getElementById('heightFtGroup');
    
    if (!heightCmGroupEl || !heightFtGroupEl) {
        console.error('Height input groups not found');
        return;
    }
    
    const heightUnitRadio = document.querySelector('input[name="heightUnit"]:checked');
    const heightUnit = heightUnitRadio ? heightUnitRadio.value : 'cm';
    
    const cmInput = heightCmGroupEl.querySelector('input[type="number"]');
    const feetInput = document.getElementById('heightFeet');
    const inchesInput = document.getElementById('heightInches');
    
    if (heightUnit === 'ft') {
        heightCmGroupEl.classList.add('hidden');
        if (cmInput) {
            cmInput.removeAttribute('required');
            cmInput.value = '';
        }
        heightFtGroupEl.classList.remove('hidden');
        if (feetInput) {
            feetInput.setAttribute('required', 'required');
        }
        if (inchesInput) {
            inchesInput.setAttribute('required', 'required');
        }
    } else {
        heightFtGroupEl.classList.add('hidden');
        if (feetInput) {
            feetInput.removeAttribute('required');
            feetInput.value = '';
        }
        if (inchesInput) {
            inchesInput.removeAttribute('required');
            inchesInput.value = '';
        }
        heightCmGroupEl.classList.remove('hidden');
        if (cmInput) {
            cmInput.setAttribute('required', 'required');
        }
    }
}

function updateWeightInputs() {
    const weightUnit = document.querySelector('input[name="weightUnit"]:checked')?.value;
    const unit = weightUnit === 'lb' ? 'lb' : 'kg';
    currentWeightUnit.textContent = unit;
    targetWeightUnit.textContent = unit;
    
    if (weightUnit === 'lb') {
        currentWeightInput.setAttribute('min', '44');
        currentWeightInput.setAttribute('max', '660');
        targetWeightInput.setAttribute('min', '44');
        targetWeightInput.setAttribute('max', '660');
    } else {
        currentWeightInput.setAttribute('min', '20');
        currentWeightInput.setAttribute('max', '300');
        targetWeightInput.setAttribute('min', '20');
        targetWeightInput.setAttribute('max', '300');
    }
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('healthData');
    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById('age').value = data.age || '';
        
        if (data.heightUnit) {
            document.querySelector(`input[name="heightUnit"][value="${data.heightUnit}"]`).checked = true;
            updateHeightInputs();
        }
        
        if (data.heightUnit === 'ft') {
            if (data.heightFeet) heightFeetInput.value = data.heightFeet;
            if (data.heightInches) heightInchesInput.value = data.heightInches;
        } else {
            document.getElementById('height').value = data.height || '';
        }
        
        if (data.weightUnit) {
            document.querySelector(`input[name="weightUnit"][value="${data.weightUnit}"]`).checked = true;
            updateWeightInputs();
        }
        
        document.getElementById('currentWeight').value = data.currentWeight || '';
        document.getElementById('targetWeight').value = data.targetWeight || '';
        
        if (data.gender) {
            document.querySelector(`input[name="gender"][value="${data.gender}"]`).checked = true;
        }
        document.getElementById('exerciseFrequency').value = data.exerciseFrequency || '';
        document.getElementById('exerciseTime').value = data.exerciseTime || '';
        
        if (data.exerciseType) {
            const exerciseTypes = Array.isArray(data.exerciseType) ? data.exerciseType : [data.exerciseType];
            document.querySelectorAll('input[name="exerciseType"]').forEach(checkbox => {
                checkbox.checked = exerciseTypes.includes(checkbox.value);
            });
        } else {
            document.querySelectorAll('input[name="exerciseType"]').forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        
        document.getElementById('exerciseType').value = data.exerciseType || '';
    }
}

function validateForm(formData) {
    const age = parseFloat(formData.age);
    const heightUnit = formData.heightUnit;
    const weightUnit = formData.weightUnit;
    
    if (age < 1 || age > 120) {
        alert('Please enter a valid age between 1 and 120 years.');
        return false;
    }
    
    if (formData.exerciseFrequency !== 'none' && (!formData.exerciseType || formData.exerciseType.length === 0)) {
        alert('Please select at least one exercise type.');
        return false;
    }
    
    let heightCm;
    if (heightUnit === 'ft') {
        const feet = parseFloat(formData.heightFeet);
        const inches = parseFloat(formData.heightInches);
        if (feet < 2 || feet > 8 || inches < 0 || inches >= 12) {
            alert('Please enter a valid height (2-8 feet, 0-11 inches).');
            return false;
        }
        heightCm = convertHeightToCm('ft', 0, feet, inches);
    } else {
        const height = parseFloat(formData.height);
        if (height < 50 || height > 250) {
            alert('Please enter a valid height between 50 and 250 cm.');
            return false;
        }
        heightCm = height;
    }
    
    if (heightCm < 50 || heightCm > 250) {
        alert('Please enter a valid height.');
        return false;
    }
    
    const currentWeight = parseFloat(formData.currentWeight);
    const targetWeight = parseFloat(formData.targetWeight);
    const currentWeightKg = convertWeightToKg(weightUnit, currentWeight);
    const targetWeightKg = convertWeightToKg(weightUnit, targetWeight);
    
    if (currentWeightKg < 20 || currentWeightKg > 300) {
        alert(`Please enter a valid current weight (${weightUnit === 'lb' ? '44-660 lb' : '20-300 kg'}).`);
        return false;
    }
    
    if (targetWeightKg < 20 || targetWeightKg > 300) {
        alert(`Please enter a valid target weight (${weightUnit === 'lb' ? '44-660 lb' : '20-300 kg'}).`);
        return false;
    }
    
    return true;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const heightUnit = document.querySelector('input[name="heightUnit"]:checked')?.value;
    const weightUnit = document.querySelector('input[name="weightUnit"]:checked')?.value;
    
    const exerciseTypes = Array.from(document.querySelectorAll('input[name="exerciseType"]:checked')).map(cb => cb.value);
    
    const formData = {
        age: document.getElementById('age').value,
        gender: document.querySelector('input[name="gender"]:checked')?.value,
        heightUnit: heightUnit,
        height: heightUnit === 'cm' ? document.getElementById('height').value : '',
        heightFeet: heightUnit === 'ft' ? document.getElementById('heightFeet').value : '',
        heightInches: heightUnit === 'ft' ? document.getElementById('heightInches').value : '',
        weightUnit: weightUnit,
        currentWeight: document.getElementById('currentWeight').value,
        targetWeight: document.getElementById('targetWeight').value,
        exerciseFrequency: document.getElementById('exerciseFrequency').value,
        exerciseTime: document.getElementById('exerciseTime').value,
        exerciseType: exerciseTypes
    };
    
    if (!validateForm(formData)) {
        return;
    }
    
    saveToLocalStorage(formData);
    
    const heightCm = convertHeightToCm(
        heightUnit,
        parseFloat(formData.height),
        parseFloat(formData.heightFeet),
        parseFloat(formData.heightInches)
    );
    
    const currentWeightKg = convertWeightToKg(weightUnit, parseFloat(formData.currentWeight));
    const targetWeightKg = convertWeightToKg(weightUnit, parseFloat(formData.targetWeight));
    
    const bmr = calculateBMR(
        parseFloat(formData.age),
        formData.gender,
        heightCm,
        currentWeightKg
    );
    
    const activityMultiplier = calculateActivityMultiplier(
        formData.exerciseFrequency,
        formData.exerciseTime,
        formData.exerciseType
    );
    
    const results = calculateCalories(
        bmr,
        activityMultiplier,
        currentWeightKg,
        targetWeightKg
    );
    
    document.getElementById('dailyCalories').textContent = `${results.dailyCalories} calories`;
    document.getElementById('weeklyChange').textContent = results.weeklyChange;
    document.getElementById('timeToGoal').textContent = results.timeToGoal;
    document.getElementById('bmr').textContent = `${results.bmr} calories`;
    
    const nutrition = calculateNutrition(
        results.dailyCalories,
        currentWeightKg,
        formData.exerciseFrequency
    );
    
    document.getElementById('protein').textContent = nutrition.protein;
    document.getElementById('carbs').textContent = nutrition.carbs;
    document.getElementById('fats').textContent = nutrition.fats;
    document.getElementById('fiber').textContent = nutrition.fiber;
    document.getElementById('water').textContent = nutrition.water;
    document.getElementById('sodium').textContent = nutrition.sodium;
    
    currentFormData = formData;
    currentResults = results;
    currentNutrition = nutrition;
    currentFormData.currentWeightKg = currentWeightKg;
    currentFormData.targetWeightKg = targetWeightKg;
    currentFormData.heightCm = heightCm;
    
    createProgressChart(currentWeightKg, targetWeightKg, results.timeToGoal);
    
    const nutritionDetails = document.getElementById('nutritionDetails');
    nutritionDetails.classList.add('hidden');
    document.getElementById('nutritionBtn').textContent = 'View Nutrition Details';
    
    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

clearBtn.addEventListener('click', () => {
    form.reset();
    resultsDiv.classList.add('hidden');
    localStorage.removeItem('healthData');
    updateHeightInputs();
    updateWeightInputs();
    if (progressChart) {
        progressChart.destroy();
        progressChart = null;
    }
    currentFormData = null;
    currentResults = null;
    currentNutrition = null;
});

const nutritionBtn = document.getElementById('nutritionBtn');
const nutritionDetails = document.getElementById('nutritionDetails');

nutritionBtn.addEventListener('click', () => {
    if (nutritionDetails.classList.contains('hidden')) {
        nutritionDetails.classList.remove('hidden');
        nutritionBtn.textContent = 'Hide Nutrition Details';
    } else {
        nutritionDetails.classList.add('hidden');
        nutritionBtn.textContent = 'View Nutrition Details';
    }
});

function createProgressChart(currentWeight, targetWeight, timeToGoal) {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    if (progressChart) {
        progressChart.destroy();
    }
    
    let weeks = 12;
    if (timeToGoal && timeToGoal !== 'Goal reached') {
        const weeksMatch = timeToGoal.match(/(\d+)/);
        if (weeksMatch) {
            weeks = parseInt(weeksMatch[1]);
        }
    }
    const weightDifference = targetWeight - currentWeight;
    const weeklyChange = weightDifference / weeks;
    
    const labels = [];
    const weightData = [];
    
    for (let i = 0; i <= weeks; i++) {
        labels.push(`Week ${i}`);
        weightData.push(parseFloat((currentWeight + (weeklyChange * i)).toFixed(1)));
    }
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight (kg)',
                data: weightData,
                borderColor: '#00BCD4',
                backgroundColor: 'rgba(0, 188, 212, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#0097A7',
                pointBorderColor: '#00BCD4'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Weight Progress Timeline',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    color: '#0097A7'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Weight (kg)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#0097A7'
                    },
                    grid: {
                        color: 'rgba(0, 188, 212, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Weeks',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#0097A7'
                    },
                    grid: {
                        color: 'rgba(0, 188, 212, 0.1)'
                    }
                }
            }
        }
    });
}

function getExerciseFrequencyLabel(value) {
    const labels = {
        'none': 'None',
        'twice': 'Twice a week',
        '3-5': '3-5 times a week',
        '7': '7 days'
    };
    return labels[value] || value;
}

function getExerciseTimeLabel(value) {
    const labels = {
        '15': '15 minutes',
        '30': '30 minutes',
        '60': '1 hour',
        '90': 'More than 1 hour'
    };
    return labels[value] || value;
}

function getExerciseTypeLabel(value) {
    const labels = {
        'home': 'Home workout',
        'gym': 'Gym workout',
        'yoga': 'Yoga',
        'walking': 'Walking'
    };
    return labels[value] || value;
}

function downloadPDF() {
    if (!currentFormData || !currentResults || !currentNutrition) {
        alert('Please calculate your results first.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    
    doc.setFillColor(0, 188, 212);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Health Calorie Tracker Report', pageWidth / 2, 20, { align: 'center' });
    
    yPos = 40;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Personal Information', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const personalInfo = [
        `Age: ${currentFormData.age} years`,
        `Gender: ${currentFormData.gender === 'male' ? 'Male' : 'Female'}`,
        `Height: ${currentFormData.heightUnit === 'ft' ? 
            `${currentFormData.heightFeet}' ${currentFormData.heightInches}"` : 
            `${currentFormData.height} cm`}`,
        `Current Weight: ${currentFormData.currentWeight} ${currentFormData.weightUnit === 'lb' ? 'lb' : 'kg'}`,
        `Target Weight: ${currentFormData.targetWeight} ${currentFormData.weightUnit === 'lb' ? 'lb' : 'kg'}`
    ];
    
    personalInfo.forEach(info => {
        doc.text(info, 20, yPos);
        yPos += 7;
    });
    
    yPos += 5;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Exercise Information', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const exerciseTypes = Array.isArray(currentFormData.exerciseType) ? 
        currentFormData.exerciseType.map(t => getExerciseTypeLabel(t)).join(', ') : 
        getExerciseTypeLabel(currentFormData.exerciseType);
    
    const exerciseInfo = [
        `Frequency: ${getExerciseFrequencyLabel(currentFormData.exerciseFrequency)}`,
        `Duration: ${getExerciseTimeLabel(currentFormData.exerciseTime)}`,
        `Type: ${exerciseTypes}`
    ];
    
    exerciseInfo.forEach(info => {
        doc.text(info, 20, yPos);
        yPos += 7;
    });
    
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Calorie Requirements', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const calorieInfo = [
        `Daily Calories Needed: ${currentResults.dailyCalories} calories`,
        `Weekly Weight Change: ${currentResults.weeklyChange}`,
        `Estimated Time to Goal: ${currentResults.timeToGoal}`,
        `Basal Metabolic Rate (BMR): ${currentResults.bmr} calories`
    ];
    
    calorieInfo.forEach(info => {
        doc.text(info, 20, yPos);
        yPos += 7;
    });
    
    if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
    }
    
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Nutrition Requirements', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const nutritionInfo = [
        `Protein: ${currentNutrition.protein}`,
        `Carbohydrates: ${currentNutrition.carbs}`,
        `Fats: ${currentNutrition.fats}`,
        `Fiber: ${currentNutrition.fiber}`,
        `Water: ${currentNutrition.water}`,
        `Sodium: ${currentNutrition.sodium}`
    ];
    
    nutritionInfo.forEach(info => {
        doc.text(info, 20, yPos);
        yPos += 7;
    });
    
    if (progressChart) {
        if (yPos > pageHeight - 100) {
            doc.addPage();
            yPos = 20;
        }
        
        yPos += 10;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Weight Progress Timeline', 20, yPos);
        yPos += 10;
        
        const chartImage = progressChart.toBase64Image();
        const imgWidth = pageWidth - 40;
        const imgHeight = (imgWidth * 9) / 16;
        
        if (yPos + imgHeight > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.addImage(chartImage, 'PNG', 20, yPos, imgWidth, imgHeight);
    }
    
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${date}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    doc.save('health-calorie-report.pdf');
}

window.addEventListener('load', () => {
    document.querySelectorAll('input[name="heightUnit"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateHeightInputs();
        });
    });

    document.querySelectorAll('input[name="weightUnit"]').forEach(radio => {
        radio.addEventListener('change', updateWeightInputs);
    });

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPDF);
    }

    loadFromLocalStorage();
    updateHeightInputs();
    updateWeightInputs();
});

