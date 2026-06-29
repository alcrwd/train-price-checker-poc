Train Price Checker – Architecture

Purpose

This project investigates whether it can be cheaper to buy a train ticket from Malmö → Stockholm, leave the train in Norrköping, and continue with a separate ticket from Norrköping → Nyköping, instead of buying a direct ticket from Malmö → Nyköping.

The project started as a proof of concept based on parsing SJ’s website. After exploring SJ’s internal API, the long-term goal is to base all analysis on structured API responses instead of rendered HTML.

⸻

Architecture Overview

                SJ API
                   │
                   ▼
             src/api/sjApi.js
                   │
                   ▼
          src/api/tripMapper.js
                   │
             Trip objects
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
 offerService  matchService  analysisService
      │            │            │
      └────────────┼────────────┘
                   ▼
         scan-date-range-api.js

⸻

Design Principles

1. One source of truth

Version 2 should use SJ’s API as the only source of truth.

Avoid:

* HTML parsing
* Regular expressions on page text
* Scroll-dependent loading
* UI text such as “Hämtar pris”

Instead, use structured JSON returned by SJ.

⸻

2. One responsibility per module

Each module should have a single, clearly defined responsibility.

src/api/sjApi.js

Responsible for communicating with SJ.

Responsibilities:

* Request departures
* Request offers
* Return raw SJ JSON

No business logic.

⸻

src/api/tripMapper.js

Converts SJ’s JSON into the project’s internal model.

This is the only file that should know about fields such as:

departure.legs[0].serviceName
departure.legs[1].departureDateTime
departure.departureDateTime

Everything else should work with the project’s own model.

⸻

src/services/offerService.js

Attaches ticket prices to each Trip.

⸻

src/services/matchService.js

Matches trips representing the same physical train.

Primary matching should use the first-leg train number.

Example:

522 ↔ 522
524 ↔ 524
528 ↔ 528
530 ↔ 530

⸻

src/services/analysisService.js

Calculates:

* Savings
* Travel time
* Waiting time
* Connection quality
* Statistics

⸻

Internal Data Model

The rest of the project should never work directly with SJ’s JSON.

Instead, every journey should be represented as a Trip.

Example:

{
  id: "...",
  from: "Malmö Central",
  to: "Nyköping Central",
  departure: "05:07",
  arrival: "09:14",
  duration: "PT4H7M",
  price: 380,
  firstLeg: {
    from: "Malmö Central",
    to: "Norrköping Central",
    departure: "05:07",
    arrival: "08:16",
    trainNumber: "522",
    operator: "SJ Snabbtåg",
    brand: "X 2000"
  },
  secondLeg: {
    from: "Norrköping Central",
    to: "Nyköping Central",
    departure: "08:30",
    arrival: "09:14",
    trainNumber: "224",
    operator: "Mälartåg"
  },
  changeMinutes: 14,
  routeType: "via-norrkoping"
}

⸻

Route Classification

Every Trip should be classified.

via-norrkoping

The primary strategy.

Requirements:

* First leg ends in Norrköping.
* Second leg starts in Norrköping.

These trips are included in the main analysis.

⸻

via-stockholm

Trips changing trains in Stockholm.

These are currently excluded from the primary savings analysis.

⸻

other

Any route not matching one of the above categories.

⸻

Main Strategy

For each Trip travelling via Norrköping:

1. Read the first-leg train number.
2. Find the Malmö → Stockholm trip using the same train number.
3. Compare:

Direct Malmö → Nyköping price
vs
Malmö → Stockholm price
+
Norrköping → Nyköping price

Initially, the Norrköping → Nyköping ticket can use a fixed price.

Later versions should retrieve the actual ticket price.

⸻

Development Strategy

Version 1

Purpose:

* Prove the concept.

Characteristics:

* Playwright
* HTML parsing
* Regex
* Page scrolling
* Departure-time matching

Version 1 should remain in the repository as a working reference.

⸻

Version 2

Purpose:

Build a clean, modular architecture based entirely on SJ’s API.

Goals:

* Structured JSON
* Internal Trip model
* Exact train-number matching
* Better maintainability
* Easier testing
* Easier future expansion

⸻

Development Rules

1. Keep Version 1 unchanged except for bug fixes.
2. Build Version 2 beside Version 1.
3. Keep all SJ-specific logic inside the API layer.
4. Use Trip objects everywhere else.
5. Keep modules small and testable.
6. Prefer many small verified steps over large rewrites.

⸻

Future Possibilities

Once the API-based architecture is complete, the same foundation can support:

* Other destination pairs
* Alternative route strategies
* Real Mälartåg ticket prices
* Delay analysis
* Connection risk analysis
* Historical price analysis
* Statistical reporting

The long-term goal is to build a reusable train journey analysis engine rather than a single-purpose scraper.
