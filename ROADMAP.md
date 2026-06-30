# SJ Price Watch

Roadmap and long-term vision.

---

# Project Vision

Build a reliable and maintainable train price monitoring engine that automatically:

- monitors one or more train routes
- stores historical price snapshots
- detects meaningful price changes
- generates alerts
- notifies the user
- provides long-term price statistics

The project is built in small, well-defined iterations where infrastructure comes before features.

---

# Current Status

Current version:

**v2.0 — Multi Route Snapshot Engine**

Completed:

- ✅ SJ API integration
- ✅ Journey service
- ✅ Trip mapping
- ✅ Offer extraction
- ✅ Price snapshot generation
- ✅ Snapshot storage
- ✅ Snapshot comparison
- ✅ Alert engine (v1)
- ✅ Route configuration
- ✅ Multi-route architecture
- ✅ Route-specific snapshot history

---

# Version 3

Focus:
**Automation and smarter alerts**

## 3.1 Stabilization

Goal:
Verify that the current architecture is stable.

Tasks

- [ ] Verify multiple routes
- [ ] Verify snapshot history
- [ ] Verify comparisons
- [ ] Verify alerts
- [ ] Clean up remaining technical debt
- [ ] Improve logging

---

## 3.2 Alert Engine

Goal:
Make alerts configurable and more useful.

Tasks

- [ ] Alert when lowest price decreases
- [ ] Alert when price falls below configured limit
- [ ] Alert on new historical lowest price
- [ ] Alert when trip price changes by X SEK
- [ ] Route-specific alert configuration

---

## 3.3 Automation

Goal:
Run the system automatically.

Tasks

- [ ] Scheduled GitHub workflow
- [ ] Automatic snapshot generation
- [ ] Automatic comparisons
- [ ] Automatic alerts

---

## 3.4 Notifications

Goal:
Notify the user only when something interesting happens.

Tasks

- [ ] Console output
- [ ] Email notifications
- [ ] Telegram notifications (optional)
- [ ] Discord notifications (optional)

---

# Version 4

Focus:
Historical analysis.

## Statistics

- [ ] Historical price database
- [ ] Lowest recorded price
- [ ] Highest recorded price
- [ ] Average price
- [ ] Price timeline
- [ ] Cheapest booking window
- [ ] Historical alert log

## Dashboard

- [ ] Route overview
- [ ] Historical charts
- [ ] Alert history
- [ ] Snapshot browser

---

# Version 5

Focus:
Web application.

Tasks

- [ ] Route management
- [ ] Station dropdowns
- [ ] Calendar picker
- [ ] Alert configuration
- [ ] Dashboard
- [ ] User settings

---

# Future Ideas

These ideas are intentionally postponed.

- Cheapest departure prediction
- Price trend analysis
- Flexible travel dates
- Return journeys
- Multiple passengers
- Class monitoring
- Alternative departure stations
- Historical statistics API
- Mobile application

---

# Development Principles

The project follows a few simple principles.

## Keep services small

Each service should have one clear responsibility.

## Prefer configuration over hardcoded values

Behavior should be controlled through configuration whenever possible.

## Build infrastructure first

A stable foundation makes future features easier to build.

## Small iterations

Build the smallest useful feature first.

## Refactor continuously

Improve architecture before complexity grows.

## Simplicity over cleverness

Readable code is preferred over complex solutions.

---

# Current Architecture

```
Config
   │
   ▼
Journey Service
   │
   ▼
Price Snapshot Service
   │
   ▼
Snapshot Storage Service
   │
   ▼
Price Comparison Service
   │
   ▼
Alert Service
```

Each layer has a single responsibility and can evolve independently.

## Definition of Done

A feature is considered complete when:

- [ ] Code is implemented
- [ ] Feature has been verified
- [ ] Documentation is updated
- [ ] ROADMAP is updated if needed
- [ ] CHANGELOG is updated
- [ ] Changes are committed
