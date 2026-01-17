import dotenv from "dotenv";
import express from "express";
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import path from 'path';
import type { Activity, City, DayPlan, PlannedActivity } from './types.js';
import { 
  calculateEndTime, 
  calculateTotalPrice, 
  validateNoOverlap, 
  validateTransferRule,
  validateTimeWindow 
} from './planningLogic.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// For development (ts-node), __dirname is in src/
// For production (built), __dirname is in dist/
// In both cases, data/ should be at ../data/ from the respective directory
const citiesPath = path.resolve(__dirname, '../data/cities.json');
const activitiesPath = path.resolve(__dirname, '../data/activities.json');
const dayPlanPath = path.resolve(__dirname, '../data/dayplan.json');

console.log('Data paths:', { citiesPath, activitiesPath, dayPlanPath });

export const app = express();

app.use(express.json());


app.get("/api/health", (req, res) => {
  res.json({ message: "OK" });
});

// API endpoint to fetch all cities
app.get('/api/cities', (req, res) => {
  console.log('Reading cities from:', citiesPath);
  fs.readFile(citiesPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading cities file:', err);
      return res.status(500).json({ error: 'Error reading cities data' });
    }
    try {
      const cities: City[] = JSON.parse(data);
      console.log('Successfully read cities:', cities.length);
      return res.json(cities);
    } catch (parseError) {
      console.error('Error parsing cities JSON:', parseError);
      res.status(500).json({ error: 'Error parsing cities data' });
    }
  });
});

// API endpoint to fetch all activities (optionally filtered by city)
app.get('/api/activities', (req, res) => {
  fs.readFile(activitiesPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error reading activities data' });
    }
    try {
      let activities: Activity[] = JSON.parse(data);
      const cityId = req.query.cityId as string;
      
      if (cityId) {
        activities = activities.filter(a => a.cityId === cityId);
      }
      
      return res.json(activities);
    } catch (parseError) {
      console.error(parseError);
      res.status(500).json({ error: 'Error parsing activities data' });
    }
  });
});

// API endpoint to fetch the current day plan
app.get('/api/dayplan', (req, res) => {
  fs.readFile(dayPlanPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error reading day plan data' });
    }
    try {
      const dayPlan = JSON.parse(data);
      return res.json(dayPlan);
    } catch (parseError) {
      console.error(parseError);
      res.status(500).json({ error: 'Error parsing day plan data' });
    }
  });
});

// API endpoint to save/update the day plan
app.post('/api/dayplan', (req, res) => {
  const dayPlan: DayPlan = req.body;
  
  fs.writeFile(dayPlanPath, JSON.stringify(dayPlan, null, 2), 'utf8', (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error saving day plan' });
    }
    res.json({ success: true, dayPlan });
  });
});

// API endpoint to add an activity to the day plan
app.post('/api/dayplan/activity', (req, res) => {
  const { activityId, startTime } = req.body;
  
  if (!activityId || !startTime) {
    return res.status(400).json({ error: 'activityId and startTime are required' });
  }

  // Read all necessary data
  fs.readFile(activitiesPath, 'utf8', (actErr, actData) => {
    if (actErr) {
      return res.status(500).json({ error: 'Error reading activities data' });
    }

    fs.readFile(dayPlanPath, 'utf8', (planErr, planData) => {
      if (planErr) {
        return res.status(500).json({ error: 'Error reading day plan data' });
      }

      try {
        const activities: Activity[] = JSON.parse(actData);
        const dayPlan: DayPlan = JSON.parse(planData);

        const activity = activities.find(a => a.id === activityId);
        if (!activity) {
          return res.status(404).json({ error: 'Activity not found' });
        }

        const endTime = calculateEndTime(startTime, activity.duration);

        // Validate time window
        const timeWindowValidation = validateTimeWindow(startTime, endTime);
        if (!timeWindowValidation.valid) {
          return res.status(400).json({ error: timeWindowValidation.message });
        }

        // Validate no overlap
        const overlapValidation = validateNoOverlap(dayPlan.activities || [], startTime, endTime);
        if (!overlapValidation.valid) {
          return res.status(400).json({ error: overlapValidation.message });
        }

        // Validate transfer rule
        const transferValidation = validateTransferRule(activities, dayPlan.activities || [], activityId);
        if (!transferValidation.valid) {
          return res.status(400).json({ error: transferValidation.message });
        }

        // Add the activity to the plan
        const newPlannedActivity: PlannedActivity = {
          id: `planned-${Date.now()}`,
          activityId,
          startTime,
          endTime
        };

        if (!dayPlan.activities) {
          dayPlan.activities = [];
        }
        dayPlan.activities.push(newPlannedActivity);

        // Sort activities by start time
        dayPlan.activities.sort((a, b) => a.startTime.localeCompare(b.startTime));

        // Recalculate total price
        dayPlan.totalPrice = calculateTotalPrice(activities, dayPlan.activities, dayPlan.pax || 1);

        // Save updated plan
        fs.writeFile(dayPlanPath, JSON.stringify(dayPlan, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
            return res.status(500).json({ error: 'Error saving day plan' });
          }
          res.json({ success: true, dayPlan });
        });
      } catch (parseError) {
        console.error(parseError);
        res.status(500).json({ error: 'Error processing request' });
      }
    });
  });
});

