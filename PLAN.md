# Wake Windows - Application Analysis & Upgrade Plan

## 1. Application Overview

**Wake Windows** is a Vue 3 + TypeScript web application that helps parents of infants calculate ideal napping times based on wake windows, baby age, and sleep recommendations from published sources.

### What it does
- Parents enter their baby's birthday, desired wake time, wake window durations, and bedtime
- The app calculates total nap time, night sleep, wake time, and total sleep
- It compares the schedule against published sleep recommendations (by age bracket)
- URL query string persistence allows sharing schedules via link
- A 24-hour visual bar chart shows the sleep/wake breakdown

---

## 2. Technology Stack (Current)

| Component        | Version   | Current Latest | Status              |
|------------------|-----------|----------------|---------------------|
| Vue              | 3.2.37    | 3.5+           | ~3 major minors behind |
| TypeScript       | 4.6.4     | 5.7+           | Major version behind |
| Vite             | 3.1.0     | 6.x+           | Multiple majors behind |
| Tailwind CSS     | 3.1.8     | 4.x+           | Major version behind |
| @vitejs/plugin-vue | 3.1.0  | 5.x+           | Multiple majors behind |
| vue-tsc          | 0.40.4    | 2.x+           | Major version behind |
| PostCSS          | 8.4.17    | 8.5+           | Minor behind         |
| Autoprefixer     | 10.4.12   | 10.4+          | Current              |
| FontAwesome      | 6.2.0     | 6.7+           | Minor behind         |

### Build Configuration
- **Vite** as build tool with Vue plugin
- **Tailwind CSS** in JIT mode via PostCSS
- **TypeScript** in strict mode, ESNext target
- No test framework configured
- No linting configured (ESLint/Prettier absent)

---

## 3. Architecture & File Map

```
src/
  App.vue                         Root component - just wraps Summary
  main.ts                         Entry point - mounts Vue app
  style.css                       Global styles (Tailwind directives + base)
  components/
    Summary.vue                   Main dashboard - inputs, chart, stats, recommendations
    Recommendations.vue           Displays sleep recs per age bracket with validation
    Validations.vue               STUB - placeholder, not functional
  models/
    ScheduleSetting.ts            Core data model for baby sleep schedule
    SleepRecommendations.ts       Recommendation data, validation logic, bracket matching
  assets/
    logo.png, sun.png, moon.png, sleeping-baby.png, sleeping-baby2.png, happy-baby.png
```

### Data Flow
```
URL Query Params ──> ScheduleSetting (state) ──> Summary.vue (inputs + display)
                                                     │
                                                     ├── Computed: scheduleSummary ──> URL update
                                                     ├── Computed: totalNap, totalSleep, etc.
                                                     └── Recommendations.vue
                                                           └── SleepRecommendation.validate()
```

### State Management
- No Vuex/Pinia - all state lives in `Summary.vue`'s `data()` via a module-level `ScheduleSetting` instance
- URL query string used for persistence (`?bd=YYYY-MM-DD&s=dwt-wws-bed`)
- Side effect in computed property: `scheduleSummary` calls `history.replaceState()`

---

## 4. Bugs Found

### BUG-1: "Total Wake" displays nap time instead of wake time
**File:** `Summary.vue:227`
**Severity:** Medium
```html
<td>{{ schedule.totalNap }}h</td>  <!-- Should be schedule.totalWakeTime -->
```
The "Total Wake" stat in the right column displays `totalNap` instead of `totalWakeTime`.

### BUG-2: Validation error has empty message for nap count
**File:** `SleepRecommendations.ts:54`
**Severity:** Medium
```typescript
errors.push(new ValidationError(``))  // Empty string - no message shown
```
When the nap count is below the minimum, an empty `ValidationError` is pushed. Should contain a meaningful message like: `"At this age, this schedule recommends a minimum of X naps."`

### BUG-3: Max sleep validation logic is inverted
**File:** `SleepRecommendations.ts:45`
**Severity:** High
```typescript
if (this.currentBracket(time).maxSleep > schedule.totalSleep) {
```
This checks if the recommendation max is *greater* than the user's total sleep, which triggers a "no more than" warning when the user is *under* the max. The condition should be:
```typescript
if (schedule.totalSleep > this.currentBracket(time).maxSleep) {
```

