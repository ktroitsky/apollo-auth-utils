import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistCache} from 'apollo3-cache-persist';

import {useEffect, useMemo} from 'react';
import useApolloErrorLink, {
  BaseApolloErrorLinkProps,
} from './useApolloErrorLink';

const CACHE_KEY = '@apolloCache';

export interface ApolloClientProps extends BaseApolloErrorLinkProps {
  apiUri: string;
  apolloCache: InMemoryCache;
  cacheKey?: string;
  accessToken: string | undefined;
}

const useApolloClient = ({
  apolloCache,
  apiUri,
  cacheKey = CACHE_KEY,
  accessToken,
  ...apolloProps
}: ApolloClientProps) => {
  const errorLink = useApolloErrorLink({...apolloProps});

  const httpLink = useMemo(
    () =>
      createHttpLink({
        uri: apiUri,
      }),
    [apiUri],
  );

  const authLink = useMemo(() => {
    return setContext(async (_, {headers}) => ({
      headers: {
        ...headers,
        authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
    }));
  }, [accessToken]);

  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        cache: apolloCache,
        link: ApolloLink.from([errorLink, authLink, httpLink]),
        connectToDevTools: true,
      }),
    [apolloCache, authLink, errorLink, httpLink],
  );

  useEffect(() => {
    persistCache({
      cache: apolloCache,
      storage: AsyncStorage,
      debug: __DEV__,
      key: cacheKey,
    }).catch(console.error);
  }, [apolloCache, cacheKey]);

  return apolloClient;
};

export default useApolloClient;
