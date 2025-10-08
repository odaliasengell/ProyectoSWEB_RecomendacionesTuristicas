// Mock para httpClient
export const mockHttpClient = {
  notifyWebSocket: jest.fn(),
};

// Configurar mocks por defecto
export const setupDefaultMocks = () => {
  mockHttpClient.notifyWebSocket.mockResolvedValue(undefined);
};

// Limpiar mocks
export const clearAllMocks = () => {
  jest.clearAllMocks();
};