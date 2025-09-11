import React from 'react';
import type { RouteComponentProps } from 'react-router';
import type { Moment } from 'moment';

import type {
    ActiveSymbols,
    Authorize,
    ContractUpdate,
    ContractUpdateHistory,
    GetSettings,
    LogOutResponse,
    Portfolio1,
    ProposalOpenContract,
    Transaction,
    WebsiteStatus,
} from '@deriv/api-types';
import { TContractInfo } from '@deriv/shared/src/utils/contract/contract-types';

import type { FeatureFlagsStore } from './src/stores';

type TRoutes =
    | '/404'
    | '/contract/:contract_id'
    | '/reports/positions'
    | '/reports/profit'
    | '/reports/statement'
    | '/reports'
    | '/'
    | '/endpoint';

type TPopulateSettingsExtensionsMenuItem = {
    icon: React.ReactElement;
    label: string;
    value: <T extends object>(props: T) => JSX.Element;
};

export type TPortfolioPosition = {
    barrier?: number;
    contract_info: ProposalOpenContract &
        Portfolio1 & {
            contract_update?: ContractUpdate;
            validation_params?: {
                [key: string]: { min: string; max: string };
            };
        };
    current_tick?: number;
    details?: string;
    display_name: string;
    entry_spot?: number;
    high_barrier?: number;
    id?: number;
    indicative: number;
    low_barrier?: number;
    payout?: number;
    purchase?: number;
    reference: number;
    type?: string;
    is_unsupported: boolean;
    contract_update: ProposalOpenContract['limit_order'];
    is_sell_requested: boolean;
    is_valid_to_sell?: boolean;
    profit_loss: number;
    status?: null | string;
};

type TAppRoutingHistory = {
    action: string;
    hash: string;
    key: string;
    pathname: string;
    search: string;
};

type TAccount = NonNullable<Authorize['account_list']>[0] & {
    balance?: number;
    landing_company_shortcode?: 'svg' | 'costarica' | 'maltainvest';
    is_virtual: number;
    account_category?: 'wallet' | 'trading';
};

// balance is missing in @deriv/api-types
export type TActiveAccount = TAccount & {
    balance?: string | number;
    landing_company_shortcode: 'svg' | 'costarica' | 'maltainvest';
    is_virtual: number;
    account_category?: 'wallet' | 'trading';
    linked_to?: { loginid: string; platform: string }[];
    token: string;
};

type TAddToastProps = {
    key?: string;
    content: string | React.ReactNode;
    timeout?: number;
    is_bottom?: boolean;
    type?: string;
};

type TButtonProps = {
    onClick: () => void;
    text: string;
};

type TActionProps = TButtonProps & {
    route?: string;
};

type TChartStateChangeOption = {
    indicator_type_name?: string;
    indicators_category_name?: string;
    isClosed?: boolean;
    is_favorite?: boolean;
    is_info_open?: boolean;
    is_open?: boolean;
    chart_type_name?: string;
    search_string?: string;
    symbol?: string;
    symbol_category?: string;
    time_interval_name?: string;
};

type TContentConfig = {
    className?: string;
    label?: string;
    line_style?: string;
    spot_className?: string;
};

type TMarkerContentConfig = TContentConfig & {
    align_label?: string;
    is_value_hidden?: boolean;
    marker_config?: {
        [key: string]: {
            type: string;
            marker_config: {
                ContentComponent: React.ComponentType<TMarkerContentConfig> | string;
                className?: string;
            };
            content_config: TContentConfig;
        };
    };
    spot_epoch?: string;
    spot_count?: number;
    spot_profit?: string;
    spot_value?: string;
    status?: string;
};

export type TNotificationMessage = {
    action?: TActionProps;
    className?: string;
    cta_btn?: TButtonProps;
    header_popup?: string;
    header: string;
    img_alt?: string;
    img_src?: string;
    is_disposable?: boolean;
    is_persistent?: boolean;
    key: string;
    message_popup?: string;
    message?: string | JSX.Element;
    platform?: string;
    primary_btn?: TButtonProps;
    secondary_btn?: TButtonProps;
    should_hide_close_btn?: boolean;
    should_show_again?: boolean;
    timeout?: number;
    timeoutMessage?: (remaining: number | string) => string;
    type: string;
    only_toast_message?: boolean;
};

