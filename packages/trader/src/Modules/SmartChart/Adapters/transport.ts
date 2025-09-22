/**
 * SmartCharts Champion Adapter - Transport Layer
 *
 * Abstracts WebSocket communication with the Deriv API through WS utility.
 * Provides clean interface for sending requests and managing subscriptions.
 */

import { WS } from '@deriv/shared';

import type { ILogger, SubscriptionInfo, TTransport } from './types';

/**
 * Logger implementation for transport layer
 */
class TransportLogger implements ILogger {
    private isDebugEnabled: boolean;

    constructor(debug: boolean = false) {
        this.isDebugEnabled = debug;
    }

    info(message: string, data?: any): void {
        if (this.isDebugEnabled) {
            // eslint-disable-next-line no-console
            console.log(`[Transport] ${message}`, data);
        }
    }

    error(message: string, error?: any): void {
        // eslint-disable-next-line no-console
        console.error(`[Transport] ${message}`, error);
    }

    warn(message: string, data?: any): void {
        // eslint-disable-next-line no-console
        console.warn(`[Transport] ${message}`, data);
    }

    debug(message: string, data?: any): void {
        if (this.isDebugEnabled) {
            // eslint-disable-next-line no-console
            console.debug(`[Transport] ${message}`, data);
        }
    }
}

/**
 * Subscription manager for tracking active subscriptions
 */
class SubscriptionManager {
    private subscriptions = new Map<string, SubscriptionInfo>();
    private logger: ILogger;

    constructor(debugEnabled: boolean = false) {
        this.logger = new TransportLogger(debugEnabled);
    }

    set(id: string, info: SubscriptionInfo): void {
        this.subscriptions.set(id, info);
        this.logger.debug('Subscription added', { id, hasCallback: !!info.callback });
    }

    get(id: string): SubscriptionInfo | undefined {
        return this.subscriptions.get(id);
    }

    delete(id: string): boolean {
        const deleted = this.subscriptions.delete(id);
        if (deleted) {
            this.logger.debug('Subscription removed', { id });
        }
        return deleted;
    }

    clear(): void {
        const count = this.subscriptions.size;
        this.subscriptions.clear();
        this.logger.info('All subscriptions cleared', { count });
    }

    getActiveCount(): number {
        return this.subscriptions.size;
    }

    getAllIds(): string[] {
        return Array.from(this.subscriptions.keys());
    }
}

/**
 * Creates transport layer instance
 */
export function createTransport(config: { debug?: boolean; timeout?: number } = {}): TTransport {
    const { debug = false, timeout = 30000 } = config;
    const logger = new TransportLogger(debug);
    const subscriptionManager = new SubscriptionManager(debug);

    return {
        /**
         * Send a request to the API and wait for response
         */
        async send(request: any): Promise<any> {
            logger.info('Sending request', { type: Object.keys(request)[0], request });

            try {
                // Add timeout to prevent hanging requests
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout);
                });

                const requestPromise = WS.storage.send(request);
                const response = await Promise.race([requestPromise, timeoutPromise]);

                logger.info('Request completed', {
                    type: Object.keys(request)[0],
                    hasResponse: !!response,
                });

                return response;
            } catch (error) {
                logger.error('Request failed', { request, error });
                throw error;
            }
        },

        /**
         * Subscribe to streaming data
         */
        subscribe(request: any, callback: (response: any) => void): string {
            const subscriptionKey = `${request.ticks_history || request.ticks || 'unknown'}-${Date.now()}`;

            logger.info('Creating subscription', { subscriptionKey, request });

            try {
                // Use WS.subscribeTicksHistory for tick subscriptions
                if (request.ticks_history && request.subscribe) {
                    const subscriber = WS.subscribeTicksHistory(request, (response: any) => {
                        try {
                            logger.debug('Received tick data', { subscriptionKey, hasData: !!response });
                            callback(response);
                        } catch (error) {
                            logger.error('Error processing tick data', { subscriptionKey, error });
                        }
                    });

                    // Store subscription info
                    subscriptionManager.set(subscriptionKey, {
                        request,
                        callback,
                        messageSubscription: subscriber,
                        realSubscriptionId: subscriptionKey,
                    });

                    return subscriptionKey;
                }

                // For other subscription types, use generic WS subscription
                // This is a fallback - most chart data should use ticks_history
                logger.warn('Using fallback subscription method', { request });

                // Store subscription info for cleanup
                subscriptionManager.set(subscriptionKey, {
                    request,
                    callback,
                    messageSubscription: null,
                    realSubscriptionId: subscriptionKey,
                });

                return subscriptionKey;
            } catch (error) {
                logger.error('Failed to create subscription', { subscriptionKey, error });
                throw error;
            }
        },

        /**
         * Unsubscribe from streaming data
         */
        unsubscribe(subscriptionId: string): void {
            logger.info('Unsubscribing', { subscriptionId });

            try {
                const subscription = subscriptionManager.get(subscriptionId);

                if (subscription) {
                    // Unsubscribe from message stream
                    if (subscription.messageSubscription) {
                        subscription.messageSubscription.unsubscribe();
                        logger.debug('Message subscription cleaned up', { subscriptionId });
                    }

                    // Send unsubscribe request if we have a real subscription ID
                    if (subscription.realSubscriptionId && subscription.messageSubscription) {
                        // For WS subscriptions, the unsubscribe is handled by the subscriber object
                        logger.debug('Subscription unsubscribed via WS', { subscriptionId });
                    }

                    // Remove from tracking
                    subscriptionManager.delete(subscriptionId);
                    logger.info('Subscription cleaned up', { subscriptionId });
                } else {
                    logger.warn('Subscription not found for unsubscribe', { subscriptionId });
                }
            } catch (error) {
                logger.error('Error during unsubscribe', { subscriptionId, error });
            }
        },

        /**
         * Unsubscribe from all active subscriptions
         */
        unsubscribeAll(msgType?: string): void {
            logger.info('Unsubscribing from all subscriptions', {
                msgType,
                activeCount: subscriptionManager.getActiveCount(),
            });

            try {
                const allIds = subscriptionManager.getAllIds();

                allIds.forEach(id => {
                    const subscription = subscriptionManager.get(id);
                    if (subscription) {
                        // Filter by message type if specified
                        if (!msgType || subscription.request[msgType]) {
                            this.unsubscribe(id);
                        }
                    }
                });

                // If no message type filter, clear everything
                if (!msgType) {
                    subscriptionManager.clear();
                }

                logger.info('Bulk unsubscribe completed', {
                    msgType,
                    remainingCount: subscriptionManager.getActiveCount(),
                });
            } catch (error) {
                logger.error('Error during bulk unsubscribe', { msgType, error });
            }
        },
    };
}
