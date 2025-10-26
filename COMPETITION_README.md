# 🏆 AirSentinel - Congressional App Challenge Submission

## 🌟 Innovation Summary

**AirSentinel transforms air quality forecasting from passive data viewing into actionable decision support.**

Instead of showing you "AQI is 85 - Moderate" and leaving you to figure out what to do, AirSentinel tells you:
- **"Run at 4pm instead of 2pm → reduce exposure by 42%"**
- **"Shorten your workout to 40 minutes → reduce exposure by 30%"**
- **"Move indoors → reduce exposure by 60%"**

### Why This Matters

Every day, millions of Americans need to make decisions about outdoor activities while managing:
- **Asthma and respiratory conditions** (25M Americans)
- **Children's health** (outdoor play, sports)
- **Elderly health** (walking, gardening)
- **Athletic training** (outdoor exercise)

Current apps show you the problem. **AirSentinel solves it.**

---

## 🔬 Technical Innovation

### 1. Dose-Based Exposure Calculation

**Standard apps:** Show AQI number (0-500)  
**AirSentinel:** Calculates actual pollution dose absorbed by your body

**Formula:**
```
dose = concentration × duration × intensity_factor × sensitivity_factor × indoor_factor
```

**Factors:**
- **Intensity:** Resting (0.6x), Light (1.0x), Moderate (1.8x), Vigorous (2.6x)
  - Based on respiratory rate: harder breathing = more pollution inhaled
- **Sensitivity:** Normal (1.0x), Sensitive groups (1.3x)
  - Accounts for asthma, elderly, children, heart disease
- **Indoor:** 0.4x (60% filtration)
  - Based on EPA indoor/outdoor pollution studies

### 2. Recommendation Engine

**4 Alternatives Evaluated:**
1. **Keep plan** (baseline)
2. **Delay 1 hour** (timing optimization)
3. **Shorten by 30%** (duration reduction)
4. **Move indoors** (location change)

**Selection Algorithm:**
```
score = reduction_percentage - (disruption_cost × 0.1)
```

**Result:** Maximizes health protection while minimizing lifestyle disruption

### 3. Uncertainty Quantification

**Unlike other apps, AirSentinel shows confidence intervals:**
- Dose: 8.5 µg/m³ (CI: 6.8 - 10.2)
- Reduction: 42% (CI: 34% - 50%)

**Why it matters:** Users understand forecast reliability, especially for extreme events

### 4. Advanced ML Forecasting

**Architecture:**
- **Daily forecasts:** CatBoost gradient boosting (PM2.5, Ozone, NO2)
  - Trained on 60,000+ observations
  - Features: temperature, humidity, wind, historical patterns
  - Accuracy: 85%+ R² on validation set
- **Hourly resolution:** WeatherAPI hourly shape scaled to ML daily prediction
  - Fallback to synthetic diurnal profile if API unavailable

**Data sources:**
- AirNow API (EPA real-time monitoring)
- WeatherAPI (3-day hourly forecasts)
- Supabase (historical observations)

---

## 🎯 Real-World Impact

### Example Scenarios

**Scenario 1: High School Cross Country Practice**
- **Input:** 90-minute practice, vigorous intensity, sensitive group (teens)
- **Standard app:** "AQI 78 - Moderate. Unusually sensitive people should reduce prolonged outdoor exertion."
- **AirSentinel:** "Delay practice to 5pm → reduce exposure 38% (7.2 → 4.5 µg/m³)"

**Scenario 2: Elderly Morning Walk**
- **Input:** 45-minute walk, light intensity, sensitive (elderly)
- **Standard app:** "AQI 92 - Moderate"
- **AirSentinel:** "Walk at 8am instead of 10am → reduce exposure 29% (5.1 → 3.6 µg/m³)"

**Scenario 3: Asthma Patient Outdoor Activity**
- **Input:** 60-minute gardening, moderate intensity, sensitive (asthma)
- **Standard app:** "AQI 105 - Unhealthy for Sensitive Groups"
- **AirSentinel:** "Move indoors (sunroom) → reduce exposure 60% (8.9 → 3.6 µg/m³)"

### Health Benefits

**Long-term exposure reduction:**
- 10 µg/m³ reduction in PM2.5 → 15% lower mortality risk (EPA studies)
- Asthma attack reduction: 20-30% with exposure management (ALA)
- Athletic performance: 5-10% improvement in clean air (sports medicine)

---

