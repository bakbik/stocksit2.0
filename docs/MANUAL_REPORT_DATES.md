# Manual Report Date Override System

Since Israeli stock report publication dates cannot be automatically scraped (Maya/Bizportal/Investing.com all block or use dynamic loading), you can manually enter exact publication dates here.

## How to Use

Edit `src/lib/report_dates_override.json`:

```json
{
  "dates": {
    "AVGL.TA": {
      "Q3/2025": "2025-11-20",
      "Q2/2025": "2025-08-15"
    },
    "ICL.TA": {
      "Q3/2024": "2024-11-14"
    }
  }
}
```

## Finding Publication Dates

Check these sources for exact dates:
1. **Investing.com** - https://il.investing.com/equities/[company]-earnings
   - Shows "פרסום אחרון" (Last Publication)
2. **Maya** - https://maya.tase.co.il/
   - Official TASE reporting system
3. **Company IR Page** - Most companies publish on their investor relations page

## Priority Order

The system checks sources in this order:
1. **Manual Override** (this file) - HIGHEST PRIORITY ✅
2. Yahoo Finance - Auto (~50% coverage)
3. Bizportal scraper - Auto (limited success)
4. Period-end date - Fallback approximation

## Console Warnings

When syncing, you'll see warnings like:
```
⚠️ AVGL.TA Q3/2025 - ADD TO report_dates_override.json
```

This means the stock needs a manual entry for accurate monitoring.
