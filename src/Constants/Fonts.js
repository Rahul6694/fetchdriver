// import { Platform } from 'react-native';

// export const Fonts = {
//     Inter_Light: Platform.select({
//         ios: 'Poppins-Light',
//         android: 'Inter_18pt-Light',
//     }),
//     Inter_Bold: Platform.select({
//         ios: 'Poppins-Bold',
//         android: 'Inter_18pt-Bold',
//     }),
//     Inter_Medium: Platform.select({
//         ios: 'Poppins-Medium',
//         android: 'Inter_18pt-Medium',
//     }),
//     Inter_Regular: Platform.select({
//         ios: 'Poppins-Regular',
//         android: 'Inter_18pt-Regular',
//     }),
//     Inter_SemiBold: Platform.select({
//         ios: 'Poppins-SemiBold',
//         android: 'Inter_18pt-SemiBold',
//     }),
// };

import { Platform } from 'react-native';

export const Fonts = {
    Inter_Light: Platform.select({
        ios: 'Poppins-Light',
        android: 'Poppins-Light',
    }),
    Inter_Bold: Platform.select({
        ios: 'Poppins-Bold',
        android: 'Poppins-Bold',
    }),
    Inter_Medium: Platform.select({
        ios: 'Poppins-Medium',
        android: 'Poppins-Medium',
    }),
    Inter_Regular: Platform.select({
        ios: 'Poppins-Regular',
        android: 'Poppins-Regular',
    }),
    Inter_SemiBold: Platform.select({
        ios: 'Poppins-SemiBold',
        android: 'Poppins-SemiBold',
    }),
};
