# Architecture
## Purpose
This project compares train ticket strategies.
The main question is:
Can it be cheaper to buy a Malmö → Stockholm ticket, get off in Norrköping, and continue with a separate Norrköping → Nyköping ticket, compared with buying Malmö → Nyköping directly?
## Version 1
Version 1 proved the idea by reading SJ's rendered website.
It used:
- Playwright
- page text parsing
- regex
- scrolling to trigger lazy-loaded prices
- matching by departure time
Version 1 should be kept as a working reference, but not expanded further.
## Version 2
Version 2 should use SJ's API responses as the source of truth.
The goal is to avoid:
- HTML parsing
- regex against page text
- scroll-based loading logic
- UI text such as "Hämtar pris"
Instead, the project should use structured JSON from SJ's API.
## Core principle
SJ JSON should only be handled in the API layer.
The rest of the project should work with our own internal object:
```js
Trip

A Trip represents one complete travel option in our own format.

Proposed structure

src/
  api/
    sjApi.js
    tripMapper.js
  services/
    offerService.js
    matchService.js
    analysisService.js
scan-date-range-api.js

Module responsibilities

src/api/sjApi.js

Responsible for communication with SJ.

It should:

* open/search SJ routes
* capture or fetch departures/search
* capture or fetch offers
* return raw SJ JSON

No business logic should live here.

src/api/tripMapper.js

Responsible for converting raw SJ JSON into Trip objects.

This should be the only place that knows about SJ fields such as:

departure.legs[0].serviceName
departure.legs[0].arrivalDateTime
departure.legs[1].departureDateTime

Everything outside this file should use our own fields:

trip.firstLeg.trainNumber
trip.firstLeg.arrival
trip.secondLeg.departure

src/services/offerService.js

Responsible for attaching prices to trips.

It should read SJ offer data and map the cheapest relevant available price to the correct Trip.

src/services/matchService.js

Responsible for matching comparable trips.

For the main strategy, matching should primarily use the first leg train number:

Malmö → Nyköping first leg train number
matches
Malmö → Stockholm train number

Example:

522 ↔ 522
524 ↔ 524
528 ↔ 528
530 ↔ 530

src/services/analysisService.js

Responsible for calculating:

* direct price
* alternative price
* saving
* travel time
* waiting time in Norrköping
* connection quality

Trip object

A Trip should look roughly like this:

{
  id: "69bb0260-41ae-3765-85c0-7ef14d612151",
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
    operator: "Mälartåg",
    brand: null
  },
  changeMinutes: 14,
  routeType: "via-norrkoping"
}

Route types

The scanner should classify trips.

via-norrkoping

Relevant for the main strategy.

Rules:

trip.firstLeg.to === "Norrköping Central"
trip.secondLeg.from === "Norrköping Central"

via-stockholm

Not part of the main strategy for now.

These trips should be excluded from the main savings analysis unless we explicitly build a separate strategy later.

other

Any trip that does not match the expected strategy.

Main analysis strategy

For each direct Malmö → Nyköping trip via Norrköping:

1. Read first leg train number.
2. Find Malmö → Stockholm trip with the same train number.
3. Compare:

Malmö → Nyköping direct price
vs
Malmö → Stockholm price
+
Norrköping → Nyköping price

For now, Norrköping → Nyköping can use an assumed fixed price.

Later, this should be replaced with actual price data if available.

Important discovery

SJ’s rendered web page does not always show train numbers for combined Malmö → Nyköping trips.

However, the API does show them in legs.

Example:

departure.legs[0].serviceName // "522"
departure.legs[1].serviceName // "224"

This is why Version 2 should use the API rather than the rendered page text.

Development rules

1. Keep Version 1 as a reference.
2. Do not add more major logic to the text parser.
3. Build Version 2 beside Version 1.
4. Keep SJ-specific JSON handling inside src/api.
5. Let all other modules work with Trip.
6. Prefer small testable steps over large rewrites.

After that, commit with:
```bash
git add ARCHITECTURE.md
git commit -m "Document API architecture"
git push origin main
