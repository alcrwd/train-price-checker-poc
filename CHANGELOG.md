# Changelog

All notable changes to this project will be documented in this file.

The project follows semantic versioning where possible.

---

# v2.0.0 — Multi Route Snapshot Engine

Released: 2026-06-30

## Added

- SJ API integration
- Journey service
- Trip mapping
- Offer extraction
- Price snapshot generation
- Snapshot storage
- Snapshot comparison
- Alert engine (v1)
- Route configuration
- Multi-route support
- Route-specific snapshot history
- Roadmap documentation

## Changed

- Snapshot storage is now organized per route.
- Price snapshot workflow now reads routes from configuration.
- Alert generation is separated into its own service.
- Project architecture has been refactored into small services with single responsibilities.

## Removed

- Legacy comparison workflow
- Temporary comparison JSON files
- Experimental proof-of-concept scripts no longer used

---

# Upcoming

## v3.0

Planned focus:

- Architecture stabilization
- Smarter alert rules
- Automated scheduled scans
- Notifications
