export function abTestInfoToCamel(obj: any) {
    if (!obj) return null;
    return {
        abGroup: obj.ab_group,
        weightSet: obj.weight_set,
        recommendationType: obj.recommendation_type,
    };
}
