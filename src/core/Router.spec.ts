import sinon from 'sinon';
import { expect } from 'chai';
import Router from './Router';
import Block, { BlockType } from './Block';
import Route from './Route';

interface Props {
    text?: string,
}

class FakeBlock extends Block {
    constructor(props: Props) {
        super({ ...props });
    }

    render(): string {
        return '<div><span id="test-text">{{text}}</span></div>';
    }
}

describe('Router', () => {
    const router: Router = new Router('#app');
    before(() => {
        router.use('/', FakeBlock as BlockType)
            .use('/block', FakeBlock as BlockType)
            .use('/block1', FakeBlock as BlockType)
            .use('/block2', FakeBlock as BlockType);
    });

    beforeEach(() => {
        sinon.restore();
    });

    it('Должен получать Router по ссылке', () => {
        const block = router.getRoute('/block');
        expect(block).to.not.eq(undefined);
    });

    it('Должен при старте запускать отрисовку страницы', () => {
        const blank = router.getRoute('/') as Route;
        const render = sinon.stub(blank, 'render');

        router.start();

        expect(render.calledOnce).to.be.eq(true);
    });

    it('Должен отрисовывать страницу при переходе по ссылке', () => {
        const block = router.getRoute('/block') as Route;
        const render = sinon.stub(block, 'render');

        router.go('/block');

        expect(render.calledOnce).to.be.eq(true);
    });

    it('Должен отрисовывать страницу при переходе назад', async () => {
        const clock = sinon.useFakeTimers();
        const block = router.getRoute('/') as Route;
        const render = sinon.stub(block, 'render');

        router.back();
        await clock.tickAsync(1);

        expect(render.calledOnce).to.be.eq(true);
    });

    it('Должен отрисовывать страницу при переходе вперед', async () => {
        const clock = sinon.useFakeTimers();
        const block = router.getRoute('/block') as Route;
        const render = sinon.stub(block, 'render');

        router.forward();
        await clock.tickAsync(1);

        expect(render.calledOnce).to.be.eq(true);
    });
});