type TNotification =
    | TNotificationMessage
    | ((withdrawal_locked: boolean, deposit_locked: boolean) => TNotificationMessage)
    | ((excluded_until: number) => TNotificationMessage);

type RealAccountSignupSettings = {
    active_modal_index: number;
    current_currency: string;
    error_code?: string;
    error_details?: string | Record<string, string>;
    error_message: string;
    previous_currency: string;
    success_message: string;
};

export type TCurrentAccount = {
    loginid: string;
    balance: number;
    currency: string;
    is_virtual: boolean;
    email?: string;
    landing_company_shortcode?: string;
    residence?: string;
    session_token: string;
    session_start: number;
    first_name?: string;
    last_name?: string;
};

export type TClientStore = {
    account_type: string;
    current_account: TCurrentAccount | null;
    setIsLoggingIn: (value: boolean) => void;
    available_crypto_currencies: Array<WebsiteStatus['currencies_config'][string] & { value: string }>;
    available_onramp_currencies: Array<string>;
    balance?: string | number;
    clients_country: string;
    currency: string;
    currencies_list: { text: string; value: string; has_tool_tip?: boolean }[];
    email_address: string;
    has_any_real_account: boolean;
    should_redirect_user_to_login: boolean;
    setShouldRedirectToLogin: (value: boolean) => void;
    has_active_real_account: boolean;
    has_cookie_account: boolean;
    has_logged_out: boolean;
    initialized_broadcast: boolean;
    is_authorize: boolean;
    is_eu_country: boolean;
    is_eu: boolean;
    is_logged_in: boolean;
    is_logging_in: boolean;
    is_client_store_initialized: boolean;
    is_virtual: boolean;
    landing_company_shortcode: string;
    loginid?: string;
    residence: string;
    website_status: WebsiteStatus;
    email: string;
    is_cr_account: boolean;
    is_mf_account: boolean;
    is_options_blocked: boolean;
    is_multipliers_only: boolean;
    is_single_currency: boolean;
    default_currency: string;

    // Essential actions
    setInitialized: (status?: boolean) => void;
    setIsClientStoreInitialized: () => void;
    setLogout: (status?: boolean) => void;
    selectCurrency: (currency: string) => void;
    setLoginId: (loginid: string) => void;
    setIsAuthorize: (value: boolean) => void;
    setBalanceActiveAccount: (obj_balance: any) => void;
    setEmail: (email: string) => void;
    resetVirtualBalance: () => Promise<void>;
    logout: () => Promise<LogOutResponse>;
    getToken: () => string;
    authenticateV2: (oneTimeToken?: string) => Promise<any>;
    storeSessionToken: (token: string) => void;
    getSessionToken: () => string | null;
    clearSessionToken: () => void;
    removeTokenFromUrl: () => void;
    is_crypto: (currency?: string) => boolean;
    responseAuthorize: (response: any) => void;
    responsePayoutCurrencies: (response: any) => void;
    setWebsiteStatus: (response: any) => void;
    responseWebsiteStatus: (response: any) => void;
    init: () => Promise<boolean>;
};

type TCommonStoreError = {
    header?: string | JSX.Element;
    message: string | JSX.Element;
    code?: string;
    redirect_label?: string;
    redirect_to?: string;
    redirectOnClick?: (() => void) | null;
    should_clear_error_on_click?: boolean;
    should_redirect?: boolean;
    should_show_refresh?: boolean;
    setError?: (has_error: boolean, error: React.ReactNode | null) => void;
    type?: string;
};

export type TCommonStoreServicesError = {
    code?: string;
    message?: string;
    type?: string;
};

type TCommonStore = {
    isCurrentLanguage(language_code: string): boolean;
    error: TCommonStoreError;
    has_error: boolean;
    is_network_online: boolean;
    routeBackInApp: (history: Pick<RouteComponentProps, 'history'>, additional_platform_path?: string[]) => void;
    routeTo: (pathname: string) => void;
    server_time: Moment;
    changeCurrentLanguage: (new_language: string) => void;
    changeSelectedLanguage: (key: string) => void;
    current_language: string;
    is_language_changing: boolean;
    services_error: TCommonStoreServicesError;
    is_socket_opened: boolean;
    setAppstorePlatform: (value?: string) => void;
    setError?: (has_error: boolean, error: TCommonStoreError) => void;
    setSelectedContractType: (contract_type: string) => void;
    setServicesError: (error: TCommonStoreServicesError, hide_toast: boolean) => void;
    resetServicesError: () => void;
    showError: (error: TCommonStoreError) => void;
    app_routing_history: TAppRoutingHistory[];
    getExchangeRate: (from_currency: string, to_currency: string) => Promise<number>;
    network_status: Record<string, never> | { [key: string]: string };
};

