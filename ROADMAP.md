# Best Train Price

Roadmap and long-term vision.

---

# Vision

Build the best tool for finding the cheapest practical train journey.

The goal is to help travellers compare train journeys over a chosen date or travel period and easily find the best option.

The project should always present the complete picture first, allowing users to sort and filter the results according to their own preferences.

---

# Current Version

## v2.0.0 — Core Journey Engine

Completed

- ✅ SJ API integration
- ✅ Journey collection
- ✅ Journey parsing
- ✅ Offer extraction
- ✅ Price snapshot generation
- ✅ Historical snapshot storage
- ✅ Snapshot comparison
- ✅ Route configuration
- ✅ Multi-route support
- ✅ GitHub Actions automation
- ✅ Minimal web interface

---

# Version 3

## Goal

Version 3 focuses on building a complete journey search experience.

The objective is simple:

> Perform one search, build one dataset, and allow the user to explore it without performing additional searches.

---

## 3.1 Search

The user should be able to search using:

- Origin
- Destination
- Single travel date
- Date range

These are the only required fields.

---

## 3.2 Journey Dataset

Every search creates one dataset.

The dataset should contain every matching journey returned from SJ.

The dataset remains available while the user explores the results.

Design principle:

> One search creates one dataset.
>
> Sorting and filtering never trigger another search.

---

## 3.3 Results

Display every journey in the dataset.

Each journey should include:

- Price
- Travel date
- Departure time
- Arrival time
- Journey duration
- Number of changes
- Change station(s)
- Change duration(s)
- Train number(s)

No journeys should be hidden unless the user chooses to filter them.

---

## 3.4 Sorting

Sorting happens locally.

Supported sorting:

- Price
- Departure time
- Arrival time
- Journey duration
- Number of changes

Changing the sorting order must never contact SJ.

---

## 3.5 Filters

Filters are optional.

The filter panel is collapsed by default.

Initially supported filters:

- Departure time interval
- Arrival time interval

Changing filters updates the existing dataset instantly.

Changing filters must never contact SJ.

If filters are active, display the number of active filters.

Example:

Filter (2)

---

# Version 3 Scope Lock

Version 3 intentionally excludes:

- Booking recommendations
- Split-ticket optimisation
- Travel score
- AI features
- Maximum price
- Maximum journey duration
- Direct-train filter
- Advanced filters
- Notifications
- Historical analysis

These features belong to later versions.

---

# Version 4

## Travel Analysis

Once Version 3 is complete, the project moves from search to analysis.

Possible features:

- Cheapest travel day
- Historical price analysis
- Compare travel dates
- Journey statistics
- Price trends

---

# Version 5

## Booking Optimisation

Future versions may include:

- Booking recommendations
- Split-ticket analysis
- Cheapest booking strategy
- Savings calculations
- Intelligent recommendations

---

# Design Principles

## Build one layer at a time

Finish one layer before starting the next.

---

## Keep services small

Each service should have one responsibility.

---

## Backend owns business logic

Journey collection, analysis and future recommendations belong in the backend.

The frontend presents the results.

---

## Configuration over hardcoded values

Behaviour should be driven by configuration whenever possible.

---

## Search once

One search creates one dataset.

---

## Filter locally

Sorting and filtering always work on the existing dataset.

---

## Keep the UI simple

The user should only need to provide:

- Origin
- Destination
- Travel date or date range

Everything else is optional.

---

## Avoid scope creep

Good ideas are collected for future versions.

Version 3 should remain focused on building the best possible search experience.
