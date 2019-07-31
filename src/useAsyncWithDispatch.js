import {useAsync} from "./useAsync";
import {useCallback} from "react";

export const useAsyncWithDispatch = ({asyncFunction, params, dispatch, actions}) => {

    const {
        INIT,
        SUCCESS,
        FAILURE
    } = actions;

    const onSuccess = useCallback(({result}) => {
        dispatch({type: SUCCESS, payload: result});
    }, [dispatch, SUCCESS]);

    const onInit = useCallback(() => {
        dispatch({type: INIT, payload: null});
    }, [dispatch, INIT]);

    const onFail = useCallback(({error}) => {
        dispatch({type: FAILURE, payload: error});
    }, [dispatch, FAILURE]);

    return useAsync({asyncFunction, params, onFail, onInit, onSuccess});
};