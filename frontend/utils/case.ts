import { ABTestInfo } from '../types/domain';
export function abTestInfoToCamel(obj: unknown): ABTestInfo {
    if (typeof obj !== 'object' || obj === null) {
        return {
            abGroup: '',
            weightSet: {},
            recommendationType: '',
            variantId: '',
        };
    }
    const o = obj as Record<string, unknown>;
    return {
        abGroup: o.ab_group as string || '',
        weightSet: o.weight_set as Record<string, number> || {},
        recommendationType: o.recommendation_type as string || '',
        variantId: o.variant_id as string || '',
    };
}
