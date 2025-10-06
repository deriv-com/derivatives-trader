import React from 'react';
import { withRouter } from 'react-router';
import classNames from 'classnames';

import { DataList, DataTable, usePrevious } from '@deriv/components';
import { extractInfoFromShortcode, formatDate, getContractPath, getUnsupportedContracts } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { Analytics } from '@deriv-com/analytics';
import { Localize, useTranslations } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';

import { getProfitTableColumnsTemplate } from 'Constants/data-table-constants';
import { useReportsStore } from 'Stores/useReportsStores';
import { TUnsupportedContractType } from 'Types';

import { ReportsTableRowLoader } from '../Components/Elements/ContentLoader';
import EmptyTradeHistoryMessage from '../Components/empty-trade-history-message';
import CompositeCalendar from '../Components/Form/CompositeCalendar';
import PlaceholderComponent from '../Components/placeholder-component';
import { ReportsMeta } from '../Components/reports-meta';

type TProfitTable = {
    component_icon: React.ReactElement;
};

type TDataListCell = React.ComponentProps<typeof DataList.Cell>;

type TGetProfitTableColumnsTemplate = ReturnType<typeof getProfitTableColumnsTemplate>;

export const getRowAction = (row_obj: { [key: string]: unknown }) => {
    const contract_type = extractInfoFromShortcode(row_obj?.shortcode as string)
        ?.category?.toString()
        .toUpperCase();
    return getUnsupportedContracts()[contract_type as TUnsupportedContractType]
        ? {
              component: (
                  <Localize
                      i18n_default_text="The {{trade_type_name}} contract details aren't currently available. We're working on making them available soon."
                      values={{
                          trade_type_name: getUnsupportedContracts()[contract_type as TUnsupportedContractType]?.name,
                      }}
                  />
              ),
          }
        : getContractPath(Number(row_obj.contract_id));
};

const ProfitTable = observer(({ component_icon }: TProfitTable) => {
    const { localize } = useTranslations();
    const { client } = useStore();
    const { profit_table } = useReportsStore();
    const { currency } = client;
    const {
        data,
        date_from,
        date_to,
        error,
        is_empty,
        is_loading,
        handleDateChange,
        handleScroll,
        has_selected_date,
        onMount,
        onUnmount,
        totals,
    } = profit_table;
    const prev_date_from = usePrevious(date_from);
    const prev_date_to = usePrevious(date_to);
    const { isDesktop } = useDevice();

    if (error) return <p>{error}</p>;

    const filter_component = <CompositeCalendar onChange={handleDateChange} from={date_from} to={date_to} />;

    const columns: TGetProfitTableColumnsTemplate = getProfitTableColumnsTemplate(currency, data.length, isDesktop);

    const columns_map = Object.fromEntries(columns.map(column => [column.col_index, column])) as Record<
        TGetProfitTableColumnsTemplate[number]['col_index'],
        TGetProfitTableColumnsTemplate[number]
    >;

    const mobileRowRenderer: React.ComponentProps<typeof DataList>['rowRenderer'] = ({ row, is_footer }) => {
        const duration_type = row?.duration_type;
        const formatted_duration_type = duration_type ? duration_type[0].toUpperCase() + duration_type.slice(1) : '';
        const duration_classname = duration_type ? `duration-type__${duration_type.toLowerCase()}` : '';

        if (is_footer) {
            return (
                <div className='data-list__row'>
                    <DataList.Cell
                        row={row}
                        column={columns_map.action_type as TDataListCell['column']}
                        is_footer={is_footer}
                    />
                    <DataList.Cell
                        className='data-list__row-cell--amount'
                        row={row}
                        column={columns_map.profit_loss as TDataListCell['column']}
                        is_footer={is_footer}
                    />
                </div>
            );
        }

        return (
            <>
                <div className='data-list__row'>
                    <DataList.Cell row={row} column={columns_map.action_type as TDataListCell['column']} />
                    <div className={classNames('duration-type', duration_classname)}>
                        <div className={classNames('duration-type__background', `${duration_classname}__background`)} />
                        <span className={`${duration_classname}__label`}>{formatted_duration_type}</span>
                    </div>
                </div>
                <div className='data-list__row'>
                    <DataList.Cell row={row} column={columns_map.transaction_id as TDataListCell['column']} />
                    <DataList.Cell
                        className='data-list__row-cell--amount'
                        row={row}
                        column={columns_map.currency as TDataListCell['column']}
                    />
                </div>
                <div className='data-list__row'>
                    <DataList.Cell row={row} column={columns_map.purchase_time as TDataListCell['column']} />
                    <DataList.Cell
                        className='data-list__row-cell--amount'
                        row={row}
                        column={columns_map.buy_price as TDataListCell['column']}
                    />
                </div>
                <div className='data-list__row'>
                    <DataList.Cell row={row} column={columns_map.sell_time as TDataListCell['column']} />
                    <DataList.Cell
                        className='data-list__row-cell--amount'
                        row={row}
                        column={columns_map.sell_price as TDataListCell['column']}
                    />
                </div>
                <div className='data-list__row'>
                    <DataList.Cell row={row} column={columns_map.profit_loss as TDataListCell['column']} />
                </div>
            </>
        );
    };

    return (
        <React.Fragment>
            <ReportsMeta filter_component={filter_component} className='profit-table__filter' />
            <React.Fragment>
                {data.length === 0 || is_empty ? (
                    <PlaceholderComponent
                        is_loading={is_loading}
                        has_selected_date={has_selected_date}
                        is_empty={is_empty}
                        empty_message_component={EmptyTradeHistoryMessage}
                        component_icon={component_icon}
                        localized_message={localize('You have no trading activity yet.')}
                        localized_period_message={localize(
                            "You've made no transactions of this type during this period."
                        )}
                    />
                ) : (
                    <div className='reports__content'>
                        {isDesktop ? (
                            <DataTable
                                className='profit-table'
                                data_source={data}
                                columns={columns}
                                onScroll={handleScroll}
                                footer={totals}
                                getRowAction={getRowAction}
                                getRowSize={() => 63}
                                content_loader={ReportsTableRowLoader}
                            >
                                <PlaceholderComponent is_loading={is_loading} />
                            </DataTable>
                        ) : (
                            <DataList
                                className='profit-table'
                                data_source={data}
                                rowRenderer={mobileRowRenderer}
                                getRowAction={getRowAction}
                                onScroll={handleScroll}
                                footer={totals}
                                row_gap={8}
                            >
                                <PlaceholderComponent is_loading={is_loading} />
                            </DataList>
                        )}
                    </div>
                )}
            </React.Fragment>
        </React.Fragment>
    );
});

export default withRouter(ProfitTable);
