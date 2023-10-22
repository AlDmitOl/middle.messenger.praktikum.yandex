import sinon from 'sinon';
import { expect } from 'chai';
import HTTPTransport, { METHOD } from './HTTPTransport';
import constants from '../constants';

describe('HTTPTransport', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('Должен иметь get запрос', async () => {
        const http = new HTTPTransport('/test');
        const requestStub = sinon.stub(http, 'request').resolves();

        await http.get('', {});

        const expectedUrl = `${constants.HOST}/test`;

        expect(requestStub.calledWith(expectedUrl, { method: METHOD.GET })).to.be.eq(true);
    });

    it('Должен преобразовать данные data в url при get запросе', async () => {
        const http = new HTTPTransport('/test');
        const requestStub = sinon.stub(http, 'request').resolves();

        await http.get('', { data: { a: '1', b: '2 2' } });

        const expectedUrl = `${constants.HOST}/test?a=1&b=2%202`;
        expect(requestStub.calledWith(expectedUrl, { method: METHOD.GET })).to.be.eq(true);
    });

    it('Должен иметь post запрос', async () => {
        const http = new HTTPTransport('/test');
        const requestStub = sinon.stub(http, 'request').resolves();

        await http.post('', {});

        const expectedUrl = `${constants.HOST}/test`;
        expect(requestStub.calledWith(expectedUrl, { method: METHOD.POST })).to.be.eq(true);
    });

    it('Должен иметь put запрос', async () => {
        const http = new HTTPTransport('/test');
        const requestStub = sinon.stub(http, 'request').resolves();

        await http.put('', {});

        const expectedUrl = `${constants.HOST}/test`;
        expect(requestStub.calledWith(expectedUrl, { method: METHOD.PUT })).to.be.eq(true);
    });

    it('Должен иметь delete запрос', async () => {
        const http = new HTTPTransport('/test');
        const requestStub = sinon.stub(http, 'request').resolves();

        await http.delete('', {});

        const expectedUrl = `${constants.HOST}/test`;
        expect(requestStub.calledWith(expectedUrl, { method: METHOD.DELETE })).to.be.eq(true);
    });
});