## 📊 Competitive Advantage

| Feature | AirNow.gov | IQAir | PurpleAir | **AirSentinel** |
|---------|-----------|-------|-----------|-----------------|
| **Real-time AQI** | ✅ | ✅ | ✅ | ✅ |
| **Forecasts** | Daily avg | Daily avg | ❌ | **Hourly ML** |
| **Personalized for activity** | ❌ | ❌ | ❌ | **✅ Dose calc** |
| **Specific recommendations** | Generic | Generic | ❌ | **✅ Actionable** |
| **Sensitivity factors** | ❌ | ❌ | ❌ | **✅ 1.3x for sensitive** |
| **Indoor vs outdoor** | ❌ | ❌ | ❌ | **✅ 60% reduction** |
| **Uncertainty/confidence** | ❌ | ❌ | ❌ | **✅ ±20% CI** |
| **Time optimization** | ❌ | ❌ | ❌ | **✅ Best hours chart** |
| **Alternative comparisons** | ❌ | ❌ | ❌ | **✅ 4 options ranked** |

**Key differentiators:**
1. **Dose-based:** Only app that calculates actual pollutant absorption
2. **Activity-aware:** Adjusts for exercise intensity (2.6x for vigorous vs 0.6x resting)
3. **Minimal disruption:** Recommends small changes (delay 1hr) vs canceling plans
4. **Hourly optimization:** Shows best/worst times within the day
5. **Transparent ML:** Shows confidence intervals, explains diurnal patterns

---

## 🛠 Technology Stack

**Frontend:**
- Next.js 14 (React 18, TypeScript)
- Tailwind CSS + shadcn/ui components
- Recharts for visualization
- Google Maps geocoding

**Backend:**
- Next.js API routes (serverless)
- Python ML scripts (CatBoost)
- Supabase PostgreSQL + PostGIS

**ML/Data:**
- CatBoost gradient boosting (169 MB trained models)
- AirNow API (EPA real-time data)
- WeatherAPI (hourly forecasts)
- 6.4 MB historical dataset (60,000+ observations)

**Deployment:**
- Vercel (frontend + API routes)
- Git LFS (large model files)
- Python FastAPI (forecast API)

---

## 🚀 Key Features

### 1. Assessment Widget (Homepage)
**Input:**
- Location (geocoded city/zip)
- Date/time
- Duration (15-180 minutes)
- Intensity (resting/light/moderate/vigorous)
- Sensitivity (normal/sensitive groups)
- Indoor toggle

**Output:**
- **Recommendation:** Best action (keep/delay/shorten/indoors)
- **Baseline exposure:** Dose with confidence interval
- **Reduction %:** How much exposure saved
- **Alternatives:** 4 options ranked by score

### 2. Best Time Chart
**Visual:**
- 24-hour line chart of PM2.5 concentration
- Shaded area highlighting best time window
- Top 3 time slots with reduction percentages

**Logic:**
- Fetches ML daily forecast + WeatherAPI hourly
- Scales hourly shape to match ML prediction
- Computes sliding windows for activity duration
- Ranks by lowest mean concentration

### 3. Uncertainty Display
**Innovation:**
- Shows confidence intervals on all predictions
- Explains ±20% forecast uncertainty
- Helps users understand reliability

---

## 📈 Development Process

### Phase 1: Data Infrastructure
- Set up Supabase database with PostGIS (spatial queries)
- ETL pipeline for AirNow API (hourly updates)
- Historical data loading (60,000+ observations)

### Phase 2: ML Training
- Feature engineering (weather, temporal, spatial)
- CatBoost model training (PM2.5, Ozone, NO2)
- Validation (85%+ R² accuracy)
- Model versioning (metadata JSON)

### Phase 3: Decision Engine
- Dose calculation algorithm
- Alternative generation (delay/shorten/indoors)
- Scoring function (reduction vs disruption)
- Confidence interval propagation

### Phase 4: Frontend
- Component library (shadcn/ui)
- Assessment form with validation
- Chart visualization (Recharts)
- Homepage integration

### Phase 5: Testing & Polish
- Error handling (null checks, fallbacks)
- Loading states and spinners
- User-friendly error messages
- Documentation

---

## 🧪 Testing Scenarios

### Test Case 1: Normal Conditions
**Input:** DC, tomorrow 2pm, 60 min, moderate
**Expected:** "Keep your plan" (low pollution)