// API endpoint to remove an activity from the day plan
app.delete('/api/dayplan/activity/:id', (req, res) => {
  const { id } = req.params;

  fs.readFile(activitiesPath, 'utf8', (actErr, actData) => {
    if (actErr) {
      return res.status(500).json({ error: 'Error reading activities data' });
    }

    fs.readFile(dayPlanPath, 'utf8', (planErr, planData) => {
      if (planErr) {
        return res.status(500).json({ error: 'Error reading day plan data' });
      }

      try {
        const activities: Activity[] = JSON.parse(actData);
        const dayPlan: DayPlan = JSON.parse(planData);

        if (!dayPlan.activities) {
          return res.status(404).json({ error: 'No activities in plan' });
        }

        const initialLength = dayPlan.activities.length;
        dayPlan.activities = dayPlan.activities.filter(a => a.id !== id);

        if (dayPlan.activities.length === initialLength) {
          return res.status(404).json({ error: 'Activity not found in plan' });
        }

        // Recalculate total price
        dayPlan.totalPrice = calculateTotalPrice(activities, dayPlan.activities, dayPlan.pax || 1);

        fs.writeFile(dayPlanPath, JSON.stringify(dayPlan, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
            return res.status(500).json({ error: 'Error saving day plan' });
          }
          res.json({ success: true, dayPlan });
        });
      } catch (parseError) {
        console.error(parseError);
        res.status(500).json({ error: 'Error processing request' });
      }
    });
  });
});

// API endpoint to update number of travelers
app.patch('/api/dayplan/pax', (req, res) => {
  const { pax } = req.body;

  if (!pax || pax < 1) {
    return res.status(400).json({ error: 'pax must be a positive number' });
  }

  fs.readFile(activitiesPath, 'utf8', (actErr, actData) => {
    if (actErr) {
      return res.status(500).json({ error: 'Error reading activities data' });
    }

    fs.readFile(dayPlanPath, 'utf8', (planErr, planData) => {
      if (planErr) {
        return res.status(500).json({ error: 'Error reading day plan data' });
      }

      try {
        const activities: Activity[] = JSON.parse(actData);
        const dayPlan: DayPlan = JSON.parse(planData);

        dayPlan.pax = pax;
        dayPlan.totalPrice = calculateTotalPrice(activities, dayPlan.activities || [], pax);

        fs.writeFile(dayPlanPath, JSON.stringify(dayPlan, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
            return res.status(500).json({ error: 'Error saving day plan' });
          }
          res.json({ success: true, dayPlan });
        });
      } catch (parseError) {
        console.error(parseError);
        res.status(500).json({ error: 'Error processing request' });
      }
    });
  });
});

// Start server if this module is run directly
// Check works for both Unix and Windows paths
const isMainModule = process.argv[1] && (
  import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url === pathToFileURL(process.argv[1]).href
);

if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
