# Steps Tracker

## Current State
New project, no existing app.

## Requested Changes (Diff)

### Add
- Daily step counter with a configurable daily goal (default: 10,000 steps)
- Quick-add buttons (+500, +1000, +2000 steps)
- Manual step entry input
- Progress bar showing current steps vs goal
- Daily history list (last 7 days)
- Reset/new day functionality
- Persist data in backend

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store daily step logs (date + step count), support adding steps, getting today's steps, getting recent history, resetting today
2. Frontend: single-page minimalist UI with today's count prominent, progress bar, quick-add buttons, manual input, 7-day history
