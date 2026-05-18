

const COMPANY_DOMAINS = {
    'TCS': 'tcs.com',
    'Infosys': 'infosys.com',
    'Wipro': 'wipro.com',
    'HCL': 'hcltech.com',
    'Zomato': 'zomato.com',
    'Swiggy': 'swiggy.com',
    'Paytm': 'paytm.com',
    'PhonePe': 'phonepe.com',
    'Flipkart': 'flipkart.com',
    'Ola': 'olacabs.com',
    'Reliance': 'ril.com',
    'Tata': 'tata.com',
};

const SEARCH_OVERRIDES = {
    'TATA Consultancy Services': 'TCS',
    'HCL Technologies': 'HCL',
    'JP Morgan Chase': 'JP Morgan',
    'Amazon Web Services': 'AWS',
    'L&T': 'Larsen & Toubro',
    'Larsen & Toubro': 'L&T',
};


function cleanCompanyName(name) {
    if (!name) return '';
    if (SEARCH_OVERRIDES[name]) return SEARCH_OVERRIDES[name];

    return name
        .replace(/\b(Pvt|Ltd|Limited|Private|Inc|Corp|Corporation|India|Software|Consultancy|Services)\b/gi, '')
        .replace(/[^\w\s&]/gi, '') 
        .trim();
}

const MEMORY_CACHE = new Map();
const PENDING_REQUESTS = new Map();
const CACHE_KEY_PREFIX = 'wvl_logo_';

export function getCompanyLogo(name) {
    if (!name) return null;
    const domain = COMPANY_DOMAINS[name] || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    return `https://logo.clearbit.com/${domain}`;
}

export async function fetchWorldVectorLogo(query) {
    if (!query) return null;
    const searchTerms = cleanCompanyName(query);
    const normalizedQuery = searchTerms.toLowerCase().trim();
    const finalQuery = normalizedQuery || query.toLowerCase().trim();

    const storageKey = CACHE_KEY_PREFIX + finalQuery;

    // 1. Check In-Memory Cache
    if (MEMORY_CACHE.has(finalQuery)) {
        return MEMORY_CACHE.get(finalQuery);
    }

    // 2. Check for an ongoing request
    if (PENDING_REQUESTS.has(finalQuery)) {
        return PENDING_REQUESTS.get(finalQuery);
    }

    // 3. Check LocalStorage
    try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
            const { url, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
                MEMORY_CACHE.set(finalQuery, url);
                return url;
            }
        }
    } catch (e) {
        console.warn('Cache read error:', e);
    }

    // 4. API Fetch (Wrapped in a promise to track pending status)
    const fetchPromise = (async () => {
        const apiKey = import.meta.env.VITE_WVL_API_KEY;
        if (!apiKey) return null;

        try {
           
            const url = new URL("https://worldvectorlogo.com/api/v1/logos/search");
            url.searchParams.append("q", searchTerms || query);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                console.error(`WVL Error: ${response.status}`);
                return null;
            }

            const result = await response.json();

            if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
                const logoUrl = result.data[0].svg_url;

                MEMORY_CACHE.set(finalQuery, logoUrl);
                try {
                    localStorage.setItem(storageKey, JSON.stringify({
                        url: logoUrl,
                        timestamp: Date.now()
                    }));
                } catch (e) { }

                return logoUrl;
            }
            return null;
        } catch (error) {
            console.error('WVL API Exception:', error);
            return null;
        } finally {
            PENDING_REQUESTS.delete(finalQuery);
        }
    })();
    PENDING_REQUESTS.set(finalQuery, fetchPromise);
    return fetchPromise;
}
