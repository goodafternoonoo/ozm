import { StyleSheet } from 'react-native';
import { colors, typography } from './GlobalStyles';

export const boardStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    headerTitle: {
        ...typography.h2,
        color: colors.text.primary,
        fontWeight: '600',
    },
    writeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.surface,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: colors.text.primary,
    },
    categoryContainer: {
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    categoryList: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    categoryTabActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryText: {
        fontSize: 14,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    categoryTextActive: {
        color: colors.text.inverse,
    },
    postList: {
        padding: 20,
    },
    postItem: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border.light,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    postHeader: {
        marginBottom: 12,
    },
    postTitle: {
        ...typography.h3,
        color: colors.text.primary,
        fontWeight: '600',
        marginBottom: 8,
    },
    postMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    postAuthor: {
        fontSize: 14,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    postDate: {
        fontSize: 12,
        color: colors.text.tertiary,
    },
    postFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    postStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    postStatText: {
        fontSize: 12,
        color: colors.text.tertiary,
        marginLeft: 4,
        marginRight: 12,
    },
}); 