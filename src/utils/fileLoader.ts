import {readdirSync, statSync} from 'fs';
import {extname, join} from 'path';
import {Logger} from './logger';

interface FileLoaderOptions {
    directory: string;
    extensions?: string[];
    recursive?: boolean;
    excludePattern?: RegExp;
}

export class FileLoader {
    private static defaultExtensions = ['.js', '.ts'];
    private static excludePattern = /\.d\.ts$/; // Exclude TypeScript declaration files

    /**
     * Load all files from a directory with specified extensions
     */
    static async loadFiles<T>(options: FileLoaderOptions): Promise<Map<string, T>> {
        const {
            directory,
            extensions = this.defaultExtensions,
            recursive = false,
            excludePattern = this.excludePattern
        } = options;

        const loadedFiles = new Map<string, T>();

        try {
            const files = this.getFiles(directory, extensions, recursive, excludePattern);

            for (const filePath of files) {
                try {
                    const module = await this.loadModule<T>(filePath);
                    if (module) {
                        const fileName = this.getFileNameWithoutExtension(filePath);
                        loadedFiles.set(fileName, module);
                        Logger.info(`Loaded file: ${fileName} from ${filePath}`);
                    }
                } catch (error) {
                    Logger.error(`Failed to load file ${filePath}:`, error);
                }
            }

            Logger.success(`Successfully loaded ${loadedFiles.size} files from ${directory}`);
        } catch (error) {
            Logger.error(`Error loading files from ${directory}:`, error);
        }

        return loadedFiles;
    }

    /**
     * Load a single module and clear its cache
     */
    private static async loadModule<T>(filePath: string): Promise<T | null> {
        try {
            // Clear require cache for hot reloading
            delete require.cache[require.resolve(filePath)];

            const moduleExport = require(filePath);
            return moduleExport.default || moduleExport;
        } catch (error) {
            Logger.error(`Error loading module from ${filePath}:`, error);
            return null;
        }
    }

    /**
     * Get all files recursively or non-recursively from directory
     */
    private static getFiles(
        directory: string,
        extensions: string[],
        recursive: boolean,
        excludePattern: RegExp
    ): string[] {
        const files: string[] = [];

        try {
            const items = readdirSync(directory);

            for (const item of items) {
                const fullPath = join(directory, item);
                const stat = statSync(fullPath);

                if (stat.isDirectory() && recursive) {
                    // Recursively get files from subdirectories
                    files.push(...this.getFiles(fullPath, extensions, recursive, excludePattern));
                } else if (stat.isFile()) {
                    const ext = extname(item);

                    // Check if file has valid extension and doesn't match exclude pattern
                    if (extensions.includes(ext) && !excludePattern.test(item)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            Logger.error(`Error reading directory ${directory}:`, error);
        }

        return files;
    }

    /**
     * Get filename without extension
     */
    private static getFileNameWithoutExtension(filePath: string): string {
        const fileName = filePath.split(/[/\\]/).pop() || '';
        return fileName.replace(/\.[^/.]+$/, '');
    }

    /**
     * Reload a specific file
     */
    static async reloadFile<T>(filePath: string): Promise<T | null> {
        try {
            Logger.info(`Reloading file: ${filePath}`);
            return await this.loadModule<T>(filePath);
        } catch (error) {
            Logger.error(`Failed to reload file ${filePath}:`, error);
            return null;
        }
    }
}