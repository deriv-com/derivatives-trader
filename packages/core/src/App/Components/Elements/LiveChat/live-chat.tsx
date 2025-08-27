import { Popover, Text } from '@deriv/components';
import { useIsIntercomAvailable, useIsLiveChatWidgetAvailable } from '@deriv/api';
import { observer } from '@deriv/stores';
import { Localize } from '@deriv-com/translations';
import { Chat } from '@deriv/utils';
import { useDevice } from '@deriv-com/ui';
import { LegacyLiveChatOutlineIcon } from '@deriv/quill-icons';

const LiveChat = observer(({ showPopover }: { showPopover?: boolean }) => {
    const { isDesktop } = useDevice();

    const { is_livechat_available } = useIsLiveChatWidgetAvailable();

    const icAvailable = useIsIntercomAvailable();

    const isNeitherChatNorLiveChatAvailable = !is_livechat_available && !icAvailable;

    if (isNeitherChatNorLiveChatAvailable) {
        return null;
    }

    // Quick fix for making sure livechat won't popup if feature flag is late to enable.
    // We will add a refactor after this
    setInterval(() => {
        if (icAvailable) {
            if (window.LiveChatWidget && typeof window.LiveChatWidget.call === 'function') {
                window.LiveChatWidget.call('destroy');
            }
        }
    }, 10);

    const liveChatClickHandler = () => {
        Chat.open();
    };

    if (isDesktop)
        return (
            <div onKeyDown={liveChatClickHandler} onClick={liveChatClickHandler}>
                {showPopover ? (
                    <Popover
                        className='footer__link'
                        classNameBubble='help-centre__tooltip'
                        alignment='top'
                        message={<Localize i18n_default_text='Live chat' />}
                        zIndex='9999'
                    >
                        <LegacyLiveChatOutlineIcon
                            className='footer__icon gtm-deriv-livechat'
                            iconSize='sm'
                            fill='var(--color-text-primary)'
                        />
                    </Popover>
                ) : (
                    <div className='footer__link'>
                        <LegacyLiveChatOutlineIcon
                            className='footer__icon gtm-deriv-livechat'
                            iconSize='sm'
                            fill='var(--color-text-primary)'
                        />
                    </div>
                )}
            </div>
        );

    return (
        <div className='livechat gtm-deriv-livechat' onKeyDown={liveChatClickHandler} onClick={liveChatClickHandler}>
            <div className='livechat__icon-wrapper'>
                <LegacyLiveChatOutlineIcon className='livechat__icon' iconSize='sm' fill='var(--color-text-primary)' />
            </div>
            <Text size='xs'>
                <Localize i18n_default_text='Live chat' />
            </Text>
        </div>
    );
});

export default LiveChat;
