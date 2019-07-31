import {cleanup} from '@testing-library/react';
import {renderHook, act} from '@testing-library/react-hooks'
import {useAsyncWithState} from "../src";

afterEach(cleanup);

const createResolver = (callback) => async (...args) => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            clearTimeout(timeout);
            callback(resolve, reject, args);
        }, 0);
    });
};


test('useAsyncWithState success', async () => {
    const originalError = console.error;
    console.error = jest.fn();

    const resolver = createResolver((resolve, reject) => {
        resolve('foo');
    });
    const params = [];
    try {
        const {waitForNextUpdate, rerender, result} = renderHook(() => useAsyncWithState({
            asyncFunction: resolver,
            params,
            initialState: {isProcessing: false}
        }));

        expect(result.current.isProcessing).toBeTruthy();
        expect(result.current.error).toBeNull();
        expect(result.current.result).toBeNull();

        await waitForNextUpdate();

        expect(result.current.isProcessing).toBeFalsy();
        expect(result.current.result).toBe('foo');
        expect(result.current.error).toBeNull();

    } finally {
        console.error = originalError;
    }
});

test('useAsyncWithState failed', async () => {
    const originalError = console.error;
    console.error = jest.fn();

    const resolver = createResolver((resolve, reject) => {
        reject('foo');
    });

    const params = [];

    try {
        const {waitForNextUpdate, rerender, result} = renderHook(() => useAsyncWithState({
            asyncFunction: resolver,
            params,
            initialState: {isProcessing: false}
        }));

        expect(result.current.isProcessing).toBeTruthy();
        expect(result.current.error).toBeNull();
        expect(result.current.result).toBeNull();

        await waitForNextUpdate();

        expect(result.current.isProcessing).toBeFalsy();
        expect(result.current.error).toBe('foo');
        expect(result.current.result).toBeNull();

    } finally {
        console.error = originalError;
    }
});

test('useAsyncWithState success with change props', async () => {
    const originalError = console.error;
    console.error = jest.fn();

    try {
        let params = [];

        const resolver = createResolver((resolve, reject, args) => {
            if (args.length > 0) {
                resolve('second with args');
            } else {
                resolve('first without args');
            }
        });

        const {waitForNextUpdate, rerender, result} = renderHook(() => useAsyncWithState({
            asyncFunction: resolver,
            params,
            initialState: {isProcessing: false}
        }));

        await waitForNextUpdate();

        expect(result.current.result).toBe('first without args');

        params = ['bar'];
        rerender();

        await waitForNextUpdate();

        expect(result.current.result).toBe('second with args');

    } finally {
        console.error = originalError;
    }
});