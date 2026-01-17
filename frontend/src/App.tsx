import { useEffect, useState } from 'react'
import type { City, Activity, DayPlan } from './types'
import './App.css'

function App() {
  const [cities, setCities] = useState<City[]>([])
  const [selectedCityId, setSelectedCityId] = useState<string>('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [dayPlan, setDayPlan] = useState<DayPlan>({ cityId: '', pax: 1, activities: [], totalPrice: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addActivityTime, setAddActivityTime] = useState<Record<string, string>>({})

  // Fetch cities on mount
  useEffect(() => {
    fetch('/api/cities')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((result: City[]) => {
        setCities(result)
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch cities:", err)
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  // Fetch activities when city changes
  useEffect(() => {
    if (!selectedCityId) {
      return
    }

    fetch(`/api/activities?cityId=${selectedCityId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((result: Activity[]) => {
        setActivities(result)
      })
      .catch(err => {
        console.error("Failed to fetch activities:", err)
        setError(err.message)
      })
  }, [selectedCityId])

  // Fetch day plan on mount
  useEffect(() => {
    fetch('/api/dayplan')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((result: DayPlan) => {
        if (result.cityId) {
          setDayPlan(result)
          setSelectedCityId(result.cityId)
        }
      })
      .catch(err => {
        console.error("Failed to fetch day plan:", err)
      })
  }, [])

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId)
    setActivities([])
    // Reset day plan when changing city
    const newPlan: DayPlan = { cityId, pax: dayPlan.pax, activities: [], totalPrice: 0 }
    setDayPlan(newPlan)
    fetch('/api/dayplan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlan)
    }).catch(err => console.error("Failed to save day plan:", err))
  }

  const handleAddActivity = (activityId: string) => {
    const startTime = addActivityTime[activityId]
    if (!startTime) {
      setError('Please select a start time')
      return
    }

    fetch('/api/dayplan/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityId, startTime })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || 'Failed to add activity')
          })
        }
        return res.json()
      })
      .then(result => {
        setDayPlan(result.dayPlan)
        setAddActivityTime({ ...addActivityTime, [activityId]: '' })
        setError(null)
      })
      .catch(err => {
        setError(err.message)
      })
  }

  const handleRemoveActivity = (plannedId: string) => {
    fetch(`/api/dayplan/activity/${plannedId}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to remove activity')
        return res.json()
      })
      .then(result => {
        setDayPlan(result.dayPlan)
        setError(null)
      })
      .catch(err => {
        setError(err.message)
      })
  }

  const handlePaxChange = (newPax: number) => {
    if (newPax < 1) return

    fetch('/api/dayplan/pax', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pax: newPax })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update pax')
        return res.json()
      })
      .then(result => {
        setDayPlan(result.dayPlan)
      })
      .catch(err => {
        setError(err.message)
      })
  }

  const getActivityDetails = (activityId: string): Activity | undefined => {
    return activities.find(a => a.id === activityId)
  }

  if (isLoading) return <div className="container"><p>Loading...</p></div>

  return (
    <div className="container">
      <h1>🧳 Day Itinerary Builder</h1>

      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* City Selection */}
      <section className="card">
        <h2>1. Select City</h2>
        <select 
          value={selectedCityId} 
          onChange={(e) => handleCityChange(e.target.value)}
          className="select-input"
        >
          <option value="">--Select a City--</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}, {city.country}
            </option>
          ))}
        </select>
      </section>

      {/* Number of Travelers */}
      {selectedCityId && (
        <section className="card">
          <h2>Number of Travelers</h2>
          <div className="pax-control">
            <button onClick={() => handlePaxChange(dayPlan.pax - 1)} disabled={dayPlan.pax <= 1}>-</button>
            <span className="pax-value">{dayPlan.pax}</span>
            <button onClick={() => handlePaxChange(dayPlan.pax + 1)}>+</button>
          </div>
        </section>
      )}

      {/* Activity Catalogue */}
      {selectedCityId && activities.length > 0 && (
        <section className="card">
          <h2>2. Available Activities</h2>
          <div className="activities-grid">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <h3>{activity.title}</h3>
                <div className="activity-details">
                  <span className="badge">{activity.type.replace('_', ' ')}</span>
                  <span>⏱️ {activity.duration} min</span>
                  <span>💰 ₹{activity.pricePerPax}/person</span>
                </div>
                <div className="activity-actions">
                  <input
                    type="time"
                    value={addActivityTime[activity.id] || ''}
                    onChange={(e) => setAddActivityTime({ ...addActivityTime, [activity.id]: e.target.value })}
                    className="time-input"
                  />
                  <button onClick={() => handleAddActivity(activity.id)}>Add to Plan</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Day Plan Timeline */}
      {selectedCityId && (
        <section className="card">
          <h2>3. Day Plan Timeline</h2>
          {dayPlan.activities.length === 0 ? (
            <p className="empty-state">No activities added yet. Start planning your day!</p>
          ) : (
            <>
              <div className="timeline">
                {dayPlan.activities.map((planned) => {
                  const activity = getActivityDetails(planned.activityId)
                  if (!activity) return null
                  return (
                    <div key={planned.id} className="timeline-item">
                      <div className="timeline-time">
                        <strong>{planned.startTime}</strong>
                        <span>to</span>
                        <strong>{planned.endTime}</strong>
                      </div>
                      <div className="timeline-content">
                        <h4>{activity.title}</h4>
                        <div className="timeline-details">
                          <span className="badge">{activity.type.replace('_', ' ')}</span>
                          <span>⏱️ {activity.duration} min</span>
                          <span>💰 ₹{activity.pricePerPax * dayPlan.pax}</span>
                        </div>
                      </div>
                      <button 
                        className="btn-remove" 
                        onClick={() => handleRemoveActivity(planned.id)}
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="total-price">
                <h3>Total Price: ₹{dayPlan.totalPrice}</h3>
                <p>for {dayPlan.pax} traveler{dayPlan.pax > 1 ? 's' : ''}</p>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}

export default App
