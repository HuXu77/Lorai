import * as fs from 'fs';
import * as path from 'path';
import { LogEntry, LogCategory } from '../types/log';

export enum LogLevel {
    INFO = 'INFO',       // Major game events (Turn start, Winner)
    ACTION = 'ACTION',   // Player actions (Play, Quest, Challenge)
    EFFECT = 'EFFECT',   // Ability effects (Damage, Draw, Buffs)
    DEBUG = 'DEBUG',     // Internal logic details
    WARN = 'WARN',       // Warnings (Non-fatal issues)
    ERROR = 'ERROR'      // Errors and exceptions
}

export enum LogColor {
    Reset = "\x1b[0m",
    Bright = "\x1b[1m",
    Dim = "\x1b[2m",
    Underscore = "\x1b[4m",
    Blink = "\x1b[5m",
    Reverse = "\x1b[7m",
    Hidden = "\x1b[8m",

    FgBlack = "\x1b[30m",
    FgRed = "\x1b[31m",
    FgGreen = "\x1b[32m",
    FgYellow = "\x1b[33m",
    FgBlue = "\x1b[34m",
    FgMagenta = "\x1b[35m",
    FgCyan = "\x1b[36m",
    FgWhite = "\x1b[37m",

    BgBlack = "\x1b[40m",
    BgRed = "\x1b[41m",
    BgGreen = "\x1b[42m",
    BgYellow = "\x1b[43m",
    BgBlue = "\x1b[44m",
    BgMagenta = "\x1b[45m",
    BgCyan = "\x1b[46m",
    BgWhite = "\x1b[47m"
}

/**
 * Logger interface for type-safe logging across the game engine.
 * Implement this interface for custom loggers (test mocks, browser loggers, etc.)
 */
export interface ILogger {
    log(level: LogLevel, message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    action(player: string, action: string, details?: any): void;
    effect(source: string, effect: string, target?: string, details?: any): void;
    debug(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
    getLogs?(): string[];
    // New subscription method
    subscribe?(callback: (entry: LogEntry) => void): () => void;
}

export class GameLogger implements ILogger {
    private logs: string[] = [];
    private logFile: string | null = null;
    private verbose: boolean = false;
    private subscribers: ((entry: LogEntry) => void)[] = [];

    constructor(logFile?: string, verbose: boolean = false) {
        this.logFile = logFile || null;
        this.verbose = verbose;

        // Initialize log file if provided
        if (this.logFile) {
            try {
                const dir = path.dirname(this.logFile);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(this.logFile, `=== Lorcana Game Log started at ${new Date().toISOString()} ===\n`);
            } catch (e) {
                console.error(`Failed to initialize log file at ${this.logFile}:`, e);
                this.logFile = null; // Disable file logging if init fails
            }
        }
    }

    /**
     * Subscribe to log events. Returns an unsubscribe function.
     */
    subscribe(callback: (entry: LogEntry) => void): () => void {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    /**
     * Map internal LogLevel to UI LogCategory
     */
    private mapLevelToCategory(level: LogLevel): LogCategory {
        switch (level) {
            case LogLevel.INFO: return LogCategory.SYSTEM;
            case LogLevel.ACTION: return LogCategory.CARD; // Default action to card? Or maybe separated
            case LogLevel.EFFECT: return LogCategory.ABILITY;
            case LogLevel.WARN: return LogCategory.SYSTEM;
            case LogLevel.ERROR: return LogCategory.SYSTEM;
            case LogLevel.DEBUG: return LogCategory.SYSTEM;
            default: return LogCategory.SYSTEM;
        }
    }

    log(level: LogLevel, message: string, data?: any) {
        // Only filter DEBUG logs if not verbose
        if (level === LogLevel.DEBUG && !this.verbose) return;

        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];

        // --- 1. Structured Logging (Notify Subscribers) ---
        // Construct the structured LogEntry for UI
        const entry: LogEntry = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            category: data?.category || this.mapLevelToCategory(level), // Allow overriding category in data
            message: message,
            details: data?.details || (data && typeof data === 'object' && !data.category ? data : undefined), // Use data as details if not special
            debugInfo: level === LogLevel.DEBUG ? data : undefined
        };

        // Emit to subscribers
        this.subscribers.forEach(cb => {
            try {
                cb(entry);
            } catch (err) {
                console.error('Error in log subscriber:', err);
            }
        });

        // --- 2. String/Console Logging (Legacy) ---

        // Colorize the log level
        let coloredLevel = '';
        switch (level) {
            case LogLevel.INFO:
                coloredLevel = `${LogColor.FgCyan}[${level}]${LogColor.Reset}`;
                break;
            case LogLevel.ACTION:
                coloredLevel = `${LogColor.FgGreen}[${level}]${LogColor.Reset}`;
                break;
            case LogLevel.EFFECT:
                coloredLevel = `${LogColor.FgYellow}[${level}]${LogColor.Reset}`;
                break;
            case LogLevel.DEBUG:
                coloredLevel = `${LogColor.Dim}[${level}]${LogColor.Reset}`;
                break;
            case LogLevel.WARN:
                coloredLevel = `${LogColor.FgYellow}${LogColor.Bright}[${level}]${LogColor.Reset}`;
                break;
            case LogLevel.ERROR:
                coloredLevel = `${LogColor.FgRed}${LogColor.Bright}[${level}]${LogColor.Reset}`;
                break;
            default:
                coloredLevel = `[${level}]`;
        }

        const formattedMessage = `${LogColor.Dim}[${timestamp}]${LogColor.Reset} ${coloredLevel} ${message}`;

        // Add data if present
        let fullMessage = formattedMessage;
        if (data) {
            let dataStr = '';
            if (data instanceof Error) {
                dataStr = `${LogColor.FgRed}${data.message}\n${data.stack}${LogColor.Reset}`;
            } else {
                dataStr = JSON.stringify(data, (key, value) => {
                    if (key === 'game') return undefined;
                    if (key === 'turnManager') return undefined;
                    return value;
                });
            }
            fullMessage += ` | ${dataStr}`;
        }

        this.logs.push(fullMessage);

        // Always output to console
        console.log(fullMessage);
    }


    // Convenience methods
    info(message: string, data?: any) { this.log(LogLevel.INFO, message, data); }
    action(player: string, action: string, details?: any) {
        this.log(LogLevel.ACTION, `${player} ${action}`, { category: LogCategory.CARD, details });
    }
    effect(source: string, effect: string, target?: string, details?: any) {
        this.log(LogLevel.EFFECT, `${source} -> ${effect}${target ? ' on ' + target : ''}`, { category: LogCategory.ABILITY, details });
    }
    debug(message: string, data?: any) { this.log(LogLevel.DEBUG, message, data); }
    warn(message: string, data?: any) { this.log(LogLevel.WARN, message, data); }
    error(message: string, data?: any) { this.log(LogLevel.ERROR, message, data); }

    getLogs(): string[] {
        return this.logs;
    }
}