type TUiStore = {
    advanced_duration_unit: string;
    advanced_expiry_type: string;
    addToast: (toast_config: TAddToastProps) => void;
    app_contents_scroll_ref: React.MutableRefObject<null | HTMLDivElement>;
    current_focus: string | null;
    disableApp: () => void;
    duration_t: number;
    enableApp: () => void;
    getDurationFromUnit: (unit: string) => number;
    has_real_account_signup_ended: boolean;
    header_extension: JSX.Element | null;
    is_additional_kyc_info_modal_open: boolean;
    is_advanced_duration: boolean;
    is_history_tab_active: boolean;
    is_forced_to_exit_pnv: boolean;
    is_phone_verification_completed: boolean;
    is_redirected_from_email: boolean;
    is_chart_asset_info_visible?: boolean;
    is_chart_layout_default: boolean;
    is_chart_countdown_visible: boolean;
    is_closing_create_real_account_modal: boolean;
    is_from_signup_account: boolean;
    is_dark_mode_on: boolean;
    is_loading: boolean;
    is_reports_visible: boolean;
    is_reset_password_modal_visible: boolean;
    is_route_modal_on: boolean;
    is_language_settings_modal_on: boolean;
    is_verification_modal_visible: boolean;
    is_verification_submitted: boolean;
    is_desktop: boolean;
    is_app_disabled: boolean;
    is_link_expired_modal_visible: boolean;
    is_mobile: boolean;
    is_tablet: boolean;
    is_mobile_language_menu_open: boolean;
    is_positions_drawer_on: boolean;
    is_reset_email_modal_visible: boolean;
    is_services_error_visible: boolean;
    is_trading_assessment_for_existing_user_enabled: boolean;
    isUrlUnavailableModalVisible: boolean;
    onChangeUiStore: ({ name, value }: { name: string; value: unknown }) => void;
    openPositionsDrawer: () => void;
    notification_messages_ui: (props?: {
        is_notification_loaded?: boolean;
        is_mt5?: boolean;
        stopNotificationLoading?: () => void;
        show_trade_notifications?: boolean;
    }) => JSX.Element;
    setChartCountdown: (value: boolean) => void;
    populateFooterExtensions: (
        footer_extensions:
            | [
                  {
                      position?: string;
                      Component?: React.FunctionComponent;
                      has_right_separator?: boolean;
                  },
              ]
            | []
    ) => void;
    resetPurchaseStates: () => void;
    setAppContentsScrollRef: (ref: React.MutableRefObject<null | HTMLDivElement>) => void;
    setCurrentFocus: (value: string | null) => void;
    setDarkMode: (is_dark_mode_on: boolean) => boolean;
    setIsWalletModalVisible: (value: boolean) => void;
    setIsForcedToExitPnv: (value: boolean) => void;
    setIsPhoneVerificationCompleted: (value: boolean) => void;
    setRedirectFromEmail: (value: boolean) => void;
    setMobileLanguageMenuOpen: (is_mobile_language_menu_open: boolean) => void;
    setReportsTabIndex: (value: number) => void;
    setIsClosingCreateRealAccountModal: (value: boolean) => void;
    setIsFromSignupAccount: (value: boolean) => void;
    setIsVerificationModalVisible: (value: boolean) => void;
    setIsVerificationSubmitted: (value: boolean) => void;
    setRealAccountSignupEnd: (status: boolean) => void;
    setPurchaseState: (index: number) => void;
    simple_duration_unit: string;
    should_show_phone_number_otp: boolean;
    setShouldShowPhoneNumberOTP: (value: boolean) => void;
    sub_section_index: number;
    setPromptHandler: (
        condition: boolean,
        cb?: (() => void) | ((route_to: RouteComponentProps['location'], action: string) => boolean)
    ) => void;
    setSubSectionIndex: (index: number) => void;
    shouldNavigateAfterChooseCrypto: (value: Omit<string, TRoutes> | TRoutes) => void;
    should_show_real_accounts_list?: boolean;
    toggleCashier: () => void;
    toggleHistoryTab: (state_change?: boolean) => void;
    toggleLanguageSettingsModal: () => void;
    toggleLinkExpiredModal: (state_change: boolean) => void;
    togglePositionsDrawer: () => void;
    toggleResetEmailModal: (state_change: boolean) => void;
    toggleResetPasswordModal: (state_change: boolean) => void;
    toggleServicesErrorModal: (is_visible: boolean) => void;
    toggleShouldShowRealAccountsList: (value: boolean) => void;
    toggleUrlUnavailableModal: (value: boolean) => void;
    removeToast: (key: string) => void;
    is_ready_to_deposit_modal_visible: boolean;
    reports_route_tab_index: number;
    should_show_cancellation_warning: boolean;
    should_trigger_tour_guide: boolean;
    toggleCancellationWarning: (state_change?: boolean) => void;
    toggleReports: (is_visible: boolean) => void;
    is_real_acc_signup_on: boolean;
    is_need_real_account_for_cashier_modal_visible: boolean;
    toggleNeedRealAccountForCashierModal: () => void;
    is_switch_to_deriv_account_modal_visible: boolean;
    openSwitchToRealAccountModal: () => void;
    openDerivRealAccountNeededModal: () => void;
    is_top_up_virtual_open: boolean;
    is_top_up_virtual_in_progress: boolean;
    is_top_up_virtual_success: boolean;
    real_account_signup_target: string;
    closeSuccessTopUpModal: () => void;
    closeTopUpModal: () => void;
    openAccountNeededModal: () => void;
    openTopUpModal: () => void;
    is_reset_trading_password_modal_visible: boolean;
    real_account_signup: RealAccountSignupSettings;
    resetRealAccountSignupParams: () => void;
    setResetTradingPasswordModalOpen: () => void;
    populateHeaderExtensions: (header_items: JSX.Element | null) => void;
    populateSettingsExtensions: (menu_items: Array<TPopulateSettingsExtensionsMenuItem> | null) => void;
    purchase_states: boolean[];
    vanilla_trade_type: 'VANILLALONGCALL' | 'VANILLALONGPUT';
    field_ref_to_focus: string | null; // field_ref_to_focus accepts a field identifier which will be focused
    setFieldRefToFocus: (value: string | null) => void;
    setHashedValue: (value: string) => void;
    url_hashed_values: string;
    is_tnc_update_modal_open: boolean;
    toggleTncUpdateModal: (value: boolean) => void;
};

