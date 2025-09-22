import { action, computed, makeObservable } from 'mobx';

import { epochToMoment, getPlatformName, getProductionPlatformHostname, toMoment } from '@deriv/shared';
import { getInitialLanguage } from '@deriv-com/translations';

import BaseStore from './base-store';

import BinarySocket from '_common/base/socket_base';

export default class GTMStore extends BaseStore {
    is_gtm_applicable = window.location.hostname === getProductionPlatformHostname();

    constructor(root_store) {
        super({ root_store });

        makeObservable(this, {
            visitorId: computed,
            common_variables: computed,
            pushDataLayer: action.bound,
            pushTransactionData: action.bound,
        });
    }

    get visitorId() {
        return this.root_store.client.loginid;
    }

    /**
     * Contains common data that will be passed to GTM on each datalayer push
     *
     * @returns {object}
     */
    get common_variables() {
        return {
            language: getInitialLanguage(),
            ...(this.root_store.client.is_logged_in && {
                visitorId: this.visitorId,
                currency: this.root_store.client.currency,
                userId: this.root_store.client.user_id,
                email: this.root_store.client.email,
            }),
            loggedIn: this.root_store.client.is_logged_in,
            theme: this.root_store.ui.is_dark_mode_on ? 'dark' : 'light',
            platform: getPlatformName(),
        };
    }

    /**
     * Pushes provided data as GTM DataLayer
     *
     * @param {object} data
     */
    async pushDataLayer(data) {
        if (this.is_gtm_applicable && this.root_store?.client?.is_logged_in) {
            BinarySocket?.wait('authorize')?.then(() => {
                const gtm_object = { ...this.common_variables, ...data };
                if (!gtm_object.event) return;

                dataLayer.push(gtm_object);
            });
        }
    }

    /**
     * Pushes deposit & withdrawal data from transaction-stream to GTM
     *
     * @param {object} response
     * @param {object} extra_data
     */
    pushTransactionData(response, extra_data = {}) {
        if (!this.is_gtm_applicable || this.root_store.client.is_virtual) return;
        if (!response.transaction || !response.transaction.action) return;
        if (!['deposit', 'withdrawal'].includes(response.transaction.action)) return;

        const moment_now = toMoment();
        const storage_key = 'GTM_transactions';

        // Remove values from prev days so localStorage doesn't grow to infinity
        let gtm_transactions = JSON.parse(localStorage.getItem(storage_key)) || {};
        if (Object.prototype.hasOwnProperty.call(gtm_transactions, 'timestamp')) {
            if (moment_now.isAfter(epochToMoment(gtm_transactions.timestamp), 'day')) {
                localStorage.removeItem(storage_key);
                gtm_transactions = { timestamp: moment_now.unix() };
            }
        }
        const transactions_arr = gtm_transactions.transactions || [];
        if (!transactions_arr.includes(response.transaction.transaction_id)) {
            const data = {
                event: 'transaction',
                bom_account_type: this.root_store.client.account_type,
                bom_today: moment_now.unix(),
                transaction: {
                    id: response.transaction.transaction_id,
                    type: response.transaction.action,
                    time: response.transaction.transaction_time,
                    amount: response.transaction.amount,
                },
            };
            Object.assign(data, extra_data);
            this.pushDataLayer(data);

            transactions_arr.push(response.transaction.transaction_id);
            gtm_transactions.transactions = transactions_arr;
            gtm_transactions.timestamp = gtm_transactions.timestamp || moment_now.unix();

            localStorage.setItem(storage_key, JSON.stringify(gtm_transactions));
        }
    }
}
