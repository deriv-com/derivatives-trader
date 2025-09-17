import { action, computed, makeObservable, observable, reaction } from 'mobx';
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

    get show_eu_related_content() {
        // TODO: Implement a proper check for EU content flag when available from the backend
        return false;
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
