import {cleanup} from '@testing-library/react';
import {renderHook, act} from '@testing-library/react-hooks'
import {useAsync} from "../src";

afterEach(cleanup);

const createResolver = (callback) => async (...args) => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            clearTimeout(timeout);
            callback(resolve, reject, args);
        }, 0);
    });
};

test('useAsync success', async () => {
    const originalError = console.error;
    console.error = jest.fn();

    const onSuccess = jest.fn();
    const onFail = jest.fn();
    const onInit = jest.fn();
    const params = [];
    const resolver = createResolver((resolve, reject) => {
        resolve('foo');
    });
    try {
        const {waitForNextUpdate, rerender, result} = renderHook(() => useAsync({
            asyncFunction: resolver,
            params,
            onSuccess,
            onFail,
            onInit
        }));

        await waitForNextUpdate();

        expect(onInit.mock.calls.length).toBe(1);
        expect(onInit).toBeCalledWith({args: [], error: null, result: null});

        expect(onSuccess.mock.calls.length).toBe(1);
        expect(onSuccess).toBeCalledWith({args: [], error: null, result: 'foo'});

        expect(onFail.mock.calls.length).toBe(0);

    } finally {
        console.error = originalError;
    }
});

test('useAsync failed', async () => {
    const originalError = console.error;
    console.error = jest.fn();
    const onSuccess = jest.fn();
    const onFail = jest.fn();
    const onInit = jest.fn();
    const params = [];
    const resolver = createResolver((resolve, reject) => {
        reject('foo');
    });
    try {
        const {waitForNextUpdate, rerender, result} = renderHook(() => useAsync({
            asyncFunction: resolver,
            params,
            onSuccess,
            onFail,
            onInit
        }));

        await waitForNextUpdate();

        expect(onInit.mock.calls.length).toBe(1);
        expect(onInit).toBeCalledWith({args: [], error: null, result: null});

        expect(onSuccess.mock.calls.length).toBe(0);

        expect(onFail.mock.calls.length).toBe(1);
        expect(onFail).toBeCalledWith({args: [], error: 'foo', result: null});

    } finally {
        console.error = originalError;
    }
});

test('useAsync success with change props', async () => {
    const originalError = console.error;
    console.error = jest.fn();
    const onSuccess = jest.fn();
    const onFail = jest.fn();
    const onInit = jest.fn();
    const resolver = createResolver((resolve, reject, args) => {
        if (args.length > 0) {
            resolve('second with args');
        } else {
            resolve('first without args');
        }
    });
    try {
        let params = [];

        const {waitForNextUpdate, rerender, result} = renderHook(() => useAsync({
            asyncFunction: resolver,
            params,
            onSuccess,
            onFail,
            onInit
        }));

        await waitForNextUpdate();

        expect(onSuccess).toBeCalledWith({args: [], error: null, result: 'first without args'});

        params = ['bar'];
        rerender();

        await waitForNextUpdate();

        expect(onSuccess.mock.calls.length).toBe(2);
        expect(onSuccess).toBeCalledWith({args: ['bar'], error: null, result: 'second with args'});

    } finally {
        console.error = originalError;
    }
});

test('useAsync success with calling invoke', async () => {
    const originalError = console.error;
    console.error = jest.fn();
    const onSuccess = jest.fn();
    const onFail = jest.fn();
    const onInit = jest.fn();
    const resolver = createResolver((resolve, reject, args) => {
        if (args.length > 0) {
            resolve('second with args');
        } else {
            resolve('first without args');
        }
    });
    try {

        const {waitForNextUpdate, rerender, result} = renderHook(() => useAsync({
            asyncFunction: resolver,
            onSuccess,
            onFail,
            onInit
        }));

        result.current.invoke();

        await waitForNextUpdate();

        expect(onSuccess).toBeCalledWith({args: [], error: null, result: 'first without args'});

        result.current.invoke(['bar']);

        await waitForNextUpdate();

        expect(onSuccess.mock.calls.length).toBe(2);
        expect(onSuccess).toBeCalledWith({args: [['bar']], error: null, result: 'second with args'});

    } finally {
        console.error = originalError;
    }
});