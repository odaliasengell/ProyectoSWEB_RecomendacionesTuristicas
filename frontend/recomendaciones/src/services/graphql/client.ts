// Cliente GraphQL mínimo usando fetch. No requiere dependencias externas.
// evitar errores de tipo en TypeScript al usar import.meta.env
const _meta: any = import.meta;
const GRAPHQL_URL = _meta.env?.VITE_GRAPHQL_URL || (_meta.env?.VITE_API_URL ? `${_meta.env.VITE_API_URL}/graphql` : 'http://localhost:8000/graphql');

export async function graphqlRequest(query: string, variables?: Record<string, any>) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) {
    const message = Array.isArray(json.errors) ? json.errors.map((e: any) => e.message).join(', ') : json.errors;
    throw new Error(`GraphQL error: ${message}`);
  }

  return json.data;
}

export default graphqlRequest;
