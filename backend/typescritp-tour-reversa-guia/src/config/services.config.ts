import { config } from './environment';

export const servicesConfig = {
  pythonApi: config.services.pythonApi,
  golangApi: config.services.golangApi,
  graphqlApi: config.services.graphqlApi,
  websocketUrl: config.services.websocketUrl,
};
