# Date Conversion Guide

Guide for converting natural language date expressions to JQL date syntax.

## Relative Dates

### Days

| Natural Language | JQL Syntax | Meaning |
|-----------------|------------|---------|
| "today" | `>= startOfDay()` | From midnight today |
| "yesterday" | `>= startOfDay(-1) AND < startOfDay()` | All day yesterday |
| "last 7 days" | `>= -7d` | Past 7 days including today |
| "last week" | `>= startOfWeek(-1) AND < startOfWeek()` | Previous calendar week |
| "past 3 days" | `>= -3d` | Last 3 days |
| "next 7 days" | `<= 7d AND >= 0d` | Upcoming 7 days |

### Weeks

| Natural Language | JQL Syntax | Meaning |
|-----------------|------------|---------|
| "this week" | `>= startOfWeek()` | From start of current week |
| "last week" | `>= startOfWeek(-1) AND < startOfWeek()` | Previous week |
| "last 2 weeks" | `>= -14d` | Past 14 days |
| "next week" | `>= startOfWeek(1) AND < startOfWeek(2)` | Next calendar week |

### Months

| Natural Language | JQL Syntax | Meaning |
|-----------------|------------|---------|
| "this month" | `>= startOfMonth()` | From start of current month |
| "last month" | `>= startOfMonth(-1) AND < startOfMonth()` | Previous calendar month |
| "last 30 days" | `>= -30d` | Past 30 days |
| "last 3 months" | `>= -90d` | Past ~90 days |
| "next month" | `>= startOfMonth(1) AND < startOfMonth(2)` | Next calendar month |

### Years

| Natural Language | JQL Syntax | Meaning |
|-----------------|------------|---------|
| "this year" | `>= startOfYear()` | From start of current year |
| "last year" | `>= startOfYear(-1) AND < startOfYear()` | Previous calendar year |
| "last 365 days" | `>= -365d` | Past year (rolling) |

## Absolute Dates

### Specific Dates

```jql
# Exact date
created = "2024-01-15"

# On or after date
created >= "2024-01-15"

# Before date
created < "2024-02-01"

# Between dates
created >= "2024-01-01" AND created < "2024-02-01"
```

### Date Ranges

```jql
# January 2024
created >= "2024-01-01" AND created < "2024-02-01"

# Q1 2024
created >= "2024-01-01" AND created < "2024-04-01"

# First half of 2024
created >= "2024-01-01" AND created < "2024-07-01"
```

## Conversion Strategies

### Strategy 1: Relative Time Phrases

**Pattern:** "last N [unit]"

1. Identify unit (days, weeks, months)
2. Calculate days: weeks × 7, months × 30
3. Use `-Nd` format

**Examples:**
- "last 5 days" → `-5d`
- "last 2 weeks" → `-14d`
- "last 3 months" → `-90d`

### Strategy 2: Calendar Periods

**Pattern:** "this/last [period]"

1. Identify period (week, month, year)
2. Use start function with offset
3. Add range for "last"

**Examples:**
- "this week" → `startOfWeek()`
- "last week" → `startOfWeek(-1) AND < startOfWeek()`
- "this month" → `startOfMonth()`
- "last month" → `startOfMonth(-1) AND < startOfMonth()`

### Strategy 3: Future Dates

**Pattern:** "next N [unit]" or "in N [unit]"

1. Use positive offset
2. Add lower bound to exclude past

**Examples:**
- "next 7 days" → `<= 7d AND >= 0d`
- "in 2 weeks" → `>= 14d AND <= 14d`
- "due next month" → `>= startOfMonth(1) AND < startOfMonth(2)`

### Strategy 4: Specific Mentions

**Pattern:** "on [date]" or "[month] [day]"

1. Parse date components
2. Format as YYYY-MM-DD
3. Use equality or range

**Examples:**
- "on January 15th" → `= "2024-01-15"`
- "after March 1st" → `>= "2024-03-01"`
- "before end of year" → `< "2025-01-01"`

## Field-Specific Date Queries

### Created Date

```jql
# Issues created today
created >= startOfDay()

# Issues created this week
created >= startOfWeek()

# Issues created in January 2024
created >= "2024-01-01" AND created < "2024-02-01"
```

### Updated Date

```jql
# Issues updated in last 24 hours
updated >= -24h

# Issues updated this week
updated >= startOfWeek()

# Issues not updated in 30 days
updated < -30d
```

### Resolved Date

```jql
# Resolved today
resolved >= startOfDay()

# Resolved this month
resolved >= startOfMonth()

# Resolved in Q1
resolved >= "2024-01-01" AND resolved < "2024-04-01"
```

### Due Date

```jql
# Due today
duedate = now()

# Due this week
duedate >= startOfWeek() AND duedate <= endOfWeek()

# Overdue
duedate < now() AND status != Closed

# Due in next 7 days
duedate <= 7d AND duedate >= 0d
```

## Time Units

### Supported Units

- `m` - Minutes (e.g., `-30m`)
- `h` - Hours (e.g., `-24h`)
- `d` - Days (e.g., `-7d`)
- `w` - Weeks (e.g., `-2w`)

**Note:** Months and years don't have direct abbreviations. Use days or functions.

### Unit Conversion