### BUG-4: Min sleep validation shows maxSleep value instead of minSleep
**File:** `SleepRecommendations.ts:50`
**Severity:** Medium
```typescript
errors.push(new ValidationError(`...recommends a minimum of ${this.currentBracket(time).maxSleep}...`))
//                                                             ^^^^^^^^ should be minSleep
```

### BUG-5: `weeksSinceBirth` calculation produces negative/incorrect values
**File:** `ScheduleSetting.ts:34`
**Severity:** Medium
```typescript
let ms = -Math.abs(this.birthday.getTime() - new Date().getTime()) / msInWeek;
return Math.round((40 - this.weeks) - ms);
```
The `Math.abs` combined with negation makes the intermediate value always negative. Then subtracting a negative value is effectively adding. The gestational adjustment `(40 - this.weeks)` is subtracted from the age, but the intent is to adjust premature babies to have a younger "adjusted age." The logic is convoluted and likely produces incorrect results for non-40-week babies.

### BUG-6: `monthsSinceBirth` does not account for gestational age adjustment
**File:** `ScheduleSetting.ts:39-44`
**Severity:** Low
`weeksSinceBirth` adjusts for gestational age (weeks in womb), but `monthsSinceBirth` does not. This means the recommendations bracket lookup (which uses months) ignores prematurity.

### BUG-7: Debug/placeholder code in Recommendations.vue
**File:** `Recommendations.vue:55-59, 66-70, 77`
**Severity:** Low (cosmetic/debug)
- Line 55: `v-if="sleepSchedule.wws.length === 99"` - impossible condition, debug leftover
- Line 57: `qwer {{ sleepSchedule.wws.length }}ss` - debug text
- Line 66-70: `v-if="false"` block with placeholder text `sdf`
- Line 77: `{{ rec.brackets }}` dumps raw bracket objects into the UI

### BUG-8: Unused FontAwesome import
**File:** `SleepRecommendations.ts:1`
**Severity:** Low
```typescript
import { faMultiply } from "@fortawesome/free-solid-svg-icons";
```
This import is unused and should be removed.

### BUG-9: `startBracket` getter has incorrect sort comparison
**File:** `SleepRecommendations.ts:61`
**Severity:** Low
```typescript
return this.brackets.sort((n1, n2) => n1.months[0] - n2.months[1])[0];
//                                                        ^^^^^^^^ should be n2.months[0]
```
Compares `months[0]` of n1 with `months[1]` of n2, mixing start and end month values.

### BUG-10: Day Sleep column missing "You" value in Recommendations
**File:** `Recommendations.vue:50-53`
**Severity:** Medium
```html
<td>Day Sleep</td>
<td class="w-4">{{ b.daySleep[0] }}</td>
<td class="w-4">{{ b.daySleep[1] }}</td>  <!-- Missing "You" column -->
```
The table header has a "You" column, but Day Sleep and Night Sleep rows only show min/max - no user value. Should display `schedule.totalNap` for day sleep and `schedule.totalNightSleep` for night sleep.

### BUG-11: Console.log left in production code
**File:** `Summary.vue:14`
**Severity:** Low
```typescript
console.log(hash)
```

### BUG-12: Side effect in computed property
**File:** `Summary.vue:54`
**Severity:** Medium (anti-pattern)
```typescript
history.replaceState(null, "", `?bd=${this.schedule.birthdayDate}&s=${shorthand}`);
```
Computed properties should be pure. URL updates should happen in a `watch` or method.

---

## 5. Missing Implementations

### MISSING-1: Validations.vue is a stub
The component exists but only displays "I'm a validation" and `totalNap`. It was intended to show validation warnings but was never completed. The validation logic exists in `SleepRecommendations.ts` but `Validations.vue` doesn't use it. Currently, validation display is partially handled inline in `Recommendations.vue`.

### MISSING-2: No age brackets beyond 7 months
The recommendation data only covers ages 3-7 months. Babies 0-3 months and 7+ months (up to ~2 years) have no recommendations. This is a significant gap since wake windows are relevant through toddlerhood.

