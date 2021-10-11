import { PureComponent, ReactNode } from 'react';
import Modal, { IProps as IPropsModal } from '@tolkam/react-modal';
import { classNames } from '@tolkam/lib-utils-ui';

const WINDOW = window;
const HISTORY = WINDOW.history;
const HISTORY_NS = 'TkmLayer';

/**
 * Next level
 * @type number
 */
let nextLevel = 0;

class Layer extends PureComponent<IProps, any> {

    public static defaultProps = {
        withHistory: true,
    };

    /**
     * @type {number}
     */
    protected level: number;

    /**
     * @type {boolean}
     */
    protected closedByHistory: boolean = false;

    /**
     * @param {IProps} props
     */
    public constructor(props: IProps) {
        super(props);

        // obtain new id
        this.level = ++nextLevel;
    }

    /**
     * @inheritDoc
     */
    public componentDidMount(): void {
        this.listen(true);
    }

    /**
     * @inheritDoc
     */
    public componentWillUnmount() {
        this.listen(false);
    }

    /**
     * @inheritDoc
     */
    public render() {
        const that = this;
        const props = that.props;
        const mode = props.mode ?? 'overlay';
        const isPopup = mode === 'popup';
        const baseClass = props.classNameLayer ?? 'layer';
        const baseModifiers = props.classModifiersPrefix ?? '';
        const modeClass = baseModifiers + '-' + mode;
        const { footerChildren, headerChildren, busy, busyElement } = props;

        const modeModifiers = (props.modifiers || []).map((m) => ((props.classModesPrefix ?? modeClass) + '-' + m));

        const modalProps = {
            ...props,
            className: classNames(baseClass, modeClass, modeModifiers, {
                [baseModifiers + '-with-header']: !!headerChildren,
                [baseModifiers + '-with-footer']: !!footerChildren,
            }, props.className),
            classNameBackdrop: props.classNameBackdrop ?? 'backdrop',
            classNameBody: props.classNameBody ?? 'body',
            noBackdrop: props.noBackdrop ?? isPopup,
            allowScroll: props.allowScroll ?? isPopup,
            withDocumentClicks: props.withDocumentClicks ?? isPopup,
            onOpen: that.onOpen,
            onClose: that.onClose,
        };

        return <Modal {...modalProps}>
            {headerChildren && <div className={props.classNameHeader ?? 'header'}>{headerChildren}</div>}
            <div className={props.classNameContents ?? 'contents'}>
                {(busy && busyElement) && busyElement}
                {!(busy && !props.keepChildrenOnBusy) && props.children}
            </div>
            {footerChildren && <div className={props.classNameFooter ?? 'footer'}>{footerChildren}</div>}
        </Modal>;
    }

    /**
     * Controls popstate event subscription
     *
     * @param start
     */
    protected listen = (start: boolean) => {
        if (this.props.withHistory) {
            const suf = 'EventListener';
            WINDOW[start ? 'add'+suf : 'remove'+suf]('popstate', this.onHistory);
        }
    };

    /**
     * Handles layer open event
     *
     * @return {void}
     */
    protected onOpen = () => {
        const that = this;
        const { onOpen, withHistory } = that.props;

        if (withHistory) {
            setLocalHistory({top: that.level});
        }

        onOpen && onOpen();
    };

    /**
     * Handles layer close event
     *
     * @return {void}
     */
    protected onClose = () => {
        const that = this;
        const { onClose, withHistory } = that.props;

        if (withHistory) {
            // go back when closed
            if (!that.closedByHistory && getLocalHistory().top === that.level) {
                HISTORY.back();
            }
            that.closedByHistory = false;
        }

        onClose && onClose();
    };

    /**
     * Handles history change event
     *
     * @return {void}
     */
    protected onHistory = () => {
        // @see https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
        setTimeout(() => {
            const that = this;
            const { props, level } = that;
            const { show, onCloseRequest } = props;
            const top = getLocalHistory().top;

            if (!show) {
                // prevent forward navigation
                if (top === level) {
                    HISTORY.back();
                }
            } else {
                if (level > top || top == null) {
                    if(onCloseRequest) {
                        that.closedByHistory = true;
                        onCloseRequest();
                    }
                }
            }
        }, 0);
    };
}

/**
 * Gets private history
 *
 * @return object
 */
function getLocalHistory() {
    const globalState = HISTORY.state;
    let localState = {} as {[k: string]: any};
    if (globalState != null && typeof globalState === 'object') {
        localState = globalState[HISTORY_NS] || localState;
    }
    return localState;
}

/**
 * Sets private history
 *
 * @param next
 * @param replace
 */
function setLocalHistory(next: object, replace?: boolean) {
    let globalState = HISTORY.state || {};
    globalState[HISTORY_NS] = next;
    HISTORY[(replace ? 'replace' : 'push')+'State'](globalState, '');
}

interface IProps extends IPropsModal {

    // with history
    withHistory?: boolean;

    // layer modes
    mode?: 'popup' | 'panel' | 'overlay';

    // mode modifiers
    modifiers?: string[];

    // whether layer is in busy state
    busy?: boolean;

    keepChildrenOnBusy?: boolean;

    // element to show on busy state
    busyElement?: ReactNode;

    // header contents
    headerChildren?: ReactNode | null;

    // footer contents
    footerChildren?: ReactNode;

    classNameLayer?: string;
    classNameHeader?: string;
    classNameContents?: string;
    classNameFooter?: string;
    classModesPrefix?: string;
    classModifiersPrefix?: string;
}

export default Layer;
export {IProps}