| Period | Days | JQL |
|--------|------|-----|
| 1 week | 7 | `-7d` or `-1w` |
| 2 weeks | 14 | `-14d` or `-2w` |
| 1 month | ~30 | `-30d` |
| 3 months | ~90 | `-90d` |
| 6 months | ~180 | `-180d` |
| 1 year | 365 | `-365d` |

## Common Ambiguities

### "Last Week" vs "Past Week"

- **"last week"** = Previous calendar week
  - JQL: `>= startOfWeek(-1) AND < startOfWeek()`

- **"past week"** = Last 7 days
  - JQL: `>= -7d`

### "This Month" vs "Last 30 Days"

- **"this month"** = Current calendar month
  - JQL: `>= startOfMonth()`

- **"last 30 days"** = Rolling 30-day period
  - JQL: `>= -30d`

### "Yesterday" vs "Last Day"

- **"yesterday"** = All day yesterday
  - JQL: `>= startOfDay(-1) AND < startOfDay()`

- **"last day"** = Past 24 hours
  - JQL: `>= -1d`

## Advanced Patterns

### Exclude Weekends

```jql
# No direct JQL support
# Use created >= startOfWeek() for week-based filtering
```

### Business Hours

```jql
# No direct support in JQL
# Filter by day range instead
```

### Fiscal Year

```jql
# If fiscal year starts April 1
created >= "2024-04-01" AND created < "2025-04-01"
```

### Quarter

```jql
# Q1 (Jan-Mar)
created >= "2024-01-01" AND created < "2024-04-01"

# Q2 (Apr-Jun)
created >= "2024-04-01" AND created < "2024-07-01"

# Q3 (Jul-Sep)
created >= "2024-07-01" AND created < "2024-10-01"

# Q4 (Oct-Dec)
created >= "2024-10-01" AND created < "2025-01-01"
```

## Examples by Use Case

### Sprint Planning

```jql
# Issues created since last sprint started (2 weeks ago)
created >= -14d

# Issues due this sprint (next 2 weeks)
duedate >= now() AND duedate <= 14d
```

### Bug Triage

```jql
# Bugs reported today
type = Bug AND created >= startOfDay()

# Bugs from last week
type = Bug AND created >= startOfWeek(-1) AND created < startOfWeek()
```

### Performance Review

```jql
# Issues resolved this quarter
resolved >= startOfYear() AND resolved < startOfMonth(3)

# Issues created vs resolved last month
created >= startOfMonth(-1) AND created < startOfMonth()
```

### SLA Tracking

```jql
# Issues breaching SLA (not resolved in 48 hours)
created < -48h AND resolution IS EMPTY

# Overdue high-priority items
priority = High AND duedate < now() AND status != Closed
```

## Parsing Natural Language Dates

### Step-by-Step Process

1. **Identify temporal keywords:** last, next, this, past, ago, from now
2. **Extract numbers:** 7, 30, 2, etc.
3. **Identify units:** days, weeks, months, years, hours
4. **Determine direction:** past (negative) or future (positive)
5. **Choose JQL format:** relative (`-Nd`) or function (`startOfWeek()`)
6. **Handle ranges:** single point or between two dates

### Example Parsing

**Input:** "issues created in the last 2 weeks"

1. Keywords: "last"
2. Number: "2"
3. Unit: "weeks"
4. Direction: Past
5. Calculation: 2 weeks = 14 days
6. JQL: `created >= -14d`

**Input:** "bugs from this month"

1. Keywords: "this"
2. Period: "month"
3. Direction: Current period
4. Function: `startOfMonth()`
5. JQL: `created >= startOfMonth()`

## Date Comparison Tips

1. **Use >= for inclusive ranges:** `created >= -7d` includes today
2. **Use < for exclusive ends:** `created < "2024-02-01"` excludes Feb 1
3. **Combine for exact ranges:** `>= "2024-01-01" AND < "2024-02-01"`
4. **Functions for calendar periods:** `startOfWeek()` for week boundaries
5. **Relative for rolling periods:** `-30d` for rolling 30 days

## Testing Date Queries

1. **Check current date/time:** `created >= now()` should return nothing
2. **Verify boundary:** `created >= startOfDay()` should include all today's issues
3. **Test with known issues:** Find issue created on specific date
4. **Cross-check counts:** Compare different query approaches
5. **Use JIRA's issue navigator:** Validate JQL before using in skill

## Common Mistakes

1. **Confusing calendar vs rolling periods:**
   - ❌ `created >= startOfMonth()` for "last 30 days"
   - ✅ `created >= -30d` for "last 30 days"

2. **Forgetting upper bound:**
   - ❌ `created >= startOfWeek(-1)` (includes this week too)
   - ✅ `created >= startOfWeek(-1) AND created < startOfWeek()`

3. **Wrong time zone assumptions:**
   - Be aware JQL uses server/instance timezone
   - "Today" means today in JIRA's timezone

4. **Inclusive vs exclusive:**
   - `created <= -7d` means 7+ days ago (older)
   - `created >= -7d` means within last 7 days (recent)

## Reference

For current date/time in your timezone, JIRA uses the instance's configured timezone. Check JIRA settings for exact timezone.

Function offsets are in days/weeks/months relative to current period:
- `startOfWeek(0)` = this week
- `startOfWeek(-1)` = last week
- `startOfWeek(1)` = next week
