import {fromPromise} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import {GraphQLError} from 'graphql';
import R from 'ramda';
import {MutableRefObject, useCallback, useMemo, useRef, useState} from 'react';

const isTokenError = (graphQLErrors: readonly GraphQLError[]) =>
  R.find(
    R.either(
      R.pathSatisfies(
        R.either(R.equals('JsonWebTokenError'), R.equals('TokenExpiredError')),
        ['extensions', 'exception', 'name'],
      ),
      (error: GraphQLError) => error.message.startsWith('Access denied!'),
    ),
    graphQLErrors,
  );

export type BaseApolloErrorLinkProps = {
  onLogin: (refreshToken: string, accessToken: string) => Promise<void>;
  onLogout: () => Promise<void>;
  onGetNewToken: () => Promise<{refreshToken: string; accessToken: string}>;
  onCheckTokenError?: (error: GraphQLError) => boolean;
};

const useApolloErrorLink = ({
  onGetNewToken,
  onLogin,
  onLogout,
  onCheckTokenError,
}: BaseApolloErrorLinkProps) => {
  const loggedOut = useRef<MutableRefObject<boolean | null>>();

  const [pendingRequests, setPendingResults] = useState<Function[]>([]);
  const isRefreshing = useRef(false);

  const resolvePendingRequests = useCallback(() => {
    pendingRequests.map((callback: unknown) => {
      typeof callback === 'function' && callback();
    });

    setPendingResults([]);
  }, [pendingRequests]);

  const errorLink = useMemo(
    () =>
      onError(({graphQLErrors, operation, forward}) => {
        if (loggedOut.current || !graphQLErrors) {
          return;
        }

        if (
          onCheckTokenError
            ? R.find(onCheckTokenError)(graphQLErrors)
            : !isTokenError(graphQLErrors)
        ) {
          return;
        }

        let forward$;

        if (!isRefreshing.current) {
          isRefreshing.current = true;

          forward$ = fromPromise(
            onGetNewToken()
              .then(async response => {
                if (loggedOut.current) {
                  throw new Error(
                    'Cannot store new tokens when user logged out',
                  );
                }

                if (response) {
                  await onLogin(response.refreshToken, response.accessToken);
                  resolvePendingRequests();
                }

                return response;
              })
              .catch(async error => {
                setPendingResults([]);
                await onLogout();
                console.log(`Update tokens error ${error}`);
                return;
              })
              .finally(() => {
                isRefreshing.current = false;
              }),
          ).filter(value => !!value);
        } else {
          forward$ = fromPromise(
            new Promise<void>(resolve => {
              pendingRequests.push(() => resolve());
            }),
          );
        }

        return forward$.flatMap((payload: any) => {
          if (payload && payload.accessToken) {
            operation.setContext({
              headers: {
                ...operation.getContext().headers,
                Authorization: `Bearer ${payload.accessToken}`,
              },
            });
          }

          return forward(operation);
        });
      }),
    [
      onCheckTokenError,
      onGetNewToken,
      onLogin,
      resolvePendingRequests,
      onLogout,
      pendingRequests,
    ],
  );

  return errorLink;
};

export default useApolloErrorLink;
