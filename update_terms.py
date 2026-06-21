import json
import urllib.request
import urllib.parse
import time

def get_wikipedia_summary(title, lang="en"):
    url = f"https://{lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&titles={urllib.parse.quote(title)}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data.get("query", {}).get("pages", {})
            for page_id, page_info in pages.items():
                if page_id == "-1":
                    return None
                return page_info.get("extract")
    except Exception as e:
        print(f"Error fetching {title} ({lang}): {e}")
        return None

with open("public/terms.json", "r") as f:
    terms = json.load(f)

for key, term in terms.items():
    title_en = term.get("wikipedia", term["labelEn"])
    title_it = term["labelIt"]
    
    print(f"Fetching {title_en} (en)...")
    summary_en = get_wikipedia_summary(title_en, "en")
    if summary_en:
        # Some summaries are very long, let's keep the first 3-4 sentences or just the whole intro.
        term["longEn"] = summary_en.strip()
    
    print(f"Fetching {title_it} (it)...")
    summary_it = get_wikipedia_summary(title_it, "it")
    if summary_it:
        term["longIt"] = summary_it.strip()
        
    time.sleep(0.1) # be nice to wikipedia

with open("public/terms.json", "w") as f:
    json.dump(terms, f, indent=2, ensure_ascii=False)

print("Done")