type TPortfolioStore = {
    active_positions: TPortfolioPosition[];
    active_positions_count: number;
    all_positions: TPortfolioPosition[];
    barriers: TBarriers;
    error: string;
    getPositionById: (id: number) => TPortfolioPosition;
    is_active_empty: boolean;
    is_loading: boolean;
    is_multiplier: boolean;
    is_accumulator: boolean;
    is_turbos: boolean;
    onBuyResponse: (contract_info: { contract_id: number; longcode: string; contract_type: string }) => void;
    onHoverPosition: (is_over: boolean, position: TPortfolioPosition, underlying: string) => void;
    onClickCancel: (contract_id?: number) => void;
    onClickSell: (contract_id?: number) => void;
    onMount: () => void;
    onUnmount: () => void;
    open_accu_contract: TPortfolioPosition | null;
    positions: TPortfolioPosition[];
    removePositionById: (contract_id?: number) => void;
    setContractType: (contract_type: string) => void;
    setAddNotificationBannerCallback: (
        cb?: (params: { message: string; redirectTo: string; timestamp: number; title: string }, status: string) => void
    ) => void;
};

type TAccumulatorBarriersData = {
    current_spot: number;
    current_spot_time: number;
    tick_update_timestamp: number;
    accumulators_high_barrier: string;
    accumulators_low_barrier: string;
    barrier_spot_distance: string;
    previous_spot_time: number;
};
type TAccumulatorContractBarriersData = TAccumulatorBarriersData & {
    should_update_contract_barriers: boolean;
};
type TAddContractParams = {
    barrier: number | null;
    contract_id: number;
    contract_type: string;
    start_time: number;
    longcode: string;
    underlying: string;
    is_tick_contract: boolean;
    limit_order?: ProposalOpenContract['limit_order'];
};
type TOnChartBarrierChange = null | ((barrier_1: string, barrier_2?: string) => void);
type TOnChangeParams = { high: string | number; low?: string | number; title?: string; hidePriceLines?: boolean };
type TBarriers = Array<{
    color: string;
    lineStyle: string;
    shade?: string;
    shadeColor?: string;
    high?: string | number;
    low?: string | number;
    onChange: (barriers: TOnChangeParams) => void;
    relative: boolean;
    draggable: boolean;
    hidePriceLines: boolean;
    hideBarrierLine?: boolean;
    hideOffscreenLine?: boolean;
    title?: string;
    onChartBarrierChange: TOnChartBarrierChange | null;
    key?: string;
    hideOffscreenBarrier?: boolean;
    isSingleBarrier?: boolean;
    onBarrierChange: (barriers: TOnChangeParams) => void;
    updateBarriers: (
        high: string | number,
        low?: string | number,
        title?: string,
        hidePriceLines?: boolean,
        isFromChart?: boolean
    ) => void;
    updateBarrierShade: (should_display: boolean, contract_type: string) => void;
    barrier_count: number;
    default_shade: string;
    updateColor: ({ barrier_color, shade_color }: { barrier_color?: string; shade_color?: string }) => void;
}>;
type TContractTradeStore = {
    accu_barriers_timeout_id: NodeJS.Timeout | null;
    accumulator_barriers_data: Partial<TAccumulatorBarriersData>;
    accumulator_contract_barriers_data: Partial<TAccumulatorContractBarriersData>;
    previous_accumulator_barriers_data: Partial<TAccumulatorBarriersData>;
    addContract: ({
        barrier,
        contract_id,
        contract_type,
        start_time,
        longcode,
        underlying,
        is_tick_contract,
        limit_order,
    }: TAddContractParams) => void;
    chart_type: string;
    clearAccumulatorBarriersData: (should_clear_contract_data_only?: boolean, should_clear_timeout?: boolean) => void;
    clearError: () => void;
    contracts: TContractStore[];
    error_message: string;
    filtered_contracts: TPortfolioPosition[];
    getContractById: (contract_id?: number) => TContractStore;
    granularity: null | number;
    has_crossed_accu_barriers: boolean;
    has_error: boolean;
    is_barriers_loading: boolean;
    last_contract: TContractStore | Record<string, never>;
    markers_array: Array<{
        type: string;
        contract_info: TPortfolioPosition['contract_info'];
        key: string;
        price_array: [string, string];
        epoch_array: [number];
    }>;
    onUnmount: () => void;
    prev_chart_type: string;
    prev_contract: TContractStore | Record<string, never>;
    prev_granularity: number | null;
    removeContract: (data: { contract_id: string }) => void;
    savePreviousChartMode: (chart_type: string, granularity: number | null) => void;
    setBarriersLoadingState: (is_loading: boolean) => void;
    setNewAccumulatorBarriersData: (
        new_barriers_data: TAccumulatorBarriersData,
        should_update_contract_barriers?: boolean
    ) => void;
    updateAccumulatorBarriersData: ({
        accumulators_high_barrier,
        accumulators_low_barrier,
        barrier_spot_distance,
        current_spot,
        current_spot_time,
        should_update_contract_barriers,
        underlying,
    }: Partial<TAccumulatorContractBarriersData & { underlying: string }>) => void;
    updateChartType: (type: string) => void;
    updateGranularity: (granularity: number | null) => void;
    updateProposal: (response: ProposalOpenContract) => void;
};

