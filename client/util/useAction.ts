import { useToast } from "@chakra-ui/react";
import { useCallback, useState } from "react";

interface UseActionOptions<R> {
    onSuccess?: (result: R) => void
    onError?: (error: Error) => void | string
}

export const useAction = <T, R>(
    action: (params: T) => Promise<Error | R>,
    options?: UseActionOptions<R>
) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const execute = useCallback(async (params: T) => {
        setLoading(true);
        try {
            const result = await action(params);
            if (result instanceof Error) {
                const errorText = options?.onError && options.onError(result);
                if(errorText){
                    toast({
                        title: "Error",
                        description: errorText,
                        status: "error",
                        position: "top-right",
                    });
                }
                return;
            }

            options?.onSuccess && options.onSuccess(result);
        }
        finally {
            setLoading(false);
        }
    }, [action, options, toast]);

    return { loading, execute };
};
