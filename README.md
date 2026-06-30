# Best Train Price

Find the cheapest practical way to travel by train.

Best Train Price is an open-source project that analyses train journeys, ticket prices and booking strategies to recommend the cheapest practical way to travel between two locations.

Rather than simply monitoring prices, the project continuously collects journey data, builds historical price datasets and analyses different booking options to help travellers save money.

---

# Vision

The goal is to answer questions such as:

- What is the cheapest way to travel?
- Which ticket should I buy?
- Which train should I board?
- Should I buy one ticket or several?
- Is buying a longer ticket actually cheaper?
- Which travel date gives the lowest total cost?
- When should I book?

Price monitoring is only one tool used to achieve this goal.

The primary objective is to recommend the best booking strategy.

---

# Current Status

Current version:

**v2.0.0**

Implemented:

- SJ journey collection
- Journey parsing
- Offer extraction
- Price snapshot generation
- Historical snapshot storage
- Multi-route support
- Snapshot comparison
- Basic recommendation engine
- Minimal web interface

The project now has a stable technical foundation for future travel analysis.

---

# Architecture

```
Journey Collection
        │
        ▼
Snapshot Generation
        │
        ▼
Historical Storage
        │
        ▼
Travel Analysis
        │
        ▼
Booking Optimizer
        │
        ▼
Travel Recommendations
        │
        ▼
Optional Notifications
```

Each layer has a single responsibility.

---

# Project Structure

```
config/
    routes.json

src/
    lib/
    services/

scripts/

data/
    snapshots/

.github/

README.md
ROADMAP.md
CHANGELOG.md
```

---

# Roadmap

The project is developed in small iterations.

Current priorities include:

- Search journeys across travel periods.
- Compare prices between travel dates.
- Analyse historical pricing.
- Compare alternative booking strategies.
- Recommend the cheapest practical journey.

Future versions may include:

- Split-ticket optimisation.
- Historical price statistics.
- Smart booking recommendations.
- Notifications.
- Web dashboard.

See **ROADMAP.md** for the complete roadmap.

---

# Design Principles

The project follows a few simple principles.

## Build infrastructure first

A stable foundation makes future features easier to build.

## Small iterations

Build the smallest useful feature before adding complexity.

## One responsibility per service

Each service should solve one problem well.

## Backend owns business logic

Journey analysis and booking recommendations belong in the backend.

The frontend is responsible for presenting the results.

## Configuration over hardcoded values

Application behaviour should be driven by configuration whenever possible.

---

# Long-term Vision

The current implementation uses SJ as its initial data source.

The architecture is intentionally generic enough to support additional operators in the future.

Potential future integrations include:

- Mälartåg
- Snälltåget
- Öresundståg
- Regional operators
- Additional rail providers

The long-term vision is to become a train travel optimisation platform rather than a traditional price monitoring service.

---

# License

This project is released as open source.

The specific license will be decided in a future release.