type TContractStore = {
    clearContractUpdateConfigValues: () => void;
    contract_info: TPortfolioPosition['contract_info'];
    contract_update_history: ContractUpdateHistory;
    contract_update_take_profit: number | string;
    contract_update_stop_loss: number | string;
    digits_info: { [key: number]: { digit: number; spot: string } };
    display_status: string;
    has_contract_update_take_profit: boolean;
    has_contract_update_stop_loss: boolean;
    is_digit_contract: boolean;
    is_ended: boolean;
    onChange: (param: { name: string; value: string | number | boolean }) => void;
    updateLimitOrder: () => void;
    validation_errors: { contract_update_stop_loss: string[]; contract_update_take_profit: string[] };
};

type TNotificationStore = {
    addNotificationMessage: (message: TNotification) => void;
    addNotificationMessageByKey: (key: string) => void;
    addTradeNotification: (contract_info: TContractInfo) => void;
    client_notifications: Record<string, TNotificationMessage>;
    is_notifications_empty: boolean;
    is_notifications_visible: boolean;
    filterNotificationMessages: () => void;
    notifications: TNotificationMessage[];
    refreshNotifications: () => void;
    removeAllNotificationMessages: (should_close_persistent: boolean) => void;
    removeNotifications: (should_close_persistent: boolean) => void;
    removeNotificationByKey: ({ key }: { key: string }) => void;
    removeNotificationMessage: ({ key, should_show_again }: { key: string; should_show_again?: boolean }) => void;
    removeNotificationMessageByKey: ({ key }: { key: string }) => void;
    removeTradeNotifications: (id?: string) => void;
    setShouldShowPopups: (should_show_popups: boolean) => void;
    toggleNotificationsModal: () => void;
    trade_notifications: Array<{
        buy_price: number;
        contract_id: number;
        currency: string;
        contract_type: string;
        id: string;
        profit: number;
        status: string;
        symbol: string;
        timestamp: number;
    }>;
};

