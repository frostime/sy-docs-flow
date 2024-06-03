/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-06-03 20:14:37
 * @FilePath     : /src/libs/promise-pool.ts
 * @LastEditTime : 2024-06-03 20:14:47
 * @Description  : 
 */
export default class PromiseLimitPool<T> {
    private maxConcurrent: number;
    private currentRunning = 0;
    private queue: (() => void)[] = [];
    private promises: Promise<T>[] = [];

    constructor(maxConcurrent: number) {
        this.maxConcurrent = maxConcurrent;
    }

    add(fn: () => Promise<T>): void {
        const promise = new Promise<T>((resolve, reject) => {
            const run = async () => {
                try {
                    this.currentRunning++;
                    const result = await fn();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.currentRunning--;
                    this.next();
                }
            };

            if (this.currentRunning < this.maxConcurrent) {
                run();
            } else {
                this.queue.push(run);
            }
        });
        this.promises.push(promise);
    }

    async awaitAll(): Promise<T[]> {
        return Promise.all(this.promises);
    }

    /**
     * Handles the next task in the queue.
     */
    private next(): void {
        if (this.queue.length > 0 && this.currentRunning < this.maxConcurrent) {
            const nextRun = this.queue.shift()!;
            nextRun();
        }
    }
}

