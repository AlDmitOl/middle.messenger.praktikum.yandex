import './chat-footer.sass';
import chatFooterTmpl from './chat-footer.hbs?raw';
import Block, { Props } from '../../core/Block';
import { InputField } from '../input-field/input-field';
import { sendTextMessage } from '../../services/chat';

export class ChatFooter extends Block {
    protected constructor(props: Props = {}) {
        super({
            ...props,
            onSend: () => {
                this.send();
            },
            onKeyDown: (event: KeyboardEvent) => {
                if (event?.key === 'Enter') {
                    event.preventDefault();
                    this.send();
                }
            },
            onShowSmileMenu: (event: MouseEvent) => {
                event.preventDefault();
                alert('Этот функционал на данный момент не доступен');
            },
            onShowScrapMenu: (event: MouseEvent) => {
                event.preventDefault();
                alert('Этот функционал на данный момент не доступен');
            },
        });
    }

    protected send() {
        const inputField = this.refs?.message as InputField || undefined;
        const value = inputField?.value() || '';
        if (value) {
            sendTextMessage(value);
            inputField.setValue('');
        }
    }

    protected render(): string {
        return chatFooterTmpl;
    }
}
