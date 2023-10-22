// eslint-disable-next-line max-classes-per-file
import { expect } from 'chai';
import sinon from 'sinon';
import Block, { BlockType } from './Block';
import { registerComponent } from './resgiterComponent';

interface Props {
    text?: string,
    childText?: string,
    childClick?: () => void,
    events?: Record<string, ()=>void>
}

class FakePage extends Block {
    constructor(props: Props) {
        super({ ...props });
    }

    render(): string {
        return `<div>
                    <span id="test-text">{{text}}</span>
                    {{{ Input childText=childText childClick=childClick ref="input" }}}
                </div>`;
    }
}

class FakeChild extends Block {
    constructor(props: Props) {
        super({
            ...props,
            events: {
                click: () => {
                    if (props.childClick) {
                        props.childClick();
                    }
                },
            },
        });
    }

    render(): string {
        return '<span id="child-text">{{childText}}</div>';
    }
}

registerComponent('Input', FakeChild as BlockType);

describe('Block', () => {
    let PageClass: typeof FakePage;
    let clock: sinon.SinonFakeTimers;
    const app = document.body.querySelector('#app') as Element;

    before(() => {
        PageClass = FakePage;
        clock = sinon.useFakeTimers();
    });

    beforeEach(() => {
        clock.reset();
        app.innerHTML = '';
    });

    it('Должен создать компонент с состоянием из конструктора', () => {
        const text = 'test';
        const pageComponent = new PageClass({ text });

        const spanElement = pageComponent.element?.querySelector('#test-text')?.innerHTML;

        expect(spanElement).to.be.eq(text);
    });

    it('Должен иметь реактивное поведение', () => {
        const text = 'new value';
        const pageComponent = new PageClass({ text: 'old value' });
        pageComponent.setProps({ text });

        const spanElement = pageComponent.element?.querySelector('#test-text')?.innerHTML;

        expect(spanElement).to.be.eq(text);
    });

    it('Должен установить событие на элемент', () => {
        const handlerStab = sinon.stub();
        const pageComponent = new PageClass({
            events: {
                click: handlerStab,
            },
        });

        const eventClick = new MouseEvent('click');
        pageComponent.element?.dispatchEvent(eventClick);

        /**
         * expect(handlerStab.calledOnce).to.be.true; - causes an error:
         * ESLint: Expected an assignment or function call and instead saw an expression.
         */
        expect(handlerStab.calledOnce).to.be.eq(true);
    });

    it('Должен вызвать dispatchComponentDidMount метод', () => {
        const pageComponent = new PageClass({});
        const dispatchComponentDidMount = sinon.stub(pageComponent, 'dispatchComponentDidMount');
        const element = pageComponent.getContent() as HTMLElement;

        app.append(element);
        clock.next(); // вызов dispatchComponentDidMount для FakeChild
        clock.next(); // вызов dispatchComponentDidMount для FakePage

        /**
         * expect(dispatchComponentDidMount.calledOnce).to.be.true; - causes an error:
         * ESLint: Expected an assignment or function call and instead saw an expression.
         */
        expect(dispatchComponentDidMount.calledOnce).to.be.eq(true);
    });

    it('Должен вызвать afterComponentUpdate, после обновления свойств', () => {
        const pageComponent = new PageClass({});
        const afterComponentUpdate = sinon.stub(pageComponent as FakePage, 'afterComponentUpdate');
        const element = pageComponent.getContent() as HTMLElement;

        app.append(element);
        pageComponent.setProps({ text: 'value' });

        /**
         * expect(afterComponentUpdate.calledOnce).to.be.true; - causes an error:
         * ESLint: Expected an assignment or function call and instead saw an expression.
         */
        expect(afterComponentUpdate.calledOnce).to.be.eq(true);
    });

    it('Не должен вызвать afterComponentUpdate, если значение свойств не поменялось', () => {
        const pageComponent = new PageClass({ text: 'value' });
        const afterComponentUpdate = sinon.stub(pageComponent as FakePage, 'afterComponentUpdate');
        const element = pageComponent.getContent() as HTMLElement;

        app.append(element);
        pageComponent.setProps({ text: 'value' });

        /**
         * expect(afterComponentUpdate.calledOnce).to.be.false; - causes an error:
         * ESLint: Expected an assignment or function call and instead saw an expression.
         */
        expect(afterComponentUpdate.calledOnce).to.be.eq(false);
    });

    it('Должен вызвать componentWillUnmount, если компонент пропадет из DOM', () => {
        const pageComponent = new PageClass({});
        const componentWillUnmount = sinon.stub(pageComponent as FakePage, 'componentWillUnmount');
        const element = pageComponent.getContent() as HTMLElement;

        app.append(element);
        clock.next();
        app.innerHTML = '';
        clock.next();

        /**
         * expect(componentWillUnmount.calledOnce).to.be.true; - causes an error:
         * ESLint: Expected an assignment or function call and instead saw an expression.
         */
        expect(componentWillUnmount.calledOnce).to.be.eq(true);
    });

    describe('ChildBlock', () => {
        it('Должен создать компонент с состоянием из конструктора', () => {
            const childText = 'test';
            const pageComponent = new PageClass({ childText });

            const spanElement = pageComponent.element?.querySelector('#child-text')?.innerHTML;

            expect(spanElement).to.be.eq(childText);
        });

        it('Должен иметь реактивное поведение', () => {
            const childText = 'new value';
            const pageComponent = new PageClass({ childText: 'old value' });
            pageComponent.setProps({ childText });

            const spanElement = pageComponent.element?.querySelector('#child-text')?.innerHTML;

            expect(spanElement).to.be.eq(childText);
        });

        it('Должен установить событие на элемент', () => {
            const handlerStab = sinon.stub();
            const pageComponent = new PageClass({
                childClick: handlerStab,
            });

            const eventClick = new MouseEvent('click');
            const child = pageComponent?.children[0] as Block;
            child?.element?.dispatchEvent(eventClick);

            /**
             * expect(handlerStab.calledOnce).to.be.true; - causes an error:
             * ESLint: Expected an assignment or function call and instead saw an expression.
             */
            expect(handlerStab.calledOnce).to.be.eq(true);
        });

        it('Должен вызвать dispatchComponentDidMount метод', () => {
            const pageComponent = new PageClass({});
            const child = pageComponent?.children[0] as Block;
            const dispatchComponentDidMount = sinon.stub(child, 'dispatchComponentDidMount');
            const element = pageComponent.getContent() as HTMLElement;

            app.append(element);
            clock.next(); // вызов dispatchComponentDidMount для FakeChild

            /**
             * expect(dispatchComponentDidMount.calledOnce).to.be.true; - causes an error:
             * ESLint: Expected an assignment or function call and instead saw an expression.
             */
            expect(dispatchComponentDidMount.calledOnce).to.be.eq(true);
        });

        it('Должен вызвать componentWillUnmount, если компонент пропадет из DOM', () => {
            const pageComponent = new PageClass({});
            const child = pageComponent?.children[0] as FakeChild;
            const componentWillUnmount = sinon.stub(child, 'componentWillUnmount');
            const element = pageComponent.getContent() as HTMLElement;

            app.append(element);
            clock.next();
            app.innerHTML = '';
            clock.next();

            /**
             * expect(componentWillUnmount.calledOnce).to.be.true; - causes an error:
             * ESLint: Expected an assignment or function call and instead saw an expression.
             */
            expect(componentWillUnmount.calledOnce).to.be.eq(true);
        });
    });
});
