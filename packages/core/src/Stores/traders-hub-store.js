import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { ContentFlag } from '@deriv/shared';
import BaseStore from './base-store';
import { isEuCountry } from '_common/utility';

export default class TradersHubStore extends BaseStore {
    available_platforms = [];
    selected_account_type;
    selected_region;
    modal_data = {
        active_modal: '',
        data: {},
    };
    selected_jurisdiction_kyc_status = {};
    selected_account = {};

    constructor(root_store) {
        const local_storage_properties = ['available_platforms', 'selected_region'];
        const store_name = 'traders_hub_store';
        super({ root_store, local_storage_properties, store_name });

        makeObservable(this, {
            available_platforms: observable,
            modal_data: observable,
            selected_account: observable,
            selected_jurisdiction_kyc_status: observable,
            selected_account_type: observable,
            selected_region: observable,
            closeModal: action.bound,
            content_flag: computed,
            getAccount: action.bound,
            has_any_real_account: computed,
            is_demo: computed,
            is_real: computed,
            openModal: action.bound,
            show_eu_related_content: computed,
            cleanup: action.bound,
        });

        reaction(
            () => [this.root_store.client.loginid, this.root_store.client.residence],
            () => {
                const residence = this.root_store.client.residence;
                const active_demo = /^VRT|VRW/.test(this.root_store.client.loginid);
                const active_real_mf = /^MF|MFW/.test(this.root_store.client.loginid);
                const default_region = () => {
                    if (((active_demo || active_real_mf) && isEuCountry(residence)) || active_real_mf) {
                        return 'EU';
                    }
                    return 'Non-EU';
                };
                this.selected_account_type = !/^VRT|VRW/.test(this.root_store.client.loginid) ? 'real' : 'demo';
                this.selected_region = default_region();
            }
        );
    }

    get content_flag() {
        const { is_logged_in, residence } = this.root_store.client;

        // Hardcoded landing companies for maximum permissiveness (ROW/SVG behavior)
        const hardcoded_landing_companies = {
            financial_company: { shortcode: 'svg' },
            gaming_company: { shortcode: 'svg' },
        };

        const { financial_company, gaming_company } = hardcoded_landing_companies;

        //this is a conditional check for countries like Australia/Norway which fulfills one of these following conditions
        const restricted_countries = financial_company?.shortcode === 'svg' || gaming_company?.shortcode === 'svg';

        if (!is_logged_in) return '';
        if (!gaming_company?.shortcode && financial_company?.shortcode === 'maltainvest') {
            if (this.is_demo) return ContentFlag.EU_DEMO;
            return ContentFlag.EU_REAL;
        } else if (
            financial_company?.shortcode === 'maltainvest' &&
            gaming_company?.shortcode === 'svg' &&
            this.is_real
        ) {
            if (this.is_eu_user) return ContentFlag.LOW_RISK_CR_EU;
            return ContentFlag.LOW_RISK_CR_NON_EU;
        } else if (
            ((financial_company?.shortcode === 'svg' && gaming_company?.shortcode === 'svg') || restricted_countries) &&
            this.is_real
        ) {
            return ContentFlag.HIGH_RISK_CR;
        }

        // Default Check
        if (isEuCountry(residence)) {
            if (this.is_demo) return ContentFlag.EU_DEMO;
            return ContentFlag.EU_REAL;
        }
        if (this.is_demo) return ContentFlag.CR_DEMO;

        return this.is_eu_user ? ContentFlag.LOW_RISK_CR_EU : ContentFlag.LOW_RISK_CR_NON_EU;
    }

    get show_eu_related_content() {
        const eu_related = [ContentFlag.EU_DEMO, ContentFlag.EU_REAL, ContentFlag.LOW_RISK_CR_EU];
        return eu_related.includes(this.content_flag);
    }

    get has_any_real_account() {
        return this.selected_account_type === 'real' && this.root_store.client.has_active_real_account;
    }

    get is_demo() {
        return this.selected_account_type === 'demo';
    }
    get is_real() {
        return this.selected_account_type === 'real';
    }
    get is_eu_user() {
        return this.selected_region === 'EU';
    }

    openModal(modal_id, props = {}) {
        this.modal_data = {
            active_modal: modal_id,
            data: props,
        };
    }

    closeModal() {
        this.modal_data = {
            active_modal: '',
            data: {},
        };
    }

    getAccount() {
        if (!this.is_demo) {
            // For real accounts, we fetch the account type from the CFD module.
        }
    }

    cleanup() {
        if (
            !localStorage.getItem('active_loginid') ||
            (!this.root_store.client.is_logged_in && localStorage.getItem('active_loginid') === 'null')
        ) {
            localStorage.removeItem('traders_hub_store');
            this.available_platforms = [];
        }
    }
}
