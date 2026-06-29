# SJ API Research

## Status

Project phase: Research

Goal:
Understand SJ's internal booking API well enough to build a stable API-based client without relying on HTML parsing.

---

## Confirmed findings

### departures/search

Status: ✅ Verified

Returns all departures for a search.

Current observation:

- One request returns all departures.
- Search on 2026-07-15 returned 14 departures.

Output contains:

- travels
- departures
- departureId
- legs
- stations
- train numbers

---

### offers

Status: ✅ Verified

Endpoint:

GET /departures/{departureId}/offers

Observed query parameter:

passengerListId

Returns:

- seatOffers
- prices
- availability

Current implementation only receives offers that SJ's frontend chooses to request.

Long-term goal:

Request offers directly for every departureId.

---

## Unknown

### passengerListId

Status: 🔍 Under investigation

Known facts:

- Required by the offers endpoint.
- Appears as a query parameter.
- Same passengerListId is reused across multiple offer requests during a session.

Unknown:

- Which endpoint creates it.
- Whether it is tied to a booking session.
- Whether it expires.
- Whether it can be reused.

---

## Next research

Goal:

Identify where passengerListId is created.

Possible sources:

- Request
- Response
- Cookie
- LocalStorage
- SessionStorage
