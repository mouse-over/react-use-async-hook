import {cleanup} from '@testing-library/react';
import {renderHook, act} from '@testing-library/react-hooks'
import {useAsyncWithDispatch} from "../src";

afterEach(cleanup);

const createResolver = (callback) => async (...args) => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            clearTimeout(timeout);
            callback(resolve, reject, args);
        }, 0);
    });
};

const actions = {
    INIT: 'INIT',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE'
}

test('useAsynctWithDispatch success', async () => {
    const originalError = console.error;
    console.error = jest.fn();

    const dispatch = jest.fn();
    const params = [];
    const resolver = createResolver((resolve, reject) => {
        resolve('foo');
    });

    try {
        const {waitForNextUpdate, rerender, result} = renderHook(() => useAsyncWithDispatch({
            asyncFunction: resolver,
            params,
            dispatch,
            actions
        }));

        await waitForNextUpdate();

        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch).toBeCalledWith({payload: 'foo', type: actions.SUCCESS});
        expect(dispatch).toBeCalledWith({payload: null, type: actions.INIT});

    } finally {
        console.error = originalError;
    }
});

test('useAsynctWithDispatch failed', async () => {
    const originalError = console.error;
    console.error = jest.fn();
    const dispatch = jest.fn();
    const params = [];
    const resolver = createResolver((resolve, reject) => {
        reject('foo');
    });
    try {
        const {waitForNextUpdate, rerender, result} = renderHook(() => useAsyncWithDispatch({
            asyncFunction: resolver,
            params,
            dispatch,
            actions
        }));

        await waitForNextUpdate();

        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch).toBeCalledWith({payload: 'foo', type: actions.FAILURE});
        expect(dispatch).toBeCalledWith({payload: null, type: actions.INIT});


    } finally {
        console.error = originalError;
    }
});

test('useAsynctWithDispatch success with change props', async () => {
    const originalError = console.error;
    console.error = jest.fn();
    const dispatch = jest.fn();
    const resolver = createResolver((resolve, reject, args) => {
        if (args.length > 0) {
            resolve('second with args');
        } else {
            resolve('first without args');
        }
    });
    try {
        let params = [];

        const {waitForNextUpdate, rerender, result} = renderHook(() => useAsyncWithDispatch({
            asyncFunction: resolver,
            params,
            dispatch,
            actions
        }));

        await waitForNextUpdate();

        params = ['bar'];
        rerender();

        await waitForNextUpdate();

        expect(dispatch.mock.calls.length).toBe(4);
        expect(dispatch).toBeCalledWith({payload: 'first without args', type: actions.SUCCESS});
        expect(dispatch).toBeCalledWith({payload: 'second with args', type: actions.SUCCESS});
        expect(dispatch).toBeCalledWith({payload: null, type: actions.INIT});


    } finally {
        console.error = originalError;
    }
});
