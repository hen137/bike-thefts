# Date Range Picker for DrawerPanel — Design Spec

**Date:** 2026-06-02  
**Status:** Approved

---

## Overview

Add a `DateRangePicker` component to the DrawerPanel's "Range Settings"
section, directly above the `HeatSlider`. It shows two month/year pickers
separated by a dash. Picker values and slider values stay in sync
bidirectionally. Date selection is constrained to the min/max dates
available in the SQLite database.

---

## Component Structure

**New file:** `components/map/DateRangePicker.tsx`

Contains two exports:

- `MonthPicker` — single popover-based month/year selector (internal)
- `DateRangePicker` — composes two `MonthPicker` instances with a dash

**Placement in `DrawerPanel.tsx`:** Inside the "Range Settings" `<div>`,
above `<HeatSlider>`. No new props added to `DrawerPanel` —
`DateRangePicker` receives `sliderValues`, `setSliderValue`, and
`commitSliderValues`, which DrawerPanel already holds.

**DB bounds:** `DateRangePicker` calls `useDbContext` directly to read
`initResult.minDate` and `initResult.maxDate`. No prop drilling required.

---

## Data Flow

### Slider → Picker (display)

`DateRangePicker` derives `startDate` and `endDate` on every render:

```ts
const { startDate, endDate } = calcRawSliderToDates(
  sliderValues,
  MAX_RANGE, // 1000
  { lowerBound, upperBound }
);
```

No internal date state — display is always computed from `sliderValues`.

### Picker → Slider (on selection)

When the user selects a month in either picker:

```ts
const newVal = calcDatesToRawSlider(monthYear, MAX_RANGE, {
  lowerBound,
  upperBound
});
setSliderValue([newStart, newEnd]);
commitSliderValues([newStart, newEnd]);
```

Selecting a month is an intentional action, so it commits immediately
and triggers the DB query.

---

## New Utility Function

Add to `lib/utils.ts`:

```ts
export function calcDatesToRawSlider(
  monthYear: MonthYear,
  sliderRange: number,
  dateBounds: { lowerBound: Date; upperBound: Date }
): number;
```

**Logic:**

```text
totalMonths  = monthDelta(lowerBound, upperBound)
targetMonths = monthDelta(lowerBound, monthYear)
return Math.min(
  Math.max(Math.round(targetMonths / totalMonths * sliderRange), 0),
  sliderRange
)
```

Where `monthDelta(a, b) = (b.year - a.year) * 12 + (b.month - a.month)`.

---

## MonthPicker UI

Each picker is a shadcn `Popover`.

**Trigger button:** Displays current selection as `"Jan 2022"`. Shows
`"Select..."` placeholder when bounds are not yet loaded.

**Popover content:**

```text
  ‹  2022  ›
  Jan  Feb  Mar  Apr
  May  Jun  Jul  Aug
  Sep  Oct  Nov  Dec
```

- **Year nav:** ghost `Button` arrows. Disabled at min/max year boundary.
- **Month grid:** 12 abbreviated month buttons in a 4×3 grid.
  - Selected month: filled highlight.
  - Months outside DB bounds: disabled.
  - Months that would cross the opposite picker's date: disabled.
- Selecting a month closes the popover and fires the sync.

**Constraints:**

- Start picker upper bound: current `endDate`
- End picker lower bound: current `startDate`
- Both pickers hard-bounded by `initResult.minDate` / `initResult.maxDate`

---

## Layout

```text
[ Jan 2022 ]  –  [ Nov 2024 ]
[════════════════════════════]   ← HeatSlider
```

Row: `flex items-center gap-2`. The dash is a plain `<span>–</span>`.

---

## Files Changed

- `lib/utils.ts` — add `calcDatesToRawSlider`
- `components/map/DateRangePicker.tsx` — new file
- `components/map/DrawerPanel.tsx` — render `DateRangePicker` above slider
- `components/map/index.ts` — export `DateRangePicker`
