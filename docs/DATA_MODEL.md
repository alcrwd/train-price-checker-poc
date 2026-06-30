# DATA_MODEL.md

# Best Train Price

Data model for Version 3.

The purpose of this document is to define the core data objects used throughout the project.

The model intentionally stays simple.

---

# Search

A search describes what the user is looking for.

Required fields:

- Origin
- Destination
- Single travel date OR date range

Example

```json
{
  "origin": "Malmö Central",
  "destination": "Nyköping Central",
  "travelDate": "2026-07-15"
}
```

or

```json
{
  "origin": "Malmö Central",
  "destination": "Nyköping Central",
  "travelPeriod": {
    "from": "2026-07-10",
    "to": "2026-07-20"
  }
}
```

Search parameters define which dataset should be created.

---

# Dataset

A dataset is the complete result from one search.

Example

```json
{
  "generatedAt": "2026-07-01T12:00:00Z",

  "search": { ... },

  "journeys": [
    ...
  ]
}
```

A dataset should always contain every journey returned from SJ for that search.

The dataset remains available while the user explores the results.

Sorting and filtering never create a new dataset.

---

# Journey

A journey describes one complete travel option.

Example

```json
{
  "id": "...",

  "travelDate": "2026-07-15",

  "price": 319,

  "currency": "SEK",

  "departureTime": "05:07",

  "arrivalTime": "09:14",

  "durationMinutes": 247,

  "legs": [
    ...
  ]
}
```

---

# Leg

A leg represents one train within a journey.

Example

```json
{
  "origin": "Malmö Central",

  "destination": "Norrköping Central",

  "departureTime": "05:07",

  "arrivalTime": "08:11",

  "operator": "SJ",

  "trainNumber": "522"
}
```

A direct journey contains one leg.

A journey with one change contains two legs.

A journey with two changes contains three legs.

---

# Version 3 Principles

Version 3 only contains:

- Search
- Dataset
- Journey
- Leg

Everything else builds on top of these objects.

Examples of future extensions:

- Recommendations
- Historical analysis
- Split-ticket optimisation
- Booking optimisation

These features should not change the core data model.

---

# Design Principles

One search creates one dataset.

One dataset contains many journeys.

One journey contains one or more legs.

Sorting and filtering work only on the existing dataset.
