# Best Train Price

Roadmap and long-term vision.

---

# Project Vision

Build the best tool for finding the cheapest practical train journey.

The project analyses train journeys, ticket prices and booking strategies to recommend the cheapest way to travel between two locations.

Price monitoring is only one tool used to achieve this goal.

---

# Current Status

Current version:

**v2.0.0 — Core Journey Engine**

Completed:

- ✅ SJ journey collection
- ✅ Journey parsing
- ✅ Offer extraction
- ✅ Snapshot generation
- ✅ Historical snapshot storage
- ✅ Snapshot comparison
- ✅ Route configuration
- ✅ Multi-route support
- ✅ Minimal web interface

---

# Version 3

Focus:
**Search & Travel Analysis**

The goal of Version 3 is to build the foundation for finding the cheapest practical train journey.

The application should first collect a complete dataset for a search and then allow the user to explore it without performing additional searches.

---

## 3.1 Search

Goal:
Create a simple but powerful search interface.

Tasks

- [ ] Search by origin
- [ ] Search by destination
- [ ] Search by single date
- [ ] Search by date range

---

## 3.2 Dataset

Goal:
One search creates one journey dataset.

Tasks

- [ ] Collect all journeys for the search
- [ ] Store the dataset in memory
- [ ] Keep the dataset available while the user explores the results

Design principle

> A search creates a dataset.
> Filters and sorting never require a new search.

---

## 3.3 Sorting

Goal:
Allow the user to change how journeys are presented.

Tasks

- [ ] Sort by price
- [ ] Sort by departure time
- [ ] Sort by arrival time
- [ ] Sort by journey duration
- [ ] Sort by number of changes

---

## 3.4 Filters

Goal:
Filter the existing dataset without contacting SJ again.

Tasks

- [ ] Departure time interval
- [ ] Arrival time interval

The filter panel should be collapsible.

Show the number of active filters.

Example:

Filter (2)

---

## 3.5 Results

Goal:
Present all matching journeys.

Tasks

- [ ] Journey cards
- [ ] Price
- [ ] Departure time
- [ ] Arrival time
- [ ] Journey duration
- [ ] Number of changes
- [ ] Change location
- [ ] Change duration
- [ ] Train numbers

The user should always be able to remove filters and immediately see additional journeys without performing another search.

---

## 3.6 Future extensions

Planned, but intentionally postponed.

- Maximum price
- Maximum journey duration
- Maximum number of changes
- Direct trains only
- Split-ticket suggestions
- Booking recommendations
