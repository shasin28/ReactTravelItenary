## 🧳 Problem Statement (Candidate-Facing)

### Product Context

You are building a **Day Itinerary Builder** for a travel product.

A user should be able to:

* Select a city from available destinations
* Browse available activities for the selected city
* Plan a single day by adding activities to a timeline
* See validation warnings when the plan is not feasible
* See the total cost for the day

You are given a working starter application and datasets for cities and activities.

---

## ✅ Acceptance Criteria (What "Done" Looks Like)

### 1. City Selection

* The user can see a list of available cities
* The user can select a city to plan activities for
* Activities are filtered by the selected city

---

### 2. Activity Catalogue

* The user can see a list of available activities for the selected city
* Each activity shows:
  * title
  * type
  * duration
  * price per person
* The user can add an activity to the day plan with a chosen start time

---

### 3. Day Plan Timeline

* The day plan displays added activities in **chronological order**
* Each planned item shows:

  * activity title
  * start time
  * end time (calculated)
* The user can **remove** an activity from the plan
* Total price updates when activities are added or removed

---

### 4. Planning Rules

When adding an activity:

#### Overlap rule

* Activities must **not overlap** in time
* If an overlap occurs, show a **clear warning message**
* The invalid activity should **not** be added

#### Transfer rule (simplified)

* A maximum of **one transfer activity** is allowed per day
* If violated, show a warning

---

### 5. Pricing

* User can set number of travellers (`pax`)
* Total price is calculated as:

  ```
  sum(activity.pricePerPax × pax)
  ```
* Total updates as plan changes

---

### 6. TypeScript

* Use proper TypeScript types
* Avoid `any`
* Handle edge cases gracefully

---

### 7. Testing (TDD Approach)

* Write **comprehensive unit tests** for core planning logic
* Test coverage should include:

  * overlap detection (valid and invalid cases)
  * price calculation (single activity, multiple activities, after removal)
  * transfer rule validation
  * edge cases (empty plan, boundary times)
* Extract business logic into **pure functions** for testability
* Write tests alongside implementation — this is a **pairing session**, and our panel will assist if needed

---

### 8. Data Storage

* The day plan should be stored in a **JSON file** (server-side persistence)

---

## 🕒 Time & Scope Guidance (Explicit)

* Timebox: **90 minutes**
* Focus on:

  * correctness
  * clarity
  * structure

---

## 🛠️ Technical Notes

* The repo is pre-configured with **React**, **Express**, and **Vite** for development and testing
* **ESLint** is included for code linting
* See `README.md` for setup instructions

---

## 📁 Data & Setup

### File Locations

| File | Purpose |
|------|---------|
| `backend/data/cities.json` | City catalogue (read-only) |
| `backend/data/activities.json` | Activity catalogue (read-only) |
| `backend/data/dayplan.json` | Day plan storage (read/write) |

**Note**: Define your own TypeScript interfaces based on the JSON data structure.

### Data Relationships

* Each **activity** has a `cityId` field linking it to a city
* Design your own structure for the **day plan** based on requirements

### Activity Types

Activities have a `type` field with these values:

* `water_sport` - Water-based activities
* `sightseeing` - Tours and excursions
* `adventure` - Outdoor adventures
* `leisure` - Relaxation activities
* `wellness` - Health and fitness
* `transfer` - Transportation

The **transfer rule** applies to activities where `type === "transfer"`

### Time Format

* Use 24-hour format: `"HH:mm"` (e.g., `"09:00"`, `"14:30"`)
* Day planning window: `06:00` to `22:00`
* Duration is stored in **minutes**
