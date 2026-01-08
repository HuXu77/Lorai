#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);

interface CardData {
    id: number;
    number: number;
    setCode: string;
    images?: {
        full?: string;
        thumbnail?: string;
        foilMask?: string;
    };
}

interface AllCardsData {
    cards: CardData[];
}

interface DownloadStats {
    total: number;
    downloaded: number;
    skipped: number;
    failed: number;
}

type Variant = 'full' | 'thumbnail' | 'foilMask';

async function downloadImage(url: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            const chunks: Buffer[] = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', async () => {
                try {
                    await writeFile(outputPath, Buffer.concat(chunks));
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await access(filePath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

async function downloadWithRetry(
    url: string,
    outputPath: string,
    maxRetries: number = 3
): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await downloadImage(url, outputPath);
            return;
        } catch (err) {
            if (attempt === maxRetries) {
                throw err;
            }
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

async function processDownloads(
    downloads: Array<{ url: string; path: string }>,
    concurrency: number,
    stats: DownloadStats,
    force: boolean
): Promise<void> {
    const queue = [...downloads];
    const workers: Promise<void>[] = [];

    for (let i = 0; i < concurrency; i++) {
        workers.push(processQueue());
    }

    await Promise.all(workers);

    async function processQueue(): Promise<void> {
        while (queue.length > 0) {
            const download = queue.shift();
            if (!download) break;

            const { url, path: outputPath } = download;

            try {
                // Check if file already exists
                if (!force && await fileExists(outputPath)) {
                    stats.skipped++;
                    process.stdout.write(`\rProgress: ${stats.downloaded + stats.skipped + stats.failed}/${stats.total} (Downloaded: ${stats.downloaded}, Skipped: ${stats.skipped}, Failed: ${stats.failed})`);
                    continue;
                }

                // Download the file
                await downloadWithRetry(url, outputPath);
                stats.downloaded++;
                process.stdout.write(`\rProgress: ${stats.downloaded + stats.skipped + stats.failed}/${stats.total} (Downloaded: ${stats.downloaded}, Skipped: ${stats.skipped}, Failed: ${stats.failed})`);
            } catch (err) {
                stats.failed++;
                console.error(`\nFailed to download ${url}: ${err}`);
            }
        }
    }
}

async function main() {
    const args = process.argv.slice(2);

    // Parse arguments
    let variants: Variant[] = ['full', 'thumbnail', 'foilMask'];
    let force = false;
    let concurrency = 10;
    let targetSet: string | null = null;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--variant':
                variants = [args[++i] as Variant];
                break;
            case '--force':
                force = true;
                break;
            case '--concurrency':
                concurrency = parseInt(args[++i], 10);
                break;
            case '--set':
                targetSet = args[++i];
                break;
            case '--help':
                console.log(`
Usage: npx ts-node src/scripts/download-images.ts [options]

Options:
  --variant <full|thumbnail|foilMask>  Download only specific variant (default: all)
  --force                              Re-download existing images
  --concurrency <number>               Number of parallel downloads (default: 10)
  --set <setCode>                      Download only specific set
  --help                               Show this help message
        `);
                process.exit(0);
        }
    }

    console.log('📥 Lorcana Card Image Downloader\n');

    // Load card data
    const dataPath = path.join(process.cwd(), 'allCards.json');
    console.log(`📖 Reading card data from ${dataPath}...`);

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data: AllCardsData = JSON.parse(rawData);

    let cards = data.cards;

    // Filter by set if specified
    if (targetSet) {
        cards = cards.filter(card => card.setCode === targetSet);
        console.log(`🎯 Filtering to set ${targetSet}: ${cards.length} cards`);
    } else {
        console.log(`📊 Total cards: ${cards.length}`);
    }

    // Prepare download list
    const downloads: Array<{ url: string; path: string }> = [];

    for (const card of cards) {
        if (!card.images) continue;

        const setDir = path.join(process.cwd(), 'public', 'images', 'cards', card.setCode);
        await mkdir(setDir, { recursive: true });

        for (const variant of variants) {
            const url = card.images[variant];
            if (!url) continue;

            const filename = `${card.number}_${variant}.jpg`;
            const outputPath = path.join(setDir, filename);

            downloads.push({ url, path: outputPath });
        }
    }

    console.log(`📦 Total images to process: ${downloads.length}`);
    console.log(`⚙️  Concurrency: ${concurrency}`);
    console.log(`🔄 Force re-download: ${force}\n`);

    const stats: DownloadStats = {
        total: downloads.length,
        downloaded: 0,
        skipped: 0,
        failed: 0
    };

    const startTime = Date.now();
    await processDownloads(downloads, concurrency, stats, force);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n\n✅ Download complete!\n');
    console.log(`📊 Statistics:`);
    console.log(`   Total:      ${stats.total}`);
    console.log(`   Downloaded: ${stats.downloaded}`);
    console.log(`   Skipped:    ${stats.skipped}`);
    console.log(`   Failed:     ${stats.failed}`);
    console.log(`   Duration:   ${duration}s`);

    if (stats.failed > 0) {
        console.log('\n⚠️  Some downloads failed. Run again to retry failed downloads.');
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
