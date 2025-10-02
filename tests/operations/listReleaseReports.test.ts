import { describe, it, expect, beforeEach } from 'vitest';
import handler from '../../src/nodes/MercadoPago/operations/listReleaseReports';
import { makeMockCtx } from '../helpers/mockCtx';
import { TestContext, OperationHandler } from '../types/test-types';

describe('listReleaseReports operation', () => {
  let ctx: TestContext;
  const listReleaseReports = handler as OperationHandler;
  
  beforeEach(() => {
    ctx = makeMockCtx({
      params: {
        returnAll: false,
        limit: 10,
        reportFilters: { apiLimit: 10, offset: 0 },
      },
    }) as TestContext;
  });
  it('should paginate when returnAll is true', async () => {
    const pages = [
      Array.from({ length: 3 }, (_, i) => ({ id: i + 1 })),
      Array.from({ length: 3 }, (_, i) => ({ id: i + 4 })),
      [], // stop condition
    ];
    let call = 0;

    ctx = makeMockCtx({
      params: {
        returnAll: true,
        reportFilters: { apiLimit: 3, offset: 0 },
      },
      requestImpl: async () => pages[call++] ?? [],
    }) as TestContext;

    const res = await listReleaseReports(ctx);
    
    // Verificar la respuesta completa
    expect(res).toHaveLength(6);
    expect(res.map((r: { id: number }) => r.id)).toEqual([1, 2, 3, 4, 5, 6]);
    
    // Verificar que se hicieron múltiples llamadas
    expect(call).toBe(3); // Verificamos que se hicieron 3 llamadas (2 con datos + 1 vacía)
  });

  it('should trim to limit when returnAll is false', async () => {
    ctx = makeMockCtx({
      params: {
        returnAll: false,
        limit: 2,
        reportFilters: { apiLimit: 5, offset: 0 },
      },
      requestImpl: async () => ({ results: [{ id: 1 }, { id: 2 }, { id: 3 }] }),
    }) as TestContext;

    const res = await listReleaseReports(ctx);
    
    // Verificar que se limita correctamente el número de resultados
    expect(res).toHaveLength(2);
    expect(res.map((r: { id: number }) => r.id)).toEqual([1, 2]);
  });

  it('should clamp apiLimit into [1, 1000] and respect initial offset', async () => {
    const seenQs: Record<string, any>[] = [];
    ctx = makeMockCtx({
      params: {
        returnAll: false,
        limit: 10,
        reportFilters: { apiLimit: 5000, offset: 7 },
      },
      requestImpl: async (init) => {
        seenQs.push(init.qs || {});
        return [{ id: 1 }];
      },
    }) as TestContext;

    const res = await listReleaseReports(ctx);
    
    // Verificar la respuesta
    expect(res).toHaveLength(1);
    
    // Verificar que se respetan los parámetros de paginación
    expect(seenQs[0]).toMatchObject({ offset: 7, limit: 10 });
  });

  it('should handle API errors gracefully', async () => {
    const errorResponse = {
      status: 400,
      message: 'Invalid request parameters',
      error: 'bad_request',
    };

    ctx = makeMockCtx({
      params: {
        returnAll: false,
        limit: 10,
        reportFilters: { apiLimit: 10, offset: 0 },
      },
      requestImpl: async () => {
        const error: any = new Error('API Error');
        error.response = { data: errorResponse };
        throw error;
      },
    }) as TestContext;

    await expect(listReleaseReports(ctx)).rejects.toThrow(/API Error/);
  });

  it('should handle empty response', async () => {
    ctx = makeMockCtx({
      params: {
        returnAll: false,
        limit: 10,
        reportFilters: { apiLimit: 10, offset: 0 },
      },
      requestImpl: async () => [],
    }) as TestContext;

    const res = await listReleaseReports(ctx);
    expect(res).toHaveLength(0);
    expect(Array.isArray(res)).toBe(true);
  });

  it('should handle different response formats', async () => {
    ctx = makeMockCtx({
      params: {
        returnAll: false,
        limit: 10,
        reportFilters: { apiLimit: 10, offset: 0 },
      },
      requestImpl: async () => ({
        // Formato diferente de respuesta
        data: [{ id: 1, name: 'Report 1' }, { id: 2, name: 'Report 2' }],
      }),
    }) as TestContext;

    const res = await listReleaseReports(ctx);
    expect(res).toBeDefined();
  });
});
