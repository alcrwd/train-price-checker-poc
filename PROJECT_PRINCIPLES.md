# Best Train Price – Project Principles

These principles guide every product and technical decision.

If a new idea conflicts with these principles, the principles always win.

---

# 1. Build one thing at a time

Every sprint should have one clear goal.

Avoid introducing multiple new concepts in the same sprint.

Small commits.
Small sprints.
Frequent testing.

---

# 2. Keep it simple

Choose the simplest solution that solves today's problem.

Never build functionality for possible future needs.

Version 5 can solve Version 5 problems.

---

# 3. Verify before expanding

Every feature must work before the next feature is started.

Never continue building on an unverified solution.

---

# 4. Backend creates. Frontend presents.

The backend is responsible for:

- datasets
- analysis
- travel options

The frontend is responsible for displaying data.

The UI should never recreate backend logic.

---

# 5. Show all valid travel options

The application should never decide which option is best.

If a travel option is valid, it should be shown.

Examples:

- Standard SJ ticket
- Stockholm ticket + transfer
- Split tickets
- Future ticket combinations

---

# 6. The user decides

The application analyses.

The user decides.

Use filtering and sorting instead of recommendations.

Examples:

- Maximum transfer time
- Departure time
- Arrival time
- Direct trains
- Train / Bus
- Ticket strategy

---

# 7. Never hide information

Always explain how a travel option works.

If the traveller needs to:

- buy another destination
- leave the train early
- buy multiple tickets

show it clearly.

The user should immediately understand:

- what to buy
- which train to board
- where to leave the train
- why the option exists

---

# 8. Data model first

Always build the data model before building the UI.

If the model feels wrong, improve the model first.

---

# 9. Never hardcode product logic

Avoid logic that only works for one route.

Bad:

Stockholm-specific rules.

Good:

Match the same train.

Create travel options.

Compare ticket combinations.

---

# 10. Build reusable analysis

Every new analysis should be reusable.

Example:

Train matching

↓

Travel option generation

↓

Ticket comparison

↓

Future analyses

---

# 11. One feature = one question

Every feature should answer one clear question.

Examples:

Can we match the same train?

Can we create another travel option?

Can we compare ticket prices?

Can we display every valid alternative?

If the question is unclear, the feature is too large.

---

# 12. The app should analyse — never guess

Only create travel options that are supported by data.

Never invent routes.

Never assume connections.

Never recommend.

Analyse.

Present.

Let the user decide.

---

These principles are intentionally difficult to change.

Every change should improve the product without making it more complicated.