### MISSING-3: No mobile/responsive layout
The layout uses a fixed `grid-cols-[30%_70%]` split. On mobile devices, the input panel and results panel will be cramped. No responsive breakpoints for stacking on small screens.

### MISSING-4: No test suite
No test files, no test framework configured. The calculation logic in `ScheduleSetting.ts` and validation logic in `SleepRecommendations.ts` would benefit from unit tests.

### MISSING-5: FontAwesome imported but never used in templates
FontAwesome dependencies are installed and configured nowhere in the actual component templates. The only icons used are PNG image files.

### MISSING-6: Nap timing display missing
The app calculates wake windows and total nap time, but doesn't display the actual nap schedule (e.g., "Nap 1: 9:00 AM - 10:30 AM"). This would be the most useful feature for parents.

### MISSING-7: No input validation
- Wake windows accept negative numbers
- Bedtime/wake time can produce negative night sleep values
- No validation that the schedule adds up to 24 hours
- No feedback when impossible values are entered

---

## 6. Upgrade Opportunities

### Priority 1: Dependency Upgrades
1. **Vite 3 -> 6**: Major performance improvements, better TypeScript support
2. **TypeScript 4.6 -> 5.7**: Template literal types, satisfies operator, decorator metadata
3. **Vue 3.2 -> 3.5**: Improved reactivity, better TypeScript integration, `defineModel`
4. **vue-tsc 0.40 -> 2.x**: Renamed to `vue-tsc`, major improvements
5. **Tailwind CSS 3.1 -> 4.x**: New engine, CSS-first configuration, significant changes

### Priority 2: Architecture Modernization
1. **Composition API**: Migrate from Options API (`defineComponent`) to `<script setup>` with Composition API
2. **Pinia for state**: Extract shared state from component-level `data()` into a Pinia store
3. **Remove module-level side effects**: The `Summary.vue` file runs URL parsing at import time outside the component lifecycle

### Priority 3: Code Quality
1. Add ESLint + Prettier
2. Add Vitest for unit testing
3. Remove dead code (unused FontAwesome, debug remnants)

---

## 7. Implementation Plan

### Phase 1: Bug Fixes (No dependency changes)
These can be done immediately on the current stack:

1. **Fix BUG-1**: Change `schedule.totalNap` to `schedule.totalWakeTime` in Summary.vue:227
2. **Fix BUG-2**: Add proper error message for nap count validation in SleepRecommendations.ts:54
3. **Fix BUG-3**: Invert the max sleep validation condition in SleepRecommendations.ts:45
4. **Fix BUG-4**: Change `maxSleep` to `minSleep` in the min sleep error message in SleepRecommendations.ts:50
5. **Fix BUG-7**: Remove all debug/placeholder code from Recommendations.vue (lines 55-59, 66-70, 77)
6. **Fix BUG-8**: Remove unused `faMultiply` import from SleepRecommendations.ts
7. **Fix BUG-9**: Fix `startBracket` sort comparison
8. **Fix BUG-10**: Add "You" values for Day Sleep and Night Sleep rows in Recommendations.vue
9. **Fix BUG-11**: Remove `console.log(hash)` from Summary.vue
10. **Fix BUG-12**: Move URL update from computed property to a `watch`

### Phase 2: Missing Feature Completion
1. Complete or remove `Validations.vue` - consolidate validation display in Recommendations.vue
2. Add input validation (non-negative wake windows, sane ranges)
3. Fix `weeksSinceBirth` and `monthsSinceBirth` to correctly handle gestational age

### Phase 3: Dependency Upgrades
1. Upgrade Vite, TypeScript, Vue, vue-tsc, Tailwind, and related tooling
2. Fix any breaking changes from upgrades
3. Verify the app still builds and runs

### Phase 4: Architecture Improvements (Optional, future)
1. Migrate to Composition API / `<script setup>`
2. Add Pinia state management
3. Add Vitest unit tests
4. Add ESLint + Prettier
5. Add expanded age bracket recommendations
6. Add nap timing schedule display
7. Add mobile responsive layout
