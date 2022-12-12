import { ApolloClient } from "apollo-client";
import { AsyncStorage } from "react-native";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { InMemoryCache } from "apollo-cache-inmemory";
import * as Config from '../config';

const httpLink = createHttpLink({
  uri: Config.SERVER_URL
  //uri: "http://192.168.1.109:3000/graphql"
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await AsyncStorage.getItem("authtoken1");
  //console.log('authtoken1: ' + token);
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      "x-auth-token": token ? `${token}` : ""
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

export default client;
