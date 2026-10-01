// @ts-nocheck
/* eslint-disable */

/**
 * Safe Lua Preset Parser using Regex
 * Replaces Fengari to comply with MV3 CSP (No 'unsafe-eval')
 */
export class LuaPresetParser {
    
    constructor() {}

    async initialize(): Promise<boolean> {
        return true; // No initialization needed for regex parser
    }

    /**
     * Parse Lua content safely using Regex
     * Extracts 'presets' or 'spatial_presets' table
     */
    parsePresets(luaContent: string, presetType: 'equalizer' | 'spatializer'): any[] {
        try {
            // 1. Remove comments. Block comments must go first — the line-comment
            // regex would otherwise truncate "--[[" and leak the block body as code.
            let cleanLua = luaContent.replace(/--\[\[[\s\S]*?\]\]/g, '').replace(/--.*$/gm, '');
            
            // 2. Extract the target table content: "presets = { ... }"
            const tableName = presetType === 'equalizer' ? 'presets' : 'spatial_presets';
            // Match "presets = {" until matching closing brace? 
            // Simpler: Find "presets = {" and assume the rest is the table structure until end of file or next decl.
            // Since the files are well-structured, we can extract the main block.
            
            const tableRegex = new RegExp(`${tableName}\\s*=\\s*\\{([\\s\\S]*)\\}`);
            const match = cleanLua.match(tableRegex);
            
            if (!match) {
                console.error(`Could not find table '${tableName}' in Lua file`);
                return [];
            }
            
            const tableBody = match[1];

            // 3. Parse entries
            // Each entry is a table { ... }, 
            // We can split by "}," to get roughly each item, but nesting makes it tricky.
            // Better: Use a simple recursive descent or a smarter regex for the items.
            
            // "presets" is an array of objects.
            // Objects look like: { name = "...", bands = { ... } }
            
            const presets: any[] = [];
            
            // Find all top-level objects in the array
            // Matches: start of line, optional whitespace, {, content, }, comma/newline
            // This relies on the formatting of the existing files which is consistent.
            
            const itemRegex = /^\s*\{\s*([\s\S]*?)\s*\},?\s*$/gm;
            let itemMatch;
            
            // We need to match braces carefully. 
            // Let's iterate through the string and strip matched items.
            // Actually, for the specific file structure:
            // {
            //    name = "...",
            //    ...
            // },
            
            // Let's split by "},\n" or "}," followed by newline/space
            // This is brittle but works for the static files we have.
            
            const rawItems = this.splitTopLevelObjects(tableBody);
            
            for (const itemStr of rawItems) {
                const preset = this.parseLuaObjectBody(itemStr);
                if (preset && preset.name) {
                    presets.push(preset);
                }
            }

            return presets;

        } catch (e) {
            console.error('Safe Lua Parsing failed:', e);
            return [];
        }
    }

    private splitTopLevelObjects(body: string): string[] {
        const items = [];
        let braceCount = 0;
        let startIndex = -1;

        for (let i = 0; i < body.length; i++) {
            const char = body[i];
            if (char === '{') {
                if (braceCount === 0) startIndex = i;
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0 && startIndex !== -1) {
                    // Found a complete object
                    items.push(body.substring(startIndex + 1, i)); // Content inside {}
                    startIndex = -1;
                }
            }
        }
        return items;
    }

    private parseLuaObjectBody(body: string): any {
        const result: any = {};
        
        // Parse fields: key = value
        // value can be string "...", number, or table { ... }
        
        // 1. Strings: key = "value" (supports \" and \\ escapes)
        const stringFields = [...body.matchAll(/(\w+)\s*=\s*"((?:[^"\\]|\\.)*)"/g)];
        stringFields.forEach(m => result[m[1]] = m[2].replace(/\\(.)/g, '$1'));
        
        // 2. Numbers: key = 123.45 — scanned on a copy with string literals
        // blanked out, so values like description = "gain = 5" can't inject
        // fake numeric fields or overwrite real ones.
        const bodyWithoutStrings = body.replace(/"(?:[^"\\]|\\.)*"/g, '""');
        const numberFields = [...bodyWithoutStrings.matchAll(/(\w+)\s*=\s*(-?\d+\.?\d*)/g)];
        numberFields.forEach(m => result[m[1]] = parseFloat(m[2]));
        
        // 3. Arrays/Tables (bands, params, tags)

        // Bands: bands = { ... }
        const bandsOpen = body.match(/bands\s*=\s*\{/);
        if (bandsOpen) {
            const openBraceIndex = bandsOpen.index + bandsOpen[0].length - 1;
            const inner = this.extractBalancedBrace(body, openBraceIndex);
            if (inner) {
                result.bands = this.parseBandsArray(inner);
            }
        }

        // Params: params = { ... }
        const paramsOpen = body.match(/params\s*=\s*\{/);
        if (paramsOpen) {
            const openBraceIndex = paramsOpen.index + paramsOpen[0].length - 1;
            const inner = this.extractBalancedBrace(body, openBraceIndex);
            if (inner) {
                result.params = this.parseParamsObject(inner);
            }
        }

        // Tags: tags = { "a", "b" }
        const tagsOpen = body.match(/tags\s*=\s*\{/);
        if (tagsOpen) {
            const openBraceIndex = tagsOpen.index + tagsOpen[0].length - 1;
            const inner = this.extractBalancedBrace(body, openBraceIndex);
            if (inner) {
                result.tags = inner.match(/"(.*?)"/g)?.map(s => s.replace(/"/g, '')) || [];
            }
        }

        return result;
    }

    private extractBalancedBrace(text: string, openBraceIndex: number): string | null {
        let count = 1;
        for (let i = openBraceIndex + 1; i < text.length; i++) {
            if (text[i] === '{') count++;
            else if (text[i] === '}') count--;
            
            if (count === 0) {
                return text.substring(openBraceIndex + 1, i);
            }
        }
        return null;
    }

    private parseBandsArray(content: string): any[] {
        // Content: { freq=..., gain=... }, { ... }
        const bands = [];
        const items = this.splitTopLevelObjects(content);
        for (const item of items) {
             const band: any = {};
             const props = [...item.matchAll(/(\w+)\s*=\s*(-?\d+\.?\d*)/g)];
             props.forEach(m => band[m[1]] = parseFloat(m[2]));
             bands.push(band);
        }
        return bands;
    }
    
    private parseParamsObject(content: string): any {
        const params: any = {};
        const props = [...content.matchAll(/(\w+)\s*=\s*(-?\d+\.?\d*)/g)];
        props.forEach(m => params[m[1]] = parseFloat(m[2]));
        return params;
    }

    async loadEqualizerPresets() {
        return this.loadPresetFile('wasm/equalizer/presets.lua', 'equalizer');
    }

    async loadSpatializerPresets() {
        return this.loadPresetFile('wasm/spatializer/spatializer_presets.lua', 'spatializer');
    }

    private async loadPresetFile(path: string, type: 'equalizer' | 'spatializer') {
        try {
            // @ts-ignore
            const runtime = (typeof chrome !== 'undefined' ? chrome.runtime : null);
            if (!runtime) return [];

            const url = runtime.getURL(path);
            const response = await fetch(url);
            const text = await response.text();
            return this.parsePresets(text, type);
        } catch (e) {
            console.error(`Load failed for ${path}`, e);
            return [];
        }
    }

    isParserLoaded() {
        return true;
    }
}
