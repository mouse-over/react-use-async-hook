import {useCallback, useState} from "react";
import {useAsync} from "./useAsync";

const defaultState = {isProcessing: false, error: null, result: null};

const useAsyncState = (initialState) => {
    const [value, setValue] = useState({...defaultState, ...(initialState || {})});

    const setResult = useCallback((result) => setValue({...defaultState, result}), []);

    const setLoading = useCallback(() => {
        setValue({...defaultState, isProcessing: true});
    }, []);

    const setFailed = useCallback((error) => setValue({...defaultState, error}), []);

    return {
        value,
        setLoading,
        setFailed,
        setResult
    }
};

export const useAsyncWithState = (props) => {
    const {value, setFailed, setLoading, setResult} = useAsyncState(props.initialState);

    const onSuccess = useCallback(({result}) => {
        setResult(result);
    }, [setResult]);

    const onInit = useCallback(() => {
        setLoading()
    }, [setLoading]);

    const onFail = useCallback(({error}) => {
        setFailed(error);
    }, [setFailed]);

    const returnProps = useAsync({
        ...props,
        onSuccess,
        onInit,
        onFail
    });

    return {
        ...returnProps,
        ...value
    }
};