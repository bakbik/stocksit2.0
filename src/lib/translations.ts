export const translations = {
    en: {
        dashboard: "Market Overview",
        dashboardSub: "Live data and financial metrics for all listed stocks",
        lastUpdated: "Last Updated",
        allStocks: "All Stocks",
        searchPlaceholder: "Search stocks (Cmd+K)...",
        sidebar: {
            marketOverview: "Market Overview",
            watchlist: "Watchlist",
            news: "Market News",
            portfolio: "Portfolio",
            sectors: "Sectors",
            collapse: "Collapse Sidebar"
        },
        table: {
            symbol: "Symbol",
            name: "Name",
            price: "Price",
            mktCap: "Mkt Cap",
            ret3m: "3M Ret",
            ret1y: "1Y Ret",
            pe: "P/E",
            roe: "ROE",
            potential: "Potential",
            report: "Report",
            revenue: "Revenue",
            netProfit: "Net Profit",
            equity: "Equity",
            assets: "Assets",
            published: "Published",
            noResults: "No stocks matched your selection"
        },
        stockDetail: {
            back: "Market Dashboard",
            currPrice: "Curr Price (ILS)",
            addAlert: "Add Alert",
            watching: "Watching",
            addWatchlist: "Add to Watchlist",
            tabs: {
                overview: "Overview",
                financials: "Financials",
                news: "Live News"
            },
            stats: {
                title: "Market Stats",
                performance: "Performance",
                trends: "Financial Trends",
                lastUpdated: "Last Updated"
            },
            history: {
                title: "Historical Statements",
                currencyNote: "Values expressed in local currency"
            }
        }
    },
    he: {
        dashboard: "סקירת שוק",
        dashboardSub: "נתונים חיים ומדדים פיננסיים לכל המניות הרשומות",
        lastUpdated: "עודכן לאחרונה",
        allStocks: "כל המניות",
        searchPlaceholder: "חיפוש מניות (Cmd+K)...",
        sidebar: {
            marketOverview: "סקירת שוק",
            watchlist: "רשימת מעקב",
            news: "חדשות שוק",
            portfolio: "תיק השקעות",
            sectors: "סקטורים",
            collapse: "צמצם תפריט"
        },
        table: {
            symbol: "סימול",
            name: "שם",
            price: "מחיר",
            mktCap: "שווי שוק",
            ret3m: "תשואה 3ח'",
            ret1y: "תשואה שנה",
            pe: "מכפיל רווח",
            roe: "תשואה להון",
            potential: "פוטנציאל",
            report: "דו\"ח",
            revenue: "הכנסות",
            netProfit: "רווח נקי",
            equity: "הון עצמי",
            assets: "נכסים",
            published: "פורסם",
            noResults: "לא נמצאו מניות העונות לבחירה"
        },
        stockDetail: {
            back: "חזרה ללוח הבקרה",
            currPrice: "מחיר נוכחי (ש\"ח)",
            addAlert: "הוסף התראה",
            watching: "במעקב",
            addWatchlist: "הוסף לרשימת מעקב",
            tabs: {
                overview: "סקירה כללית",
                financials: "דוחות כספיים",
                news: "חדשות בשידור חי"
            },
            stats: {
                title: "נתוני שוק",
                performance: "ביצועים",
                trends: "מגמות פיננסיות",
                lastUpdated: "עודכן לאחרונה"
            },
            history: {
                title: "דוחות היסטוריים",
                currencyNote: "הערכים מוצגים במטבע מקומי"
            }
        }
    }
}

export type Language = 'en' | 'he'
export type TranslationKey = typeof translations.en
