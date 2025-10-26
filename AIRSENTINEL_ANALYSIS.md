# AirSentinel Analysis & Fix Plan

## What Ankit Built (airsentinental branch)

### 🎯 Core Innovation: Decision Engine for Air Quality
AirSentinel transforms air quality forecasts from passive data viewers into an **actionable decision system**. Instead of showing just AQI numbers, it:

1. **Computes Expected Inhaled Dose** - Calculates personalized exposure based on:
   - Activity intensity (resting/light/moderate/vigorous)
   - Individual sensitivity (normal/sensitive groups like asthma, elderly, kids)
   - Duration of outdoor activity
   - Indoor vs outdoor setting
   - Real PM2.5 concentration from forecasts

2. **Generates Minimal-Disruption Recommendations** - Evaluates 4 options:
   - **Keep plan** (baseline)
   - **Delay 1 hour** (minimal schedule shift)
   - **Shorten by 30%** (reduce exposure time)
   - **Move indoors** (40% outdoor concentration)

3. **Quantifies Exposure Reduction** - Shows:
   - Dose reduction percentage vs baseline
   - Confidence intervals (±20% uncertainty band)
   - Cost/disruption tradeoff
   - Picks best option: max reduction, min disruption

4. **Finds Best Time Windows** - Analyzes 24-hour forecast to identify:
   - Optimal start times for the activity
   - Hourly PM2.5 concentration curve
   - Comparison: best vs worst windows
   - Exposure reduction % by shifting timing

### 🔬 Technical Architecture

#### API Endpoints Created:
1. **`/api/assess`** - Main decision engine
   - Input: city, start time, duration, intensity, sensitivity, indoors flag
   - Output: baseline dose, recommendation, alternatives, reduction %
   - Uses daily PM2.5 forecast from `/api/forecasts`

2. **`/api/assess/best-hours`** - Time optimization
   - Input: same as above + date
   - Output: 24-hour PM2.5 profile, best time windows, chart data
   - Strategy:
     - Fetches ML daily forecast (CatBoost models)
     - Gets hourly shape from WeatherAPI (3-day forecast with PM2.5)
     - Scales hourly shape to match ML daily mean
     - Fallback: synthetic diurnal profile if hourly unavailable

#### Frontend Components:
1. **`AssessQuick`** - Main assessment form on homepage
   - Location picker with geocoding
   - DateTime picker for activity start
   - Duration slider (15-240 min)
   - Activity intensity selector
   - Sensitivity selector
   - Indoor/outdoor toggle
   - Real-time assessment results

2. **`BestTimeChart`** - Hourly visualization
   - Recharts line chart showing 24-hour PM2.5
   - Shaded area highlighting best window
   - Top 3 time recommendations
   - Reduction % vs worst window

3. **Updated Homepage** - Hero section with:
   - "Plan safer outdoor time" messaging
   - Integrated `AssessQuick` component
   - Explains competitive advantage

### 📊 Dose Calculation Formula

```
baseline_dose = concentration × duration_hours × intensity_factor × sensitivity_factor × indoor_factor

Where:
- concentration: PM2.5 µg/m³ from forecast
- intensity_factor: 0.6 (resting), 1.0 (light), 1.8 (moderate), 2.6 (vigorous)
- sensitivity_factor: 1.0 (normal), 1.3 (sensitive)
- indoor_factor: 0.4 (indoors), 1.0 (outdoors)
```

### 🎨 UX Flow
1. User lands on homepage → sees "Assess My Activity" widget
2. Enters: Location, time, duration, activity details
3. Clicks "Assess" → gets instant recommendation
4. System shows:
   - Current plan baseline dose with uncertainty
   - Best alternative (e.g., "Delay 1 hour → reduces exposure by 35%")
   - Top 3 alternatives ranked
   - Optional: chart showing best time windows for that day

---

## 🐛 Current Issues: "Data Don't Display Properly"

Based on API logs and component analysis, here's what I found:

### ✅ What's Working:
- All APIs return 200 OK status
- `/api/assess` correctly calculates dose and recommendations
- `/api/assess/best-hours` returns 24-hour forecasts with windows
- Frontend components render without crashes
- Real-time updates on form changes

### ⚠️ Potential Display Issues:

#### Issue 1: Missing Error Handling in Components
**Location:** `components/assess-quick.tsx` lines 40-50

The component doesn't gracefully handle API errors or empty responses. If forecast API fails, it shows generic error but doesn't explain what went wrong.

**Fix:**
- Add better error messages
- Show fallback UI when forecasts unavailable
- Add loading states for each section

#### Issue 2: Chart Data May Not Load
**Location:** `components/best-time-chart.tsx` lines 30-50

