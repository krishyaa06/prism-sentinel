/**
 * Tiny JSON-file database.
 * - No native dependencies (works on Termux, Replit, any VPS)
 * - Debounced, atomic writes (write to .tmp then rename)
 */
const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = process.env.SENTINEL_DATA_DIR || path.join(__dirname, '..', '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

class JsonStore {
    constructor(name, defaults = {}) {
        this.file = path.join(DATA_DIR, `${name}.json`);
        this.defaults = defaults;
        this.data = this.#load();
        this.timer = null;
    }

    #load() {
        try {
            return JSON.parse(fs.readFileSync(this.file, 'utf8'));
        } catch {
            return structuredClone(this.defaults);
        }
    }

    save() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.flush(), 500);
    }

    flush() {
        clearTimeout(this.timer);
        const tmp = `${this.file}.tmp`;
        fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
        fs.renameSync(tmp, this.file);
    }

    /** Get (and lazily create) the object for a guild. */
    guild(guildId, factory = () => ({})) {
        if (!this.data[guildId]) {
            this.data[guildId] = factory();
            this.save();
        }
        return this.data[guildId];
    }
}

const stores = {
    settings: new JsonStore('settings'),
    levels: new JsonStore('levels'),
    warnings: new JsonStore('warnings'),
    tickets: new JsonStore('tickets')
};

const flushAll = () => Object.values(stores).forEach(s => s.flush());
process.on('exit', flushAll);
process.on('SIGINT', () => { flushAll(); process.exit(0); });
process.on('SIGTERM', () => { flushAll(); process.exit(0); });

const defaultSettings = () => ({
    welcomeChannelId: null,
    logChannelId: null,
    autoRoleId: null,
    levelUpChannelId: null,
    welcomeMessage: 'Welcome to **{server}**, {user}! You are member **#{count}** 🎉'
});

module.exports = {
    ...stores,
    getSettings: guildId => stores.settings.guild(guildId, defaultSettings),
    updateSettings(guildId, patch) {
        Object.assign(stores.settings.guild(guildId, defaultSettings), patch);
        stores.settings.save();
    }
};
