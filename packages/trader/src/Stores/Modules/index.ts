import { TCoreStores } from '@deriv/stores/types';

import { TRootStore } from 'Types';

import MarketsStore from './Markets/markets-store';
import PositionsStore from './Positions/positions-store';
import TradeStore from './Trading/trade-store';

export default class ModulesStore {
    positions: PositionsStore;
    markets: MarketsStore;
    trade: TradeStore;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cashier: any;

    constructor(root_store: TRootStore, core_store: TCoreStores) {
        this.cashier = core_store.modules.cashier;
        this.trade = new TradeStore({ root_store });
        this.positions = new PositionsStore({ root_store });
        this.markets = new MarketsStore({ root_store });
    }
}