The chart relies on API returning valid `hours` array and `windows` array. If either is missing/empty, chart renders blank.

**Current behavior:**
```tsx
{data && (
  <div className="space-y-3">
    {/* Assumes data.recommendation exists */}
    {/* Assumes data.hours is valid array */}
  </div>
)}
```

**Fix needed:**
- Add null checks: `data?.recommendation`, `data?.hours?.length`
- Show message when hourly data unavailable
- Display fallback text explaining diurnal profile use

#### Issue 3: Date Mismatch Between Form and API
**Location:** `components/assess-quick.tsx` line 14 & API call line 36

Form uses `datetime-local` input which gives ISO string like `"2025-10-26T08:13"`, but API expects full ISO with timezone. Could cause forecast date mismatch.

**Current code:**
```tsx
start: new Date(start).toISOString(), // Converts to UTC
```

**Issue:** User picks "tomorrow 2pm local" → API might fetch today's forecast if timezone conversion crosses day boundary.

**Fix:**
- Keep date in local timezone
- Pass date separately from time
- API should use date parameter for forecast lookup

#### Issue 4: Confidence Intervals Not Visible
**Location:** `components/assess-quick.tsx` lines 110-115

The API returns confidence intervals (`result.baseline.ci.low`, `.high`) but component doesn't display them prominently.

**Current display:**
```tsx
<p className="text-xs text-gray-600">
  Baseline dose: {result.baseline.dose.toFixed(1)} 
  (CI {result.baseline.ci.low.toFixed(1)}–{result.baseline.ci.high.toFixed(1)})
</p>
```

**Issue:** Text is tiny (text-xs) and gray - users won't notice the uncertainty quantification.

**Fix:**
- Make CI more prominent
- Explain what confidence interval means
- Show uncertainty as visual bar/range

#### Issue 5: Location Input May Not Geocode
**Location:** `components/location-input.tsx` (referenced but not fully inspected)

If geocoding fails or user enters invalid location, form might submit with fallback "Washington, DC" without user knowing.

**Fix needed:**
- Validate location before assessment
- Show error if geocoding fails
- Clear indication when using fallback

---

## 🎯 Competitive Advantage (Why This Wins)

### What Makes AirSentinel Different:

| Standard AQI Apps | AirSentinel |
|------------------|-------------|
| Shows AQI number (e.g., "85") | Shows personalized exposure dose |
| Says "Moderate" | Says "Delay 1 hour → reduce exposure 35%" |
| Generic health advice | Activity-specific recommendations |
| No timing guidance | Finds best time windows for your plan |
| One-size-fits-all | Accounts for intensity, sensitivity, duration |
| No uncertainty info | Shows confidence intervals |
| Passive data viewer | Active decision engine |

### Key Innovations:

1. **Dose-Based Risk Assessment** - Not just AQI categories, but actual estimated pollutant intake
2. **Minimal-Disruption Optimization** - Recommends smallest change for largest benefit
3. **Time Window Analysis** - Hourly resolution helps find better times same day
4. **Sensitivity Personalization** - Different advice for vulnerable groups
5. **Activity Integration** - Intensity matters (jogging ≠ sitting)
6. **Uncertainty Quantification** - Confidence intervals show forecast reliability

### Real-World Impact:

**Example Scenario:**
- Mom planning to take kids to park for 90 minutes at 2pm
- Standard app: "AQI is 85 - Moderate"
- AirSentinel: "Delay to 4pm → reduce exposure by 42%. Or shorten to 60 minutes → reduce 30%"

**Decision value:**
- Keeps the plan (kids get outdoor time)
- Minimizes health risk (cuts exposure nearly in half)
- Actionable (specific time/duration)
- Confidence-rated (CI shows forecast reliability)

---

## 🔧 Fix Plan

### Priority 1: Fix Data Display Issues (30 min)
1. Add null checks to `best-time-chart.tsx`
2. Improve error messages in `assess-quick.tsx`
3. Fix date/timezone handling
4. Add loading states

### Priority 2: Enhance UX (20 min)
1. Make confidence intervals more visible
2. Add explainer tooltips
3. Show fallback messages when data missing
4. Improve location validation

### Priority 3: Test End-to-End (15 min)
1. Test with different cities
2. Test with missing forecasts
3. Test with invalid inputs
4. Verify chart renders correctly

### Priority 4: Document Innovation (10 min)
1. Add README explaining decision engine
2. Create examples showing dose calculations
3. Explain competitive advantage
4. Add Monte Carlo/CatBoost references

---

## 🚀 Next Steps

1. I'll fix all data display issues now
2. Test the fixes with multiple scenarios
3. Create documentation for judges
4. Merge to main and deploy

Let me start fixing the components now...
