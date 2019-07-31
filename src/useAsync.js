import {useEffect, useCallback, useRef, useState} from 'react';

export const NOT_MOUNTED = null;
export const INIT = 'INIT';
export const SUCCESS = 'SUCCESS';
export const FAIL = 'FAIL';

export const useAsync = ({asyncFunction, params, onInit, onSuccess, onFail}) => {

    const promiseRef = useRef(null);
    const canceled = useRef(false);
    const [state, setState] = useState(NOT_MOUNTED);

    const invoke = useCallback((...args) => {
        if (onInit) {
            onInit({result: null, error: null, args});
        }

        setState(INIT);
        const promiseOrResult = asyncFunction(...args);

        if (promiseOrResult instanceof Promise) {
            promiseRef.current = promiseOrResult;
            promiseOrResult
                .then(
                    result => {
                        setState(SUCCESS);
                        if (!canceled.current) {
                            if (onSuccess) {
                                onSuccess({result, error: null, args});
                            }
                        }
                        return result;
                    }
                )
                .catch((error) => {
                    setState(FAIL);
                    if (!canceled.current) {
                        if (onFail) {
                            onFail({result: null, error, args});
                        }
                    }
                });

        } else {
            setState(SUCCESS);
            if (onSuccess) {
                onSuccess({result: promiseOrResult, error: null, args});
            }
            Promise.resolve(promiseOrResult).catch(()=>{});
        }
    }, [asyncFunction, onInit, onFail, onSuccess]);

    useEffect(() => {
        canceled.current = false;
        return () => {
            setState(NOT_MOUNTED);
            canceled.current = true;
        }
    }, []);

    useEffect(() => {
        if (params !== undefined) {
            invoke(...params);
        }
    }, [invoke, params]);

    return {
        state,
        invoke,
        promise: promiseRef.current
    }
};