type TActiveSymbolsStore = {
    active_symbols: ActiveSymbols;
    setActiveSymbols: () => Promise<void>;
};

type TBalance = {
    currency: string;
    balance: number;
};

type TModalData = {
    active_modal: string;
    data: Record<string, unknown>;
};

type TContractReplay = {
    contract_store: {
        accumulator_previous_spot_time: number | null;
        barriers_array: Array<TCoreStores['chart_barrier_store']> | [];
        contract_config:
            | Record<string, never>
            | {
                  chart_type: string;
                  granularity?: number;
                  end_epoch?: number;
                  start_epoch: number;
                  scroll_to_epoch: number;
              }
            | null;
        contract_info: TPortfolioPosition['contract_info'];
        contract_update: ProposalOpenContract['limit_order'];
        contract_update_history: TContractStore['contract_update_history'];
        digits_info: { [key: number]: { digit: number; spot: string } };
        display_status: string;
        getContractsArray: () => {
            type: string;
            markers: Array<{
                color: string;
                epoch: number;
                quote?: number;
                text?: string;
                type: string;
            }>;
            props: {
                hasPersistentBorders: boolean;
            };
        }[];
        is_digit_contract: boolean;
        is_ended: boolean;
        marker: {
            contract_info: TPortfolioPosition['contract_info'];
            epoch_array: Array<number> | [];
            key: string;
            price_array: Array<number> | [];
            type: string;
        };
        markers_array:
            | []
            | Array<{
                  content_config: TMarkerContentConfig;
                  marker_config: {
                      ContentComponent: React.ComponentType<TMarkerContentConfig> | string;
                      className?: string;
                      x: string | number;
                      y: string | number | null;
                  };
                  react_key: string;
                  type: string;
              }>;
    };
    chart_state: string;
    chartStateChange: (state: string, option?: TChartStateChangeOption) => void;
    error_code?: string;
    error_message?: string;
    has_error: boolean;
    is_chart_loading: boolean;
    is_market_closed: boolean;
    is_sell_requested: boolean;
    margin?: number;
    onClickCancel: (contract_id?: number) => void;
    onClickSell: (contract_id?: number) => void;
    onMount: (contract_id?: number) => void;
    onUnmount: () => void;
    removeErrorMessage: () => void;
};
type TGtmStore = {
    is_gtm_applicable: boolean;
    visitorId: Readonly<string>;
    common_variables: Readonly<{
        language: string;
        visitorId?: string;
        currency?: string;
        userId?: string;
        email?: string;
        loggedIn: boolean;
        theme: 'dark' | 'light';
        platform: 'DBot' | 'MT5' | 'DTrader' | 'undefined';
    }>;
    pushDataLayer: (data: Record<string, unknown>) => void;
    pushTransactionData: (response: Transaction, extra_data: Record<string, unknown>) => void;
    eventHandler: (get_settings: GetSettings) => void;
    setLoginFlag: (event_name: string) => void;
};

/**
 * This is the type that contains all the `core` package stores
 */
export type TCoreStores = {
    client: TClientStore;
    common: TCommonStore;
    ui: TUiStore;
    portfolio: TPortfolioStore;
    contract_trade: TContractTradeStore;
    // This should be `any` as this property will be handled in each package.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modules: Record<string, any>;
    notifications: TNotificationStore;
    gtm: TGtmStore;
    contract_replay: TContractReplay;
    chart_barrier_store: TBarriers[number];
    active_symbols: TActiveSymbolsStore;
};

export type TStores = TCoreStores & {
    feature_flags: FeatureFlagsStore;
};