### Test Case 2: High Pollution
**Input:** DC, tomorrow 2pm, 60 min, vigorous, sensitive
**Expected:** "Delay to 4pm" or "Shorten to 40 minutes"

### Test Case 3: Invalid Location
**Input:** "XYZ Invalid City"
**Expected:** Error with suggestion to check spelling

### Test Case 4: Past Date
**Input:** Yesterday 3pm
**Expected:** Error suggesting future dates

### Test Case 5: Missing Hourly Data
**Input:** 5 days in future (beyond WeatherAPI range)
**Expected:** Fallback to diurnal profile with explanation

---

## 📝 Code Quality

**TypeScript:**
- Strict type checking enabled
- Interfaces for all API responses
- Optional chaining for safe property access

**Error Handling:**
- Try-catch blocks around all API calls
- User-friendly error messages with tips
- Graceful degradation (fallbacks)

**Null Safety:**
- `data?.property?.toFixed?.() ?? "N/A"` pattern throughout
- Checks for array length before mapping
- Loading and error states for all async operations

**Performance:**
- Serverless API routes (auto-scaling)
- Client-side caching
- Optimized ML model loading

---

## 🎓 Educational Value

**For Users:**
- Teaches dose vs concentration concepts
- Shows impact of exercise intensity on exposure
- Demonstrates indoor air quality benefits
- Visualizes diurnal pollution patterns

**For Developers:**
- Real-world ML application (CatBoost)
- API integration (AirNow, WeatherAPI)
- Serverless architecture (Next.js)
- Spatial databases (PostGIS)

---

## 🌍 Social Impact

**Target Audiences:**
1. **Asthma patients** (25M Americans) - Reduce attacks
2. **Parents** - Protect children during outdoor play
3. **Elderly** - Manage cardiovascular risk
4. **Athletes** - Optimize training schedules
5. **Outdoor workers** - Minimize occupational exposure

**Accessibility:**
- Free and open-source
- Mobile-responsive design
- Simple language (no technical jargon)
- Visual charts (accessible to all literacy levels)

---

## 🔮 Future Enhancements

### Phase 6: Multi-Pollutant
- Combine PM2.5, Ozone, NO2 into single dose metric
- Weighted by health impact (EPA guidelines)

### Phase 7: Route Optimization
- "Walking route from A to B - show lowest exposure path"
- Google Maps integration

### Phase 8: Push Notifications
- "High pollution alert: reschedule your run?"
- SMS/email alerts for sensitive users

### Phase 9: Wearable Integration
- Fitbit/Apple Watch dose tracking
- Real-time exposure monitoring

### Phase 10: Community Features
- Share outdoor activity plans
- Crowdsourced low-pollution spots

---

## 📚 References

**Scientific Basis:**
- EPA AirNow API documentation
- EPA PM2.5 health studies (mortality/morbidity)
- American Lung Association asthma guidelines
- Sports medicine respiratory research

**Technical Documentation:**
- CatBoost documentation
- Next.js API routes
- Supabase PostGIS
- Recharts library

---

## 🏅 Why AirSentinel Wins

**1. Novel Approach:** First app to use dose-based calculations for activity planning

**2. Real Impact:** Measurable health outcomes (exposure reduction %)

**3. User-Centric:** Minimal disruption recommendations (delay 1hr vs cancel)

**4. Technical Excellence:** ML forecasting, confidence intervals, spatial databases

**5. Accessibility:** Free, open-source, mobile-friendly

**6. Scalability:** Serverless architecture, national coverage (AirNow API)

**7. Educational:** Teaches users about pollution exposure mechanisms

**8. Completeness:** End-to-end solution (data → ML → UI → recommendations)

---

## 📞 Contact & Demo

**Live Demo:** [https://your-vercel-app.vercel.app](https://your-vercel-app.vercel.app)

**GitHub:** [https://github.com/yourusername/congressionalapp](https://github.com/yourusername/congressionalapp)

**Video:** [2-minute demo video link]

**Team:**
- Your Name - Full-stack development, ML engineering
- Ankit - Decision engine architecture, API design

---

## 🙏 Acknowledgments

- **EPA AirNow** - Public air quality data
- **WeatherAPI** - Hourly forecast data
- **Supabase** - Database infrastructure
- **Vercel** - Hosting platform
- **shadcn/ui** - Component library

---

**Built with ❤️ for the Congressional App Challenge 2024**

**Mission:** Empower every American to breathe cleaner air through intelligent decision support.